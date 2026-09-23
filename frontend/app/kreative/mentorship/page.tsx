// FILE: frontend/app/kreative/mentorship/page.tsx
// app/kreative/mentorship/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  AudioOutlined,
  BookOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  GlobalOutlined,
  PictureOutlined,
  TeamOutlined,
  UploadOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import {
  Alert,
  message as antdMessage,
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  List,
  Row,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useMemo, useState } from 'react';

import KreativePageShell from '@/app/kreative/kreativePageShell';
import { createTraditionEntry } from '@/services/kreative';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

type MentorAvailability = 'Open' | 'Waitlist' | 'Full';

type Mentor = {
  id: string;
  name: string;
  discipline: string;
  tradition: string;
  region: string;
  languages: string[];
  availability: MentorAvailability;
  focusTags: string[];
  isOnline: boolean;
  avatarInitial?: string;
};

type ArchiveMediaType = 'Video' | 'Audio' | 'Photo' | 'Text';

type ArchiveItem = {
  id: string;
  title: string;
  tradition: string;
  region: string;
  mediaType: ArchiveMediaType;
  contributor: string;
  summary: string;
  year?: number;
};

type ArchiveFormValues = {
  title: string;
  tradition: string;
  region: string;
  mediaType: ArchiveMediaType;
  description: string;
  approximateYear?: string;
  media: UploadFile[];
};

// Minimal type for Upload onChange (avoid implicit any)
type UploadChangeParamLite = {
  fileList: UploadFile[];
};

/* ------------------------------------------------------------------ */
/*  Declared preview data                                             */
/* ------------------------------------------------------------------ */

const MENTOR_PREVIEW_DATA: Mentor[] = [
  {
    id: 'm1',
    name: 'Amara Ndlovu',
    discipline: 'Textile Arts',
    tradition: 'Zulu beadwork & weaving',
    region: 'Southern Africa',
    languages: ['English', 'Zulu'],
    availability: 'Open',
    focusTags: ['Beadwork', 'Weaving', 'Ceremonial attire'],
    isOnline: true,
    avatarInitial: 'A',
  },
  {
    id: 'm2',
    name: 'Kenji Sato',
    discipline: 'Performing Arts',
    tradition: 'Noh Theatre',
    region: 'Japan',
    languages: ['Japanese', 'English'],
    availability: 'Waitlist',
    focusTags: ['Theatre', 'Mask work', 'Chanting'],
    isOnline: false,
    avatarInitial: 'K',
  },
  {
    id: 'm3',
    name: 'Luz Maria Ortega',
    discipline: 'Culinary Arts',
    tradition: 'Traditional Oaxacan cuisine',
    region: 'Latin America',
    languages: ['Spanish', 'English'],
    availability: 'Open',
    focusTags: ['Cuisine', 'Festivals', 'Family recipes'],
    isOnline: true,
    avatarInitial: 'L',
  },
  {
    id: 'm4',
    name: 'Tane Mahuta',
    discipline: 'Carving & Woodcraft',
    tradition: 'Māori wood carving',
    region: 'Oceania',
    languages: ['Māori', 'English'],
    availability: 'Full',
    focusTags: ['Carving', 'Symbolism', 'Storytelling'],
    isOnline: false,
    avatarInitial: 'T',
  },
];

const ARCHIVE_PREVIEW_DATA: ArchiveItem[] = [
  {
    id: 'a1',
    title: 'Moonlight weaving circle',
    tradition: 'Zulu beadwork & weaving',
    region: 'Southern Africa',
    mediaType: 'Photo',
    contributor: 'Community Hub Durban',
    summary:
      'Documenting an intergenerational weaving circle preserving bead patterns tied to coming-of-age ceremonies.',
    year: 2022,
  },
  {
    id: 'a2',
    title: 'Noh chants for autumn festival',
    tradition: 'Noh Theatre',
    region: 'Japan',
    mediaType: 'Audio',
    contributor: 'Kyoto Culture Lab',
    summary:
      'Audio recordings of rarely performed chants used only during local harvest festivals.',
    year: 2019,
  },
  {
    id: 'a3',
    title: 'Corn and cacao ritual drinks',
    tradition: 'Oaxacan cuisine',
    region: 'Latin America',
    mediaType: 'Video',
    contributor: 'Casa de Sabores',
    summary:
      'Short video series capturing techniques behind ceremonial chocolate and corn drinks.',
    year: 2021,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function availabilityColor(status: MentorAvailability): string {
  if (status === 'Open') return 'green';
  if (status === 'Waitlist') return 'gold';
  return 'red';
}

function mediaTypeIcon(type: ArchiveMediaType): React.ReactNode {
  switch (type) {
    case 'Video':
      return <VideoCameraOutlined />;
    case 'Audio':
      return <AudioOutlined />;
    case 'Photo':
      return <PictureOutlined />;
    case 'Text':
    default:
      return <FileTextOutlined />;
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function MentorshipPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'online' | 'in-person'>('all');
  const [searchValue, setSearchValue] = useState<string>('');

  const [archiveForm] = Form.useForm<ArchiveFormValues>();
  const [archiveFiles, setArchiveFiles] = useState<UploadFile[]>([]);
  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>(ARCHIVE_PREVIEW_DATA);
  const [messageApi, messageContextHolder] = antdMessage.useMessage();

  const disciplines = useMemo(
    () => Array.from(new Set(MENTOR_PREVIEW_DATA.map((m) => m.discipline))).sort(),
    [],
  );
  const regions = useMemo(
    () => Array.from(new Set(MENTOR_PREVIEW_DATA.map((m) => m.region))).sort(),
    [],
  );

  const filteredMentors = useMemo(() => {
    return MENTOR_PREVIEW_DATA.filter((mentor) => {
      if (disciplineFilter !== 'all' && mentor.discipline !== disciplineFilter) {
        return false;
      }
      if (regionFilter !== 'all' && mentor.region !== regionFilter) {
        return false;
      }
      if (deliveryFilter === 'online' && !mentor.isOnline) return false;
      if (deliveryFilter === 'in-person' && mentor.isOnline) return false;

      if (!searchValue.trim()) return true;

      const needle = searchValue.toLowerCase();
      const haystack = [
        mentor.name,
        mentor.discipline,
        mentor.tradition,
        mentor.region,
        mentor.languages.join(' '),
        mentor.focusTags.join(' '),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [disciplineFilter, regionFilter, deliveryFilter, searchValue]);

  const handleArchiveUploadChange = (info: UploadChangeParamLite) => {
    setArchiveFiles(info.fileList);
  };

  const normalizeArchiveFile = (e: UploadChangeParamLite | UploadFile[]) => {
    if (Array.isArray(e)) return e;
    return e?.fileList ?? [];
  };

  const handleArchiveSubmit = async (values: ArchiveFormValues) => {
    const upload = archiveFiles[0]?.originFileObj;
    if (!(upload instanceof File)) {
      messageApi.error(i18nT("ui.kreative.mentorship.pleaseAttachOneMediaFile"));
      return;
    }

    const descriptionParts = [
      values.description,
      `Tradition: ${values.tradition}`,
      `Media type: ${values.mediaType}`,
      values.approximateYear ? `Approximate year: ${values.approximateYear}` : '',
    ].filter(Boolean);

    const payload = new FormData();
    payload.append('title', values.title);
    payload.append('description', descriptionParts.join('\n\n'));
    payload.append('region', values.region);
    payload.append('media_file', upload);

    try {
      const created = await createTraditionEntry(payload);
      const next: ArchiveItem = {
        id: String(created.id),
        title: values.title,
        tradition: values.tradition,
        region: values.region,
        mediaType: values.mediaType,
        contributor: created.submitted_by || 'You',
        summary: values.description,
        year: values.approximateYear
          ? Number(values.approximateYear) || undefined
          : undefined,
      };

      setArchiveItems((prev) => [next, ...prev]);
      messageApi.success(i18nT("ui.kreative.mentorship.archiveContributionSaved"));
      archiveForm.resetFields();
      setArchiveFiles([]);
    } catch (error) {
      messageApi.error(
        error instanceof Error
          ? error.message
          : 'Unable to save the archive contribution.',
      );
    }
  };

  const secondaryActions = (
    <Space>
      <Button icon={<TeamOutlined />} href="/kreative/collaborative-spaces/find-spaces">
        {i18nT("ui.kreative.mentorship.exploreSpaces")}
      </Button>
      <Button icon={<BookOutlined />} href="/kreative/creative-hub/explore-ideas">
        {i18nT("ui.kreative.mentorship.exploreIdeas")}
      </Button>
    </Space>
  );

  return (
    <KreativePageShell
      title={i18nT("ui.kreative.mentorship.mentorshipCulturalArchive")}
      subtitle={i18nT("ui.kreative.mentorship.connectWithMentorsAndHelpPreserveCultural")}
      secondaryActions={secondaryActions}
    >
      {messageContextHolder}
      {/* Intro + How it works */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={10}>
          <Card>
            <Title level={4} style={{ marginBottom: 12 }}>
              {i18nT("ui.kreative.mentorship.howTheMentorshipProgramWorks")}
            </Title>
            <Paragraph type="secondary">
              {i18nT("ui.kreative.mentorship.thisPageCombinesADeclaredMentorDirectory")}
            </Paragraph>
            <ul style={{ paddingLeft: 20, marginTop: 8, marginBottom: 0 }}>
              <li>
                <Text>
                  {i18nT("ui.kreative.mentorship.browse")} <Text strong>{i18nT("ui.kreative.mentorship.mentors")}</Text> {i18nT("ui.kreative.mentorship.byDisciplineRegionOrDeliveryMode")}
                </Text>
              </li>
              <li>
                <Text>
                  {i18nT("ui.kreative.mentorship.mentorDiscoveryIsPreviewOnlyRequestDelivery")}
                </Text>
              </li>
              <li>
                <Text>
                  {i18nT("ui.kreative.mentorship.useTheFormBelowTo")} <Text strong>{i18nT("ui.kreative.mentorship.contributeMedia")}</Text> {i18nT("ui.kreative.mentorship.toTheArchivePhotosAudioVideosOr")}
                </Text>
              </li>
            </ul>
            <Alert
              type="info"
              showIcon
              style={{ marginTop: 16 }}
              message={i18nT("ui.kreative.mentorship.archiveContributionsArePersistedThroughKreativeMentor")}
            />
          </Card>
        </Col>

        {/* Filters summary */}
        <Col xs={24} lg={14}>
          <Card title={i18nT("ui.kreative.mentorship.findAMentor")}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                  {i18nT("ui.kreative.mentorship.discipline")}
                </Text>
                <Select
                  value={disciplineFilter}
                  onChange={(value) => setDisciplineFilter(value)}
                  style={{ width: '100%' }}
                  placeholder={i18nT("ui.kreative.mentorship.allDisciplines")}
                  allowClear={false}
                >
                  <Option value="all">{i18nT("ui.kreative.mentorship.allDisciplines")}</Option>
                  {disciplines.map((d) => (
                    <Option key={d} value={d}>
                      {d}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} md={8}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                  {i18nT("ui.kreative.mentorship.region")}
                </Text>
                <Select
                  value={regionFilter}
                  onChange={(value) => setRegionFilter(value)}
                  style={{ width: '100%' }}
                  placeholder={i18nT("ui.kreative.mentorship.allRegions")}
                  allowClear={false}
                >
                  <Option value="all">{i18nT("ui.kreative.mentorship.allRegions")}</Option>
                  {regions.map((r) => (
                    <Option key={r} value={r}>
                      {r}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} md={8}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                  {i18nT("ui.kreative.mentorship.delivery")}
                </Text>
                <Segmented
                  block
                  value={deliveryFilter}
                  onChange={(value) =>
                    setDeliveryFilter(value as 'all' | 'online' | 'in-person')
                  }
                  options={[
                    { label: i18nT("ui.kreative.mentorship.all"), value: 'all' },
                    { label: i18nT("ui.kreative.mentorship.online"), value: 'online' },
                    { label: i18nT("ui.kreative.mentorship.inPerson"), value: 'in-person' },
                  ]}
                />
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Input.Search
                  placeholder={i18nT("ui.kreative.mentorship.searchByMentorNameTraditionLanguage")}
                  allowClear
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Mentors list */}
      <Card
        title={i18nT("ui.kreative.mentorship.mentorsOpportunities")}
        extra={
          <Text type="secondary">
            {i18nT("ui.kreative.mentorship.showing")} <strong>{filteredMentors.length}</strong> {i18nT("ui.kreative.mentorship.of")} {MENTOR_PREVIEW_DATA.length} {i18nT("ui.kreative.mentorship.mentors")}
          </Text>
        }
        style={{ marginBottom: 32 }}
      >
        {filteredMentors.length === 0 ? (
          <Empty description={i18nT("ui.kreative.mentorship.noMentorsMatchYourFiltersYet")} />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={filteredMentors}
            renderItem={(mentor) => (
              <List.Item
                key={mentor.id}
                actions={[
                  <Button
                    key="request"
                    type="primary"
                    disabled
                    title={i18nT("ui.kreative.mentorship.mentorshipRequestDeliveryIsNotExposedBy")}
                  >
                    {i18nT("ui.kreative.mentorship.requestUnavailable")}
                  </Button>,
                  <Button
                    key="details"
                    type="link"
                    disabled
                    title={i18nT("ui.kreative.mentorship.mentorProfileDetailsArePreviewOnlyIn")}
                  >
                    {i18nT("ui.kreative.mentorship.detailsUnavailable")}
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar>
                      {mentor.avatarInitial ??
                        mentor.name.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={
                    <Space size="small" wrap>
                      <Text strong>{mentor.name}</Text>
                      <Tag color={availabilityColor(mentor.availability)}>
                        {mentor.availability}
                      </Tag>
                      {mentor.isOnline ? (
                        <Tag icon={<GlobalOutlined />}>{i18nT("ui.kreative.mentorship.onlineSessions")}</Tag>
                      ) : (
                        <Tag icon={<EnvironmentOutlined />}>{i18nT("ui.kreative.mentorship.inPersonOnly")}</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Text>
                        <Text strong>{i18nT("ui.kreative.mentorship.discipline_17b927")}</Text> {mentor.discipline}
                      </Text>
                      <Text>
                        <Text strong>{i18nT("ui.kreative.mentorship.tradition")}</Text> {mentor.tradition}
                      </Text>
                      <Space size="small" wrap>
                        <Tag>{mentor.region}</Tag>
                        {mentor.languages.map((lang) => (
                          <Tag key={lang}>{lang}</Tag>
                        ))}
                      </Space>
                      <Space size={[4, 4]} wrap>
                        {mentor.focusTags.map((tag) => (
                          <Tag key={tag} color="blue">
                            {tag}
                          </Tag>
                        ))}
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Divider />

      {/* Archive: form + gallery */}
      <Row gutter={[24, 24]}>
        {/* Submission form */}
        <Col xs={24} lg={12}>
          <Card
            title={i18nT("ui.kreative.mentorship.contributeToTheCulturalArchive")}
            extra={<Tag color="success">{i18nT("ui.kreative.mentorship.persisted")}</Tag>}
            style={{ marginBottom: 24 }}
          >
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
              {i18nT("ui.kreative.mentorship.shareMediaDocumentingACulturalPracticeRitual")}
            </Paragraph>

            <Form<ArchiveFormValues>
              layout="vertical"
              form={archiveForm}
              onFinish={handleArchiveSubmit}
            >
              <Form.Item
                label={i18nT("ui.kreative.mentorship.titleOfTheContribution")}
                name="title"
                rules={[{ required: true, message: i18nT("ui.kreative.mentorship.pleaseEnterATitle") }]}
              >
                <Input placeholder={i18nT("ui.kreative.mentorship.eGHarvestDanceInTheNorthern")} />
              </Form.Item>

              <Form.Item
                label={i18nT("ui.kreative.mentorship.traditionOrPractice")}
                name="tradition"
                rules={[{ required: true, message: i18nT("ui.kreative.mentorship.pleaseDescribeTheTradition") }]}
              >
                <Input placeholder={i18nT("ui.kreative.mentorship.eGNohTheatreAutumnPerformance")} />
              </Form.Item>

              <Form.Item
                label={i18nT("ui.kreative.mentorship.regionCommunity")}
                name="region"
                rules={[{ required: true, message: i18nT("ui.kreative.mentorship.pleaseSpecifyARegionOrCommunity") }]}
              >
                <Input
                  prefix={<EnvironmentOutlined />}
                  placeholder={i18nT("ui.kreative.mentorship.eGKyotoJapanLocalCommunityName")}
                />
              </Form.Item>

              <Form.Item
                label={i18nT("ui.kreative.mentorship.mediaType")}
                name="mediaType"
                rules={[{ required: true, message: i18nT("ui.kreative.mentorship.pleaseSelectAMediaType") }]}
              >
                <Select placeholder={i18nT("ui.kreative.mentorship.chooseOne")}>
                  <Option value="Video">{i18nT("ui.kreative.mentorship.video")}</Option>
                  <Option value="Audio">{i18nT("ui.kreative.mentorship.audio")}</Option>
                  <Option value="Photo">{i18nT("ui.kreative.mentorship.photo")}</Option>
                  <Option value="Text">{i18nT("ui.kreative.mentorship.textTranscriptOnly")}</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={i18nT("ui.kreative.mentorship.approximateYearOptional")}
                name="approximateYear"
                tooltip={i18nT("ui.kreative.mentorship.useA4DigitYearEG")}
              >
                <Input maxLength={4} placeholder={i18nT("ui.kreative.mentorship.eG2015")} />
              </Form.Item>

              <Form.Item
                label={i18nT("ui.kreative.mentorship.descriptionContext")}
                name="description"
                rules={[
                  { required: true, message: i18nT("ui.kreative.mentorship.pleaseProvideAShortDescription") },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder={i18nT("ui.kreative.mentorship.explainWhenThisPracticeHappensWhoParticipates")}
                />
              </Form.Item>

              <Form.Item
                label={i18nT("ui.kreative.mentorship.uploadMedia")}
                name="media"
                valuePropName="fileList"
                getValueFromEvent={normalizeArchiveFile}
                rules={[
                  {
                    validator: (_, value: UploadFile[]) =>
                      value && value.length
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error('Please attach at least one media file'),
                          ),
                  },
                ]}
              >
                <Upload
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={handleArchiveUploadChange}
                  fileList={archiveFiles}
                >
                  <Button icon={<UploadOutlined />}>{i18nT("ui.kreative.mentorship.selectFileS")}</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {i18nT("ui.kreative.mentorship.submitContribution")}
                  </Button>
                  <Button
                    onClick={() => {
                      archiveForm.resetFields();
                      setArchiveFiles([]);
                    }}
                  >
                    {i18nT("ui.kreative.mentorship.reset")}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Archive gallery */}
        <Col xs={24} lg={12}>
          <Card
            title={i18nT("ui.kreative.mentorship.archiveHighlights")}
            extra={
              <Space>
                <GlobalOutlined />
                <Text type="secondary">{i18nT("ui.kreative.mentorship.sampleEntriesFrontEndOnly")}</Text>
              </Space>
            }
          >
            {archiveItems.length === 0 ? (
              <Empty description={i18nT("ui.kreative.mentorship.noArchiveItemsYet")} />
            ) : (
              <List
                itemLayout="vertical"
                dataSource={archiveItems}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      title={
                        <Space direction="vertical" size={0}>
                          <Space>
                            <Text strong>{item.title}</Text>
                            <Tag icon={mediaTypeIcon(item.mediaType)}>
                              {item.mediaType}
                            </Tag>
                          </Space>
                          <Space size="small" wrap>
                            <Tag icon={<EnvironmentOutlined />}>{item.region}</Tag>
                            <Tag>{item.tradition}</Tag>
                            {item.year && <Tag color="geekblue">{item.year}</Tag>}
                          </Space>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Paragraph
                            style={{ marginBottom: 4 }}
                            ellipsis={{ rows: 3, expandable: false }}
                          >
                            {item.summary}
                          </Paragraph>
                          <Text type="secondary">{i18nT("ui.kreative.mentorship.contributor")} {item.contributor}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </KreativePageShell>
  );
}
