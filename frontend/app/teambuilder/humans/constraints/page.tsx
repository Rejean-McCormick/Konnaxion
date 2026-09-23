// frontend/app/teambuilder/humans/constraints/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
  Steps,
  Switch,
  Tag,
  TimePicker,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';

import TeamBuilderPageShell from '@/components/teambuilder/TeamBuilderPageShell';

const { Panel } = Collapse;
const { RangePicker } = TimePicker;
const { TextArea } = Input;
const { Text, Paragraph } = Typography;

const LANGUAGE_OPTIONS = (i18nT: TranslateFunction) => ([
  { label: i18nT("ui.teambuilder.humans.constraints.english"), value: 'en' },
  { label: i18nT("ui.teambuilder.humans.constraints.french"), value: 'fr' },
  { label: i18nT("ui.teambuilder.humans.constraints.spanish"), value: 'es' },
  { label: i18nT("ui.teambuilder.humans.constraints.german"), value: 'de' },
  { label: i18nT("ui.teambuilder.humans.constraints.arabic"), value: 'ar' },
  { label: i18nT("ui.teambuilder.humans.constraints.chineseMandarin"), value: 'zh' },
]);

const REGION_OPTIONS = (i18nT: TranslateFunction) => ([
  { label: i18nT("ui.teambuilder.humans.constraints.europe"), value: 'europe' },
  { label: i18nT("ui.teambuilder.humans.constraints.northAmerica"), value: 'north_america' },
  { label: i18nT("ui.teambuilder.humans.constraints.latinAmerica"), value: 'latin_america' },
  { label: i18nT("ui.teambuilder.humans.constraints.africa"), value: 'africa' },
  { label: i18nT("ui.teambuilder.humans.constraints.middleEast"), value: 'middle_east' },
  { label: i18nT("ui.teambuilder.humans.constraints.asiaPacific"), value: 'apac' },
]);

const TIMEZONE_OPTIONS = (i18nT: TranslateFunction) => ([
  { label: i18nT("ui.teambuilder.humans.constraints.utc0800Pst"), value: 'America/Los_Angeles' },
  { label: i18nT("ui.teambuilder.humans.constraints.utc0500Est"), value: 'America/New_York' },
  { label: i18nT("ui.teambuilder.humans.constraints.utc0000Utc"), value: 'Etc/UTC' },
  { label: i18nT("ui.teambuilder.humans.constraints.utc0100Cet"), value: 'Europe/Paris' },
  { label: i18nT("ui.teambuilder.humans.constraints.utc0200Eet"), value: 'Europe/Athens' },
  { label: i18nT("ui.teambuilder.humans.constraints.utc0530Ist"), value: 'Asia/Kolkata' },
]);

const DAY_OPTIONS = (i18nT: TranslateFunction) => ([
  { label: i18nT("ui.teambuilder.humans.constraints.monday"), value: 'mon' },
  { label: i18nT("ui.teambuilder.humans.constraints.tuesday"), value: 'tue' },
  { label: i18nT("ui.teambuilder.humans.constraints.wednesday"), value: 'wed' },
  { label: i18nT("ui.teambuilder.humans.constraints.thursday"), value: 'thu' },
  { label: i18nT("ui.teambuilder.humans.constraints.friday"), value: 'fri' },
  { label: i18nT("ui.teambuilder.humans.constraints.saturday"), value: 'sat' },
  { label: i18nT("ui.teambuilder.humans.constraints.sunday"), value: 'sun' },
]);

export default function HumansConstraintsPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [form] = Form.useForm();

  // Live summary via watchers
  const languages = Form.useWatch('languages', form) as string[] | undefined;
  const regions = Form.useWatch('regions', form) as string[] | undefined;
  const timezones = Form.useWatch('timezones', form) as string[] | undefined;
  const workingDays = Form.useWatch('working_days', form) as string[] | undefined;
  const workingHours = Form.useWatch(
    'working_hours',
    form,
  ) as dayjs.Dayjs[] | undefined;
  const allowMixedTZ = Form.useWatch(
    'allow_mixed_timezones',
    form,
  ) as boolean | undefined;
  const useOrgTemplate = Form.useWatch(
    'use_org_template',
    form,
  ) as boolean | undefined;

  const handleSave = (values: unknown) => {
    // TODO: integrate with backend constraints API
     
    console.log('Human constraints saved:', values);
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleSaveTemplate = () => {
    const currentValues = form.getFieldsValue();
    // TODO: integrate with "templates" API
     
    console.log('Save constraints as template:', currentValues);
  };

  const summaryTags: React.ReactNode[] = [];

  if (languages && languages.length > 0) {
    summaryTags.push(
      <Tag key="languages" icon={<GlobalOutlined />}>
        {languages.length} {i18nT("ui.teambuilder.humans.constraints.language")}{languages.length > 1 ? 's' : ''}
      </Tag>,
    );
  }

  if (regions && regions.length > 0) {
    summaryTags.push(
      <Tag key="regions" icon={<EnvironmentOutlined />}>
        {regions.length} {i18nT("ui.teambuilder.humans.constraints.region")}{regions.length > 1 ? 's' : ''}
      </Tag>,
    );
  }

  if (timezones && timezones.length > 0) {
    summaryTags.push(
      <Tag key="timezones" color="blue">
        {timezones.length} {i18nT("ui.teambuilder.humans.constraints.timeZone")}{timezones.length > 1 ? 's' : ''}
      </Tag>,
    );
  }

  if (workingDays && workingDays.length > 0) {
    summaryTags.push(
      <Tag key="days" color="green">
        {workingDays.length} {i18nT("ui.teambuilder.humans.constraints.workingDay")}{workingDays.length > 1 ? 's' : ''}
      </Tag>,
    );
  }

  // TS-safe handling of workingHours
  if (
    Array.isArray(workingHours) &&
    workingHours.length === 2 &&
    workingHours[0] &&
    workingHours[1]
  ) {
    summaryTags.push(
      <Tag key="hours" icon={<ClockCircleOutlined />} color="gold">
        {workingHours[0].format('HH:mm')} – {workingHours[1].format('HH:mm')}
      </Tag>,
    );
  }

  if (allowMixedTZ) {
    summaryTags.push(
      <Tag key="mixed_tz" color="purple">
        {i18nT("ui.teambuilder.humans.constraints.mixedTimeZonesAllowed")}
      </Tag>,
    );
  }

  if (useOrgTemplate) {
    summaryTags.push(
      <Tag key="org_template" color="geekblue">
        {i18nT("ui.teambuilder.humans.constraints.orgDefaultTemplate")}
      </Tag>,
    );
  }

  const primaryAction = (
    <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()}>
      {i18nT("ui.teambuilder.humans.constraints.saveConstraints")}
    </Button>
  );

  const secondaryActions = (
    <Button icon={<ReloadOutlined />} onClick={handleReset}>
      {i18nT("ui.teambuilder.humans.constraints.reset")}
    </Button>
  );

  return (
    <TeamBuilderPageShell
      title={i18nT("ui.teambuilder.humans.constraints.humanConstraints")}
      subtitle={i18nT("ui.teambuilder.humans.constraints.configureLanguageGeographyTimeZonesAndWorking")}
      sectionLabel={i18nT("ui.teambuilder.humans.constraints.humans")}
      maxWidth={1040}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          allow_mixed_timezones: false,
          use_org_template: false,
          working_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
          working_hours: [dayjs('09:00', 'HH:mm'), dayjs('17:00', 'HH:mm')],
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* High-level context + summary */}
          <Card>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Alert
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                message={i18nT("ui.teambuilder.humans.constraints.howTheseConstraintsAreUsed")}
                description={
                  <Paragraph type="secondary" style={{ margin: 0 }}>
                    {i18nT("ui.teambuilder.humans.constraints.humanConstraintsActAsHardOrSoft")}
                  </Paragraph>
                }
              />

              <Steps
                size="small"
                current={2}
                items={[
                  { title: i18nT("ui.teambuilder.humans.constraints.poolProfiles") },
                  { title: i18nT("ui.teambuilder.humans.constraints.humanConstraints") },
                  { title: i18nT("ui.teambuilder.humans.constraints.problemModes") },
                ]}
              />

              <Divider style={{ margin: '12px 0' }} />

              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Text strong>{i18nT("ui.teambuilder.humans.constraints.currentSummary")}</Text>
                {summaryTags.length === 0 ? (
                  <Text type="secondary">
                    {i18nT("ui.teambuilder.humans.constraints.noConstraintsSetYetDefineLanguagesRegions")}
                  </Text>
                ) : (
                  <Space wrap>{summaryTags}</Space>
                )}
              </Space>
            </Space>
          </Card>

          {/* Main configuration blocks */}
          <Card>
            <Collapse
              defaultActiveKey={['languages', 'geography', 'schedule']}
              bordered={false}
            >
              {/* Languages */}
              <Panel
                key="languages"
                header={
                  <Space>
                    <GlobalOutlined />
                    <span>{i18nT("ui.teambuilder.humans.constraints.languages")}</span>
                  </Space>
                }
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={16}>
                    <Form.Item
                      name="languages"
                      label={i18nT("ui.teambuilder.humans.constraints.preferredWorkingLanguages")}
                      tooltip={i18nT("ui.teambuilder.humans.constraints.usedToAvoidCreatingTeamsWherePeople")}
                    >
                      <Select
                        mode="multiple"
                        allowClear
                        placeholder={i18nT("ui.teambuilder.humans.constraints.selectOneOrMoreLanguages")}
                        options={LANGUAGE_OPTIONS(i18nT)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="languages_notes" label={i18nT("ui.teambuilder.humans.constraints.notes")}>
                      <TextArea
                        rows={3}
                        placeholder={i18nT("ui.teambuilder.humans.constraints.anySpecificLanguageNuancesAccentsOrRequirements")}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>

              {/* Geography & time zones */}
              <Panel
                key="geography"
                header={
                  <Space>
                    <EnvironmentOutlined />
                    <span>{i18nT("ui.teambuilder.humans.constraints.geographyTimeZones")}</span>
                  </Space>
                }
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="regions"
                      label={i18nT("ui.teambuilder.humans.constraints.allowedRegions")}
                      tooltip={i18nT("ui.teambuilder.humans.constraints.useThisToRestrictTeamFormationTo")}
                    >
                      <Select
                        mode="multiple"
                        allowClear
                        placeholder={i18nT("ui.teambuilder.humans.constraints.selectAllowedRegions")}
                        options={REGION_OPTIONS(i18nT)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="timezones"
                      label={i18nT("ui.teambuilder.humans.constraints.preferredTimeZones")}
                      tooltip={i18nT("ui.teambuilder.humans.constraints.optionalIfSetTheEngineWillPrefer")}
                    >
                      <Select
                        mode="multiple"
                        allowClear
                        placeholder={i18nT("ui.teambuilder.humans.constraints.selectOneOrMoreTimeZones")}
                        options={TIMEZONE_OPTIONS(i18nT)}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="allow_mixed_timezones"
                      label={i18nT("ui.teambuilder.humans.constraints.allowMixedTimeZones")}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={16}>
                    <Form.Item name="geo_notes" label={i18nT("ui.teambuilder.humans.constraints.notes")}>
                      <TextArea
                        rows={2}
                        placeholder={i18nT("ui.teambuilder.humans.constraints.eGAvoidPairingAmericasWithApac")}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>

              {/* Schedule */}
              <Panel
                key="schedule"
                header={
                  <Space>
                    <ClockCircleOutlined />
                    <span>{i18nT("ui.teambuilder.humans.constraints.workingSchedule")}</span>
                  </Space>
                }
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="working_days" label={i18nT("ui.teambuilder.humans.constraints.typicalWorkingDays")}>
                      <Checkbox.Group options={DAY_OPTIONS(i18nT)} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="working_hours"
                      label={i18nT("ui.teambuilder.humans.constraints.typicalWorkingHoursLocalTime")}
                    >
                      <RangePicker format="HH:mm" minuteStep={15} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="use_org_template"
                      label={i18nT("ui.teambuilder.humans.constraints.useOrganisationDefaultSchedule")}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="schedule_notes" label={i18nT("ui.teambuilder.humans.constraints.notes")}>
                      <TextArea
                        rows={2}
                        placeholder={i18nT("ui.teambuilder.humans.constraints.eGHighIntensityTeamsAvailableFor")}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>
            </Collapse>

            <Divider />

            {/* Bottom actions (in addition to shell toolbar) */}
            <Space
              style={{
                width: '100%',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
              }}
            >
              <Space>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  {i18nT("ui.teambuilder.humans.constraints.reset")}
                </Button>
              </Space>

              <Space>
                <Button icon={<PlusOutlined />} onClick={handleSaveTemplate}>
                  {i18nT("ui.teambuilder.humans.constraints.saveAsTemplate")}
                </Button>
                <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
                  {i18nT("ui.teambuilder.humans.constraints.saveConstraints")}
                </Button>
              </Space>
            </Space>
          </Card>
        </Space>
      </Form>
    </TeamBuilderPageShell>
  );
}
