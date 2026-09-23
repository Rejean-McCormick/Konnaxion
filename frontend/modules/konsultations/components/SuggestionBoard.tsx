// FILE: frontend/modules/konsultations/components/SuggestionBoard.tsx
﻿// frontend/modules/konsultations/components/SuggestionBoard.tsx
'use client';

import TranslatedText from '@/components/i18n/TranslatedText';
import { useLanguage } from '@/context/LanguageContext';
import {
  DislikeOutlined,
  FilterOutlined,
  LikeOutlined,
  PlusOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  List,
  Radio,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useMemo, useState } from 'react';

const { Text, Paragraph } = Typography;

export type SuggestionStatus =
  | 'new'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'implemented';

export interface Suggestion {
  id: string;
  body: string;
  createdAt: string;
  authorName?: string | null;
  upvotes: number;
  downvotes?: number;
  score?: number; // optional aggregated score (e.g. weighted support)
  status?: SuggestionStatus;
  tags?: string[];
}

export interface SuggestionBoardProps {
  /** Suggestions to display for the current consultation */
  suggestions: Suggestion[];

  /** Optional loading / error flags from the data‑fetching layer */
  isLoading?: boolean;
  errorMessage?: string | null;

  /** Enable/disable interactions */
  allowVoting?: boolean;
  allowNewSuggestions?: boolean;

  /** Optional limit for new suggestion length (characters) */
  maxLength?: number;

  /** Called when the user submits a new suggestion */
  onCreateSuggestion?: (body: string) => Promise<void> | void;

  /** Called when the user upvotes a suggestion */
  onUpvote?: (id: string) => Promise<void> | void;

  /** Called when the user downvotes a suggestion */
  onDownvote?: (id: string) => Promise<void> | void;
}

type SortMode = 'top' | 'recent';

const DEFAULT_MAX_LENGTH = 800;

function statusTag(status?: SuggestionStatus) {
  if (!status) return null;

  switch (status) {
    case 'new':
      return <Tag color="default"><TranslatedText id="ui.konsultations.suggestionboard.new" /></Tag>;
    case 'under_review':
      return <Tag color="processing"><TranslatedText id="ui.konsultations.suggestionboard.underReview" /></Tag>;
    case 'accepted':
      return <Tag color="green"><TranslatedText id="ui.konsultations.suggestionboard.accepted" /></Tag>;
    case 'implemented':
      return <Tag color="blue"><TranslatedText id="ui.konsultations.suggestionboard.implemented" /></Tag>;
    case 'rejected':
      return <Tag color="red"><TranslatedText id="ui.konsultations.suggestionboard.rejected" /></Tag>;
    default:
      return null;
  }
}

function truncate(text: string, max = 200): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

const SuggestionBoard: React.FC<SuggestionBoardProps> = ({
  suggestions,
  isLoading,
  errorMessage,
  allowVoting = true,
  allowNewSuggestions = true,
  maxLength = DEFAULT_MAX_LENGTH,
  onCreateSuggestion,
  onUpvote,
  onDownvote,
}) => {
  const { t: i18nT } = useLanguage();
  const [sortMode, setSortMode] = useState<SortMode>('top');
  const [statusFilter, setStatusFilter] = useState<'all' | SuggestionStatus>('all');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const normalizedSearch = search.trim().toLowerCase();

  const visibleSuggestions = useMemo(() => {
    let items = suggestions.slice();

    if (statusFilter !== 'all') {
      items = items.filter((s) => s.status === statusFilter);
    }

    if (normalizedSearch) {
      items = items.filter((s) => {
        const haystack = `${s.body} ${s.authorName ?? ''}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    items.sort((a, b) => {
      if (sortMode === 'recent') {
        const ta = new Date(a.createdAt).getTime() || 0;
        const tb = new Date(b.createdAt).getTime() || 0;
        return tb - ta;
      }

      const scoreA =
        typeof a.score === 'number'
          ? a.score
          : a.upvotes - (typeof a.downvotes === 'number' ? a.downvotes : 0);
      const scoreB =
        typeof b.score === 'number'
          ? b.score
          : b.upvotes - (typeof b.downvotes === 'number' ? b.downvotes : 0);

      if (scoreB !== scoreA) return scoreB - scoreA;

      // tie‑break by recency
      const ta = new Date(a.createdAt).getTime() || 0;
      const tb = new Date(b.createdAt).getTime() || 0;
      return tb - ta;
    });

    return items;
  }, [suggestions, sortMode, statusFilter, normalizedSearch]);

  const handleSubmit = async () => {
    const body = draft.trim();
    if (!body) {
      setLocalError('Please write a suggestion before submitting.');
      return;
    }
    if (body.length > maxLength) {
      setLocalError(`Suggestions are limited to ${maxLength} characters.`);
      return;
    }
    if (!onCreateSuggestion) {
      setLocalError('Suggestion submission is not available.');
      return;
    }

    try {
      setLocalError(null);
      setSubmitting(true);
      await onCreateSuggestion(body);
      setDraft('');
    } catch (err) {
       
      console.error('Failed to submit suggestion', err);
      setLocalError('Unable to submit your suggestion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (id: string) => {
    if (!allowVoting || !onUpvote) return;
    try {
      await onUpvote(id);
    } catch (err) {
       
      console.error('Failed to upvote suggestion', err);
    }
  };

  const handleDownvote = async (id: string) => {
    if (!allowVoting || !onDownvote) return;
    try {
      await onDownvote(id);
    } catch (err) {
       
      console.error('Failed to downvote suggestion', err);
    }
  };

  const hasAnySuggestions = suggestions.length > 0;

  return (
    <Card
      title={i18nT("ui.konsultations.suggestionboard.suggestions")}
      extra={
        <Space size="middle" wrap>
          <Space>
            <FilterOutlined />
            <Radio.Group
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <Radio.Button value="all">{i18nT("ui.konsultations.suggestionboard.all")}</Radio.Button>
              <Radio.Button value="new">{i18nT("ui.konsultations.suggestionboard.new")}</Radio.Button>
              <Radio.Button value="under_review">{i18nT("ui.konsultations.suggestionboard.underReview")}</Radio.Button>
              <Radio.Button value="accepted">{i18nT("ui.konsultations.suggestionboard.accepted")}</Radio.Button>
              <Radio.Button value="implemented">{i18nT("ui.konsultations.suggestionboard.implemented")}</Radio.Button>
              <Radio.Button value="rejected">{i18nT("ui.konsultations.suggestionboard.rejected")}</Radio.Button>
            </Radio.Group>
          </Space>

          <Space>
            {sortMode === 'top' ? (
              <Tooltip title={i18nT("ui.konsultations.suggestionboard.sortedByHighestSupportFirst")}>
                <Button
                  size="small"
                  type="text"
                  icon={<SortDescendingOutlined />}
                  onClick={() => setSortMode('recent')}
                >
                  {i18nT("ui.konsultations.suggestionboard.top")}
                </Button>
              </Tooltip>
            ) : (
              <Tooltip title={i18nT("ui.konsultations.suggestionboard.sortedByMostRecentFirst")}>
                <Button
                  size="small"
                  type="text"
                  icon={<SortAscendingOutlined />}
                  onClick={() => setSortMode('top')}
                >
                  {i18nT("ui.konsultations.suggestionboard.recent")}
                </Button>
              </Tooltip>
            )}
          </Space>

          <Input.Search
            allowClear
            size="small"
            placeholder={i18nT("ui.konsultations.suggestionboard.searchSuggestions")}
            style={{ width: 220 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Space>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {(errorMessage || localError) && (
          <Alert
            type="error"
            showIcon
            message={errorMessage || localError}
          />
        )}

        {allowNewSuggestions && (
          <div>
            <Paragraph type="secondary" style={{ marginBottom: 8 }}>
              {i18nT("ui.konsultations.suggestionboard.proposeAConcreteChangeAmendmentOrIdea")}
            </Paragraph>
            <Input.TextArea
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={i18nT("ui.konsultations.suggestionboard.writeYourSuggestion")}
              maxLength={maxLength}
              showCount
            />
            <Space style={{ marginTop: 8, width: '100%', justifyContent: 'space-between' }}>
              <Text type="secondary">
                {draft.trim().length === 0
                  ? i18nT("ui.konsultations.suggestionboard.suggestionsMayBeModeratedAccordingToEthikos")
                  : i18nT("ui.konsultations.suggestionboard.characters", { length: draft.length, maxLength: maxLength })}
              </Text>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleSubmit}
                loading={submitting}
                disabled={submitting || draft.trim().length === 0}
              >
                {i18nT("ui.konsultations.suggestionboard.submitSuggestion")}
              </Button>
            </Space>
          </div>
        )}

        {!hasAnySuggestions && !isLoading && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={i18nT("ui.konsultations.suggestionboard.noSuggestionsYetBeTheFirstTo")}
          />
        )}

        {hasAnySuggestions && (
          <List<Suggestion>
            itemLayout="vertical"
            dataSource={visibleSuggestions}
            renderItem={(item) => {
              const netScore =
                typeof item.score === 'number'
                  ? item.score
                  : item.upvotes - (typeof item.downvotes === 'number' ? item.downvotes : 0);

              return (
                <List.Item
                  key={item.id}
                  extra={
                    allowVoting && (
                      <Space direction="vertical" align="center">
                        <Tooltip title={i18nT("ui.konsultations.suggestionboard.iSupportThis")}>
                          <Button
                            size="small"
                            icon={<LikeOutlined />}
                            onClick={() => handleUpvote(item.id)}
                          >
                            {item.upvotes}
                          </Button>
                        </Tooltip>
                        <Tooltip title={i18nT("ui.konsultations.suggestionboard.iDoNotSupportThis")}>
                          <Button
                            size="small"
                            icon={<DislikeOutlined />}
                            onClick={() => handleDownvote(item.id)}
                          >
                            {item.downvotes ?? 0}
                          </Button>
                        </Tooltip>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {i18nT("ui.konsultations.suggestionboard.net")} {netScore}
                        </Text>
                      </Space>
                    )
                  }
                >
                  <List.Item.Meta
                    title={
                      <Space wrap>
                        <Text strong>{i18nT("ui.konsultations.suggestionboard.suggestion")}</Text>
                        {statusTag(item.status)}
                        {Array.isArray(item.tags) &&
                          item.tags.map((t) => (
                            <Tag key={t} color="default">
                              {t}
                            </Tag>
                          ))}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={2}>
                        <Text type="secondary">
                          {item.authorName || i18nT("ui.konsultations.suggestionboard.anonymous")} ·{' '}
                          {new Date(item.createdAt).toLocaleString()}
                        </Text>
                      </Space>
                    }
                  />
                  <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                    {truncate(item.body, 600)}
                  </Paragraph>
                </List.Item>
              );
            }}
          />
        )}
      </Space>
    </Card>
  );
};

export default SuggestionBoard;
