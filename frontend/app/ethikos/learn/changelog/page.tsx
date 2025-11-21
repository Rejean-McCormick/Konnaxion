'use client';

// Updated from original implementation in app/ethikos/learn/changelog/page.tsx.
import React, { useMemo, useState } from 'react';
import {
  PageContainer,
  ProCard,
  ProList,
  StatisticCard,
} from '@ant-design/pro-components';
import {
  Anchor,
  Badge,
  Button,
  DatePicker,
  Empty,
  Input,
  Segmented,
  Space,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  ReloadOutlined,
  UnorderedListOutlined,
  ApartmentOutlined,
  DownloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import dayjs, { Dayjs } from 'dayjs';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchChangelog, type ChangelogEntry } from '@/services/learn';
import EthikosPageShell from '../../EthikosPageShell';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

type RangeValue = [Dayjs | null, Dayjs | null] | null;

// Local response type matching services/learn.ts
type ChangelogResponse = {
  entries: ChangelogEntry[];
};

const TAG_COLOR: Record<string, string> = {
  NEW: 'green',
  FIX: 'blue',
  IMPROVE: 'geekblue',
  DOCS: 'gold',
  CHORE: 'default',
  BREAKING: 'red',
  DEPRECATE: 'volcano',
  INITIAL: 'purple',
};

function normalizeTag(t: string): string {
  return t.trim().toUpperCase();
}

export default function Changelog() {
  // Kept for compatibility; EthikosPageShell will set the final <title>.
  usePageTitle('Learn · Changelog');

  const { data, loading, error, refresh } = useRequest<ChangelogResponse, []>(
    fetchChangelog,
  );

  // Raw entries
  const entries: ChangelogEntry[] = data?.entries ?? [];

  // Sort newest → oldest
  const sortedEntries = useMemo<ChangelogEntry[]>(
    () =>
      [...entries].sort(
        (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
      ),
    [entries],
  );

  // Derive available tags (normalized)
  const allTags = useMemo<string[]>(
    () =>
      Array.from(
        new Set(
          sortedEntries.flatMap((e: ChangelogEntry) =>
            e.tags.map((t: string) => normalizeTag(t)),
          ),
        ),
      ).sort(),
    [sortedEntries],
  );

  // Derive versions (keep order of first appearance in sorted list)
  const allVersions = useMemo<string[]>(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const e of sortedEntries) {
      if (!seen.has(e.version)) {
        seen.add(e.version);
        out.push(e.version);
      }
    }
    return out;
  }, [sortedEntries]);

  // UI state
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<RangeValue>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [view, setView] = useState<'timeline' | 'list'>('timeline');

  // Filtered list
  const filtered = useMemo<ChangelogEntry[]>(() => {
    let list: ChangelogEntry[] = sortedEntries;

    // text search (version or notes)
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((e: ChangelogEntry) => {
        if (e.version.toLowerCase().includes(q)) return true;
        return e.notes.some((n: string) => n.toLowerCase().includes(q));
      });
    }

    // tag filter (OR)
    if (selectedTags.length > 0) {
      const allow = new Set(selectedTags.map(normalizeTag));
      list = list.filter((e: ChangelogEntry) =>
        e.tags.map(normalizeTag).some((t: string) => allow.has(t)),
      );
    }

    // date range (inclusive)
    if (range && range[0] && range[1]) {
      const start = range[0].startOf('day').valueOf();
      const end = range[1].endOf('day').valueOf();
      list = list.filter((e: ChangelogEntry) => {
        const t = dayjs(e.date).valueOf();
        return t >= start && t <= end;
      });
    }

    return list;
  }, [sortedEntries, query, selectedTags, range]);

  // Stats
  const totalEntries = filtered.length;
  const versionCount = useMemo(
    () => new Set(filtered.map((e) => e.version)).size,
    [filtered],
  );
  const tagCounts = useMemo<[string, number][]>(() => {
    const m = new Map<string, number>();
    for (const e of filtered) {
      for (const t of e.tags) {
        const k = normalizeTag(t);
        m.set(k, (m.get(k) ?? 0) + 1);
      }
    }
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4); // top 4
  }, [filtered]);

  const lastUpdated = useMemo(() => {
    if (!sortedEntries.length) return null;
    return dayjs(sortedEntries[0].date).format('YYYY-MM-DD');
  }, [sortedEntries]);

  // Utilities
  function exportJSON() {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ethikos-changelog.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyMarkdown() {
    const md = filtered
      .map(
        (e: ChangelogEntry) =>
          `### ${e.version} — ${dayjs(e.date).format('YYYY-MM-DD')}\n` +
          e.notes.map((n: string) => `- ${n}`).join('\n'),
      )
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(md);
    } catch {
      // no-op
    }
  }

  // Render helpers
  function renderTags(tags: string[]) {
    return (
      <Space size={[4, 4]} wrap>
        {tags.map((t: string) => {
          const key = normalizeTag(t);
          const color = TAG_COLOR[key] ?? 'default';
          return (
            <Tag key={key} color={color}>
              {key}
            </Tag>
          );
        })}
      </Space>
    );
  }

  // Anchor for versions (filtered)
  const anchorItems =
    filtered.length > 0
      ? Array.from(new Set(filtered.map((e) => e.version))).map((v) => ({
          key: v,
          href: `#ver-${v}`,
          title: v,
        }))
      : [];

  const shellTitle = 'Learn · Changelog';
  const shellSubtitle =
    'Versioned changes, fixes and improvements across the Ethikos layer.';
  const shellSectionLabel = 'Learn';

  const compactActions = (
    <Space>
      {lastUpdated && (
        <Badge
          count={
            <Tooltip title={`Last entry date ${lastUpdated}`}>
              <ClockCircleOutlined style={{ color: '#52c41a' }} />
            </Tooltip>
          }
        />
      )}
      <Button icon={<ReloadOutlined />} onClick={refresh} type="text" />
    </Space>
  );

  const fullActions = (
    <Space wrap>
      {lastUpdated && (
        <Badge
          count={
            <Tooltip title={`Last entry date ${lastUpdated}`}>
              <ClockCircleOutlined style={{ color: '#52c41a' }} />
            </Tooltip>
          }
        />
      )}

      <Segmented
        value={view}
        onChange={(val) => setView(val as typeof view)}
        options={[
          { label: 'Timeline', value: 'timeline', icon: <CalendarOutlined /> },
          { label: 'List', value: 'list', icon: <UnorderedListOutlined /> },
        ]}
      />

      <Tooltip title="Export JSON">
        <Button icon={<DownloadOutlined />} onClick={exportJSON} size="small" />
      </Tooltip>

      <Tooltip title="Copy Markdown">
        <Button icon={<CopyOutlined />} onClick={copyMarkdown} size="small" />
      </Tooltip>

      <Tooltip title="Refresh">
        <Button icon={<ReloadOutlined />} onClick={refresh} size="small" />
      </Tooltip>
    </Space>
  );

  // Loading / error / empty
  if (loading && !data) {
    return (
      <EthikosPageShell
        title={shellTitle}
        sectionLabel={shellSectionLabel}
        subtitle={shellSubtitle}
      >
        <PageContainer ghost loading>
          <div style={{ height: 240 }} />
        </PageContainer>
      </EthikosPageShell>
    );
  }

  if (error) {
    return (
      <EthikosPageShell
        title={shellTitle}
        sectionLabel={shellSectionLabel}
        subtitle={shellSubtitle}
        secondaryActions={compactActions}
      >
        <PageContainer ghost>
          <Empty description="Failed to load changelog." />
        </PageContainer>
      </EthikosPageShell>
    );
  }

  if (!filtered.length && !loading) {
    return (
      <EthikosPageShell
        title={shellTitle}
        sectionLabel={shellSectionLabel}
        subtitle={shellSubtitle}
        secondaryActions={compactActions}
      >
        <PageContainer ghost>
          <ProCard>
            <Empty description="No changelog entries match your filters." />
          </ProCard>
        </PageContainer>
      </EthikosPageShell>
    );
  }

  return (
    <EthikosPageShell
      title={shellTitle}
      sectionLabel={shellSectionLabel}
      subtitle={shellSubtitle}
      secondaryActions={fullActions}
    >
      <PageContainer ghost loading={loading}>
        {/* KPI / stats */}
        <ProCard gutter={[16, 16]} wrap style={{ marginBottom: 16 }}>
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 8, xl: 6 }}
            statistic={{
              title: 'Entries',
              value: totalEntries,
              description: <Text type="secondary">After filters</Text>,
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 8, xl: 6 }}
            statistic={{
              title: 'Versions',
              value: versionCount,
              description: <Text type="secondary">In current view</Text>,
            }}
          />
          {tagCounts.map(([tag, count]) => (
            <StatisticCard
              key={tag}
              colSpan={{ xs: 24, sm: 12, md: 8, xl: 6 }}
              statistic={{
                title: (
                  <Space>
                    <Tag color={TAG_COLOR[tag] ?? 'default'}>{tag}</Tag>
                  </Space>
                ),
                value: count,
                description: <Text type="secondary">Entries with tag</Text>,
              }}
            />
          ))}
        </ProCard>

        {/* Filters + content */}
        <ProCard split="vertical" ghost>
          {/* Left: filters + anchors */}
          <ProCard
            colSpan={{ xs: 24, md: 8, lg: 7, xl: 6 }}
            title={
              <Space>
                <FilterOutlined />
                <span>Filter</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text type="secondary">Search</Text>
                <Input.Search
                  placeholder="Version or note text…"
                  allowClear
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              </div>

              <div>
                <Text type="secondary">Date range</Text>
                <div style={{ marginTop: 8 }}>
                  <RangePicker
                    allowEmpty={[true, true]}
                    value={range as any}
                    onChange={(val) => setRange(val as RangeValue)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <Text type="secondary">Tags</Text>
                <div style={{ marginTop: 8 }}>
                  <Space size={[6, 8]} wrap>
                    {allTags.length === 0 ? (
                      <Text type="secondary">No tags</Text>
                    ) : (
                      allTags.map((t: string) => (
                        <Tag.CheckableTag
                          key={t}
                          checked={selectedTags.includes(t)}
                          onChange={(checked) => {
                            setSelectedTags((prev) =>
                              checked
                                ? [...prev, t]
                                : prev.filter((p) => p !== t),
                            );
                          }}
                        >
                          <Tag
                            color={TAG_COLOR[t] ?? 'default'}
                            style={{ marginRight: 0 }}
                          >
                            {t}
                          </Tag>
                        </Tag.CheckableTag>
                      ))
                    )}
                  </Space>
                </div>
              </div>

              <div>
                <Text type="secondary">Versions</Text>
                <Anchor
                  affix={false}
                  items={anchorItems}
                  style={{ marginTop: 8, maxHeight: 320, overflow: 'auto' }}
                />
              </div>
            </Space>
          </ProCard>

          {/* Right: content */}
          <ProCard
            colSpan={{ xs: 24, md: 16, lg: 17, xl: 18 }}
            title={
              <Space>
                {view === 'timeline' ? (
                  <ApartmentOutlined />
                ) : (
                  <UnorderedListOutlined />
                )}
                <span>Changelog entries</span>
              </Space>
            }
          >
            {view === 'timeline' ? (
              <Timeline mode="left">
                {filtered.map((e: ChangelogEntry, idx: number) => {
                  const id = `ver-${e.version}`;
                  return (
                    <Timeline.Item
                      key={`${e.version}-${e.date}-${idx}`}
                      label={dayjs(e.date).format('YYYY-MM-DD')}
                      dot={<CalendarOutlined />}
                    >
                      <div id={id} style={{ scrollMarginTop: 72 }}>
                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: '100%' }}
                        >
                          <Space size="small" align="center" wrap>
                            <Title level={5} style={{ margin: 0 }}>
                              {e.version}
                            </Title>
                            {renderTags(e.tags)}
                          </Space>
                          <ul style={{ marginTop: 4 }}>
                            {e.notes.map((n: string, i: number) => (
                              <li key={i}>
                                <Text>{n}</Text>
                              </li>
                            ))}
                          </ul>
                        </Space>
                      </div>
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            ) : (
              <ProList<ChangelogEntry>
                rowKey={(row, idx) => `${row.version}-${row.date}-${idx}`}
                dataSource={filtered}
                split
                pagination={{ pageSize: 10, showSizeChanger: false }}
                metas={{
                  title: {
                    render: (_dom, row) => (
                      <Space size="small" wrap>
                        <Text strong>{row.version}</Text>
                        <Tag icon={<CalendarOutlined />}>
                          {dayjs(row.date).format('YYYY-MM-DD')}
                        </Tag>
                      </Space>
                    ),
                  },
                  subTitle: {
                    render: (_dom, row) => renderTags(row.tags),
                  },
                  description: {
                    render: (_dom, row) => (
                      <ul style={{ marginTop: 4 }}>
                        {row.notes.map((n: string, i: number) => (
                          <li key={i}>
                            <Text>{n}</Text>
                          </li>
                        ))}
                      </ul>
                    ),
                  },
                }}
              />
            )}
          </ProCard>
        </ProCard>
      </PageContainer>
    </EthikosPageShell>
  );
}
