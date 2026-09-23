// FILE: frontend/app/search/GlobalSearchClient.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  Alert,
  Card,
  Empty,
  Input,
  List,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import type { TabsProps } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useWorld } from '@/context/WorldContext';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

type SearchResult = {
  id: string;
  title: string;
  snippet: string;
  path: string;
};

type SearchResponseBody = { results: SearchResult[] } | { error: string };

const MIN_QUERY_LENGTH = 2;

export default function GlobalSearchClient() {
  const { t: i18nT } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { worldKey, href } = useWorld();

  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const initialQuery = searchParams.get('q') ?? '';

  const runSearch = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      setError(null);

      if (!trimmed) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      if (trimmed.length < MIN_QUERY_LENGTH) {
        setResults([]);
        setHasSearched(false);
        setError(`Type at least ${MIN_QUERY_LENGTH} characters to search.`);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        const pageParams = new URLSearchParams();
        pageParams.set('q', trimmed);
        router.replace(href(`/search?${pageParams.toString()}`));

        const apiParams = new URLSearchParams(pageParams);
        if (worldKey) apiParams.set('world', worldKey);

        const res = await fetch(`/_api/search?${apiParams.toString()}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
          let message = `Search failed with status ${res.status}.`;
          try {
            const data = (await res.json()) as SearchResponseBody;
            if ('error' in data && typeof data.error === 'string') {
              message = data.error;
            }
          } catch {
            // Keep the status-derived fallback message.
          }
          setResults([]);
          setError(message);
          return;
        }

        const data = (await res.json()) as SearchResponseBody;
        setResults('results' in data && Array.isArray(data.results) ? data.results : []);
      } catch {
        setResults([]);
        setError(i18nT("ui.search.globalsearchclient.unableToPerformSearchPleaseTryAgain"));
      } finally {
        setLoading(false);
      }
    },
    [href, router, worldKey, i18nT],
  );

  useEffect(() => {
    if (!initialQuery) return;
    setQuery(initialQuery);
    if (initialQuery.trim().length >= MIN_QUERY_LENGTH) {
      void runSearch(initialQuery);
    }
  }, [initialQuery, runSearch]);

  const handleSearch = (value: string) => {
    setQuery(value);
    void runSearch(value);
  };

  const handleResultClick = (item: SearchResult) => {
    const target = item.path;
    if (!target) return;

    if (target.startsWith('http://') || target.startsWith('https://')) {
      window.open(target, '_blank', 'noopener,noreferrer');
      return;
    }

    router.push(href(target));
  };

  const getTypeTag = (id: string) => {
    if (id.startsWith('route:')) return <Tag>{i18nT("ui.search.globalsearchclient.route")}</Tag>;
    if (id.startsWith('knowledge:')) return <Tag>{i18nT("ui.search.globalsearchclient.knowledge")}</Tag>;
    return <Tag>{i18nT("ui.search.globalsearchclient.other")}</Tag>;
  };

  const renderList = (items: SearchResult[]) => {
    if (!items.length) return <Empty description={i18nT("ui.search.globalsearchclient.noResults")} />;

    return (
      <List
        itemLayout="vertical"
        dataSource={items}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            onClick={() => handleResultClick(item)}
            style={{ cursor: 'pointer' }}
          >
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space align="baseline" size="small">
                <Text strong>{item.title}</Text>
                {getTypeTag(item.id)}
              </Space>
              <Text type="secondary">{item.snippet}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {worldKey && !/^https?:\/\//i.test(item.path)
                  ? href(item.path)
                  : item.path}
              </Text>
            </Space>
          </List.Item>
        )}
      />
    );
  };

  const { routeResults, knowledgeResults, otherResults } = useMemo(() => {
    const route = results.filter((result) => result.id.startsWith('route:'));
    const knowledge = results.filter((result) => result.id.startsWith('knowledge:'));
    const other = results.filter(
      (result) =>
        !result.id.startsWith('route:') && !result.id.startsWith('knowledge:'),
    );

    return {
      routeResults: route,
      knowledgeResults: knowledge,
      otherResults: other,
    };
  }, [results]);

  const tabs: TabsProps['items'] = useMemo(
    () => [
      { key: 'all', label: i18nT("ui.search.globalsearchclient.all", { length: results.length }), children: renderList(results) },
      {
        key: 'routes',
        label: i18nT("ui.search.globalsearchclient.navigation", { length: routeResults.length }),
        children: renderList(routeResults),
      },
      {
        key: 'knowledge',
        label: i18nT("ui.search.globalsearchclient.learning", { length: knowledgeResults.length }),
        children: renderList(knowledgeResults),
      },
      {
        key: 'other',
        label: i18nT("ui.search.globalsearchclient.other_a4538e", { length: otherResults.length }),
        children: renderList(otherResults),
      },
    ],
    [results, routeResults, knowledgeResults, otherResults, i18nT],
  );

  return (
    <div className="container mx-auto p-5" style={{ maxWidth: 1200 }}>
      <div className="mb-4">
        <Title level={2}>{i18nT("ui.search.globalsearchclient.krowdNavigator")}</Title>
        <Paragraph type="secondary">
          {i18nT("ui.search.globalsearchclient.globalSearchAcrossRoutesAndKonnectedKnowledge")}
        </Paragraph>
      </div>

      <Card className="mb-4">
        <Search
          placeholder={i18nT("ui.search.globalsearchclient.searchTopicsPagesAndLearningResources")}
          allowClear
          enterButton={i18nT("ui.search.globalsearchclient.search")}
          size="large"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onSearch={handleSearch}
        />
        {!hasSearched && !error && (
          <Paragraph type="secondary" style={{ marginTop: 12 }}>
            {i18nT("ui.search.globalsearchclient.tipStartTypingAModuleNameEkoh")}
          </Paragraph>
        )}
      </Card>

      {error && (
        <Alert
          type="error"
          message={i18nT("ui.search.globalsearchclient.searchError")}
          description={error}
          showIcon
          className="mb-4"
        />
      )}

      <Card>
        {loading ? (
          <div
            style={{
              padding: '40px 0',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Spin size="large" />
          </div>
        ) : !hasSearched && !results.length ? (
          <Empty
            description={i18nT("ui.search.globalsearchclient.typeAQueryAboveToSearchAcross")}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Tabs items={tabs} />
        )}
      </Card>
    </div>
  );
}
