// FILE: frontend/app/kreative/traditions-archive/page.tsx
// app/kreative/traditions-archive/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Tag,
  Typography,
  Space,
  Button,
  Badge,
  Timeline,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import KreativePageShell from '@/app/kreative/kreativePageShell';

const { Text, Paragraph, Title } = Typography;

type TraditionStatus = 'Endangered' | 'Vulnerable' | 'Thriving';

interface Tradition {
  id: string;
  name: string;
  region: string;
  category: string;
  community: string;
  status: TraditionStatus;
  yearDocumented: number;
  lastUpdated: string;
  description: string;
  tags: string[];
}

// Demo data – can later be wired to API
const TRADITIONS: Tradition[] = [
  {
    id: '1',
    name: 'Solstice Lantern Walk',
    region: 'Northern Europe',
    category: 'Seasonal Festival',
    community: 'Riverhaven Collective',
    status: 'Thriving',
    yearDocumented: 2021,
    lastUpdated: '2025-09-15',
    description:
      'Community lantern walk marking the winter solstice, followed by shared storytelling and music.',
    tags: ['solstice', 'community', 'music'],
  },
  {
    id: '2',
    name: 'Ancestral Weaving Circle',
    region: 'Andean Region',
    category: 'Craft & Textile',
    community: 'Quechua Weavers Network',
    status: 'Endangered',
    yearDocumented: 2018,
    lastUpdated: '2025-07-02',
    description:
      'Monthly gathering where elders teach traditional weaving patterns and symbolism to younger members.',
    tags: ['weaving', 'intergenerational', 'craft'],
  },
  {
    id: '3',
    name: 'Moonrise Drum Ceremony',
    region: 'West Africa',
    category: 'Music & Ritual',
    community: 'Kora Valley Ensemble',
    status: 'Vulnerable',
    yearDocumented: 2019,
    lastUpdated: '2025-08-10',
    description:
      'Drumming, call-and-response singing, and communal dance to welcome the first full moon of the season.',
    tags: ['drums', 'dance', 'ritual'],
  },
  {
    id: '4',
    name: 'Harvest Story Night',
    region: 'North America',
    category: 'Storytelling',
    community: 'Prairie Commons',
    status: 'Thriving',
    yearDocumented: 2020,
    lastUpdated: '2025-06-01',
    description:
      'Evening of shared harvest stories, recipes, and memory-keeping around a communal table.',
    tags: ['harvest', 'food', 'stories'],
  },
  {
    id: '5',
    name: 'River Blessing Ceremony',
    region: 'South Asia',
    category: 'Environmental Ritual',
    community: 'Sundar Nagar Cooperative',
    status: 'Endangered',
    yearDocumented: 2016,
    lastUpdated: '2025-10-05',
    description:
      'Annual ceremony honouring the river with floral offerings, songs, and a collective clean-up.',
    tags: ['water', 'environment', 'ritual'],
  },
  {
    id: '6',
    name: 'Midnight Poetry Circle',
    region: 'Global / Online',
    category: 'Spoken Word',
    community: 'Open Mic Constellation',
    status: 'Vulnerable',
    yearDocumented: 2022,
    lastUpdated: '2025-05-20',
    description:
      'Rotating online circle where participants share poems rooted in local traditions and personal histories.',
    tags: ['poetry', 'online', 'hybrid'],
  },
];

const REGIONS = ['All regions', ...Array.from(new Set(TRADITIONS.map((t) => t.region)))];
const CATEGORIES = ['All categories', ...Array.from(new Set(TRADITIONS.map((t) => t.category)))];
const STATUSES: (TraditionStatus | 'All statuses')[] = [
  'All statuses',
  'Endangered',
  'Vulnerable',
  'Thriving',
];

type SortKey = 'recent' | 'oldest' | 'status';

export default function TraditionsArchivePage(): JSX.Element {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [region, setRegion] = useState<string>('All regions');
  const [category, setCategory] = useState<string>('All categories');
  const [status, setStatus] = useState<TraditionStatus | 'All statuses'>(
    'All statuses',
  );
  const [sortBy, setSortBy] = useState<SortKey>('recent');

  const totalCount = TRADITIONS.length;
  const endangeredCount = TRADITIONS.filter(
    (t) => t.status === 'Endangered',
  ).length;
  const vulnerableCount = TRADITIONS.filter(
    (t) => t.status === 'Vulnerable',
  ).length;

  const filteredTraditions = useMemo(() => {
    let list = [...TRADITIONS];

    if (region !== 'All regions') {
      list = list.filter((t) => t.region === region);
    }

    if (category !== 'All categories') {
      list = list.filter((t) => t.category === category);
    }

    if (status !== 'All statuses') {
      list = list.filter((t) => t.status === status);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.community.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'recent') {
        return b.lastUpdated.localeCompare(a.lastUpdated);
      }
      if (sortBy === 'oldest') {
        return a.lastUpdated.localeCompare(b.lastUpdated);
      }
      // sortBy === 'status' – prioritize Endangered, then Vulnerable, then Thriving
      const order: Record<TraditionStatus, number> = {
        Endangered: 0,
        Vulnerable: 1,
        Thriving: 2,
      };
      return order[a.status] - order[b.status];
    });

    return list;
  }, [searchQuery, region, category, status, sortBy]);

  const handleContribute = () => {
    // You can later wire this to a real route like `/kreative/traditions-archive/contribute`
    router.push('/kreative/creative-hub/submit-creative-work');
  };

  const statusTag = (s: TraditionStatus) => {
    if (s === 'Endangered') {
      return <Tag color="red">Endangered</Tag>;
    }
    if (s === 'Vulnerable') {
      return <Tag color="orange">Vulnerable</Tag>;
    }
    return <Tag color="green">Thriving</Tag>;
  };

  const recentTimelineItems = [...TRADITIONS]
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 4)
    .map((t) => ({
      color:
        t.status === 'Endangered'
          ? 'red'
          : t.status === 'Vulnerable'
          ? 'orange'
          : 'green',
      children: (
        <div>
          <Text strong>{t.name}</Text>
          <br />
          <Text type="secondary">
            {t.region} · updated {t.lastUpdated}
          </Text>
        </div>
      ),
    }));

  return (
    <KreativePageShell
      title="Traditions Archive"
      subtitle="Explore, compare, and help preserve cultural traditions shared across the Kreative community."
      primaryAction={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleContribute}
        >
          Contribute a tradition
        </Button>
      }
      secondaryActions={
        <Button icon={<InfoCircleOutlined />}>Contribution guidelines</Button>
      }
    >
      <Row gutter={[24, 24]}>
        {/* Main column: filters + cards */}
        <Col xs={24} lg={16}>
          <Card className="mb-4">
            <Space
              direction="vertical"
              size="middle"
              style={{ width: '100%' }}
            >
              <Space
                direction="horizontal"
                size="middle"
                style={{ width: '100%', flexWrap: 'wrap' }}
              >
                <Input
                  allowClear
                  placeholder="Search by name, community, tag…"
                  prefix={<SearchOutlined />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ maxWidth: 320, width: '100%' }}
                />

                <Select
                  value={region}
                  onChange={setRegion}
                  style={{ minWidth: 180 }}
                  options={REGIONS.map((r) => ({
                    label: r,
                    value: r,
                  }))}
                />

                <Select
                  value={category}
                  onChange={setCategory}
                  style={{ minWidth: 180 }}
                  options={CATEGORIES.map((c) => ({
                    label: c,
                    value: c,
                  }))}
                />

                <Select
                  value={status}
                  onChange={setStatus}
                  style={{ minWidth: 160 }}
                  options={STATUSES.map((s) => ({
                    label: s,
                    value: s,
                  }))}
                />
              </Space>

              <Space
                direction="horizontal"
                size="middle"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <Text type="secondary">
                  Showing <strong>{filteredTraditions.length}</strong> of{' '}
                  <strong>{totalCount}</strong> traditions
                </Text>

                <Space>
                  <Text type="secondary">Sort by</Text>
                  <Select<SortKey>
                    value={sortBy}
                    onChange={setSortBy}
                    style={{ width: 180 }}
                    options={[
                      { label: 'Recently updated', value: 'recent' },
                      { label: 'Oldest first', value: 'oldest' },
                      { label: 'Status (Endangered → Thriving)', value: 'status' },
                    ]}
                  />
                </Space>
              </Space>
            </Space>
          </Card>

          <Row gutter={[16, 16]}>
            {filteredTraditions.map((tradition) => (
              <Col key={tradition.id} xs={24} sm={12}>
                <Card
                  hoverable
                  title={tradition.name}
                  extra={statusTag(tradition.status)}
                  onClick={() =>
                    router.push(
                      `/kreative/traditions-archive/${encodeURIComponent(
                        tradition.id,
                      )}`,
                    )
                  }
                >
                  <Paragraph
                    ellipsis={{ rows: 3 }}
                    style={{ marginBottom: 12 }}
                  >
                    {tradition.description}
                  </Paragraph>

                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Text type="secondary">
                      Region: {tradition.region} · Community:{' '}
                      {tradition.community}
                    </Text>
                    <Text type="secondary">
                      Category: {tradition.category} · Documented{' '}
                      {tradition.yearDocumented}
                    </Text>

                    <Space wrap style={{ marginTop: 8 }}>
                      {tradition.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}

            {filteredTraditions.length === 0 && (
              <Col span={24}>
                <Card>
                  <Title level={4} style={{ marginTop: 0 }}>
                    No traditions match these filters
                  </Title>
                  <Paragraph type="secondary">
                    Try removing some filters or broadening your search terms.
                  </Paragraph>
                </Card>
              </Col>
            )}
          </Row>
        </Col>

        {/* Side column: overview + timeline + legend */}
        <Col xs={24} lg={8}>
          <Card className="mb-4" title="Archive overview">
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text>
                <strong>{totalCount}</strong> documented traditions
              </Text>
              <Text>
                <Tag color="red" style={{ marginRight: 4 }}>
                  Endangered
                </Tag>
                <strong>{endangeredCount}</strong> flagged as at risk
              </Text>
              <Text>
                <Tag color="orange" style={{ marginRight: 4 }}>
                  Vulnerable
                </Tag>
                <strong>{vulnerableCount}</strong> under pressure
              </Text>
            </Space>
          </Card>

          <Card className="mb-4" title="Recently updated">
            <Timeline items={recentTimelineItems} />
          </Card>

          <Card title="Status legend">
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space>
                <Badge color="red" />
                <Text>Endangered – urgent need for documentation and support.</Text>
              </Space>
              <Space>
                <Badge color="orange" />
                <Text>Vulnerable – participation is declining or unstable.</Text>
              </Space>
              <Space>
                <Badge color="green" />
                <Text>Thriving – strong, regular community practice.</Text>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </KreativePageShell>
  );
}
