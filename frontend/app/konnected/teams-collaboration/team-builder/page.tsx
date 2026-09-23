// FILE: frontend/app/konnected/teams-collaboration/team-builder/page.tsx
// app/konnected/teams-collaboration/team-builder/page.tsx
'use client';


import TranslatedText from '@/components/i18n/TranslatedText';
import { useLanguage } from '@/context/LanguageContext';
import {
  ExclamationCircleOutlined,
  MailOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  StepsForm,
} from '@ant-design/pro-components';
import {
  message as antdMessage,
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { apiFetch } from '@/api';
import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';

const { Paragraph, Text } = Typography;
const { Option } = Select;

/**
 * Domain types
 */
type TeamRole = 'leader' | 'coordinator' | 'member';

interface TeamInfo {
  name: string;
  description?: string;
  isOpenJoin?: boolean;
}

interface TeamMember {
  key: string;
  email: string;
  role: TeamRole;
  responsibilityArea?: string;
}

/**
 * API payloads (front-end representation)
 * You will likely need to align these with your real OpenAPI / backend models.
 */
interface CreateTeamPayload {
  name: string;
  description?: string;
  isOpenJoin?: boolean;
  members: {
    email: string;
    role: TeamRole;
    responsibilityArea?: string;
  }[];
}

interface CreateTeamResponse {
  id: string;
  slug?: string;
}

interface TeamCreationError extends Error {
  details?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function errorCode(details: unknown): string | undefined {
  if (!isRecord(details)) return undefined;
  return typeof details.code === 'string' ? details.code : undefined;
}

/**
 * Helpers
 */
const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const TEAM_ROLE_LABEL: Record<TeamRole, string> = {
  leader: 'Team leader',
  coordinator: 'Coordinator',
  member: 'Member',
};

/**
 * API call (isolate endpoint here to make it easy to wire to your real backend).
 *
 * TODO: adjust URL & shape to your real OpenAPI (schema-endpoints).
 * For example, this might be:
 *   POST /api/konnected/teams
 *   or POST /api/project-teams
 */
async function createTeamApi(payload: CreateTeamPayload): Promise<CreateTeamResponse> {
  const response = await apiFetch('/api/konnected/teams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (response.status === 403) {
    throw new Error('PERMISSION_DENIED');
  }

  if (!response.ok) {
    // Try to surface backend validation errors if possible
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      // ignore
    }
    const error = new Error('SERVER_ERROR') as TeamCreationError;
    error.details = details;
    throw error;
  }

  return (await response.json()) as CreateTeamResponse;
}

/**
 * Members table columns
 */
const useMemberColumns = (
  onRemove: (key: string) => void,
): ColumnsType<TeamMember> => {
  const { t: i18nT } = useLanguage();
  return [
  {
    title: i18nT("ui.konnected.teamsCollaboration.teamBuilder.member"),
    dataIndex: 'email',
    key: 'email',
    render: (email: string) => (
      <Space>
        <MailOutlined />
        <span>{email}</span>
      </Space>
    ),
  },
  {
    title: i18nT("ui.konnected.teamsCollaboration.teamBuilder.role"),
    dataIndex: 'role',
    key: 'role',
    render: (role: TeamRole) => {
      const color =
        role === 'leader' ? 'gold' : role === 'coordinator' ? 'processing' : 'default';
      return <Tag color={color}>{TEAM_ROLE_LABEL[role]}</Tag>;
    },
  },
  {
    title: i18nT("ui.konnected.teamsCollaboration.teamBuilder.responsibilityArea"),
    dataIndex: 'responsibilityArea',
    key: 'responsibilityArea',
    ellipsis: true,
    render: (value?: string) => value || <Text type="secondary"><TranslatedText id="ui.konnected.teamsCollaboration.teamBuilder.notSpecified" /></Text>,
  },
  {
    title: i18nT("ui.konnected.teamsCollaboration.teamBuilder.actions"),
    key: 'actions',
    width: 120,
    render: (_: unknown, record: TeamMember) => (
      <Button danger size="small" onClick={() => onRemove(record.key)}>
        <TranslatedText id="ui.konnected.teamsCollaboration.teamBuilder.remove" />
      </Button>
    ),
  },
  ];
}

export default function TeamBuilderPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const router = useRouter();

  /**
   * Step 1 – team info
   */
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);

  /**
   * Step 2 – members
   */
  const [members, setMembers] = useState<TeamMember[]>([]);

  // Draft row for the “add member” mini-form
  const [memberForm] = Form.useForm<{
    email: string;
    role: TeamRole;
    responsibilityArea?: string;
  }>();

  /**
   * Submitting / global loading
   */
  const [submitting, setSubmitting] = useState(false);

  /**
   * Derived data
   */
  const isValidForSubmit = useMemo(() => {
    return Boolean(teamInfo && teamInfo.name && members.length > 0);
  }, [teamInfo, members]);

  const handleAddMember = async () => {
    try {
      const values = await memberForm.validateFields();
      const email = normalizeEmail(values.email);

      if (members.some((m) => m.email === email)) {
        antdMessage.warning(i18nT("ui.konnected.teamsCollaboration.teamBuilder.thisEmailIsAlreadyInTheTeam"));
        return;
      }

      const newMember: TeamMember = {
        key: `${Date.now()}-${email}`,
        email,
        role: values.role,
        responsibilityArea: values.responsibilityArea?.trim() || undefined,
      };

      setMembers((prev) => [...prev, newMember]);
      memberForm.resetFields();
    } catch {
      // Validation error, do nothing (ProForm already shows messages)
    }
  };

  const handleRemoveMember = (key: string) => {
    setMembers((prev) => prev.filter((m) => m.key !== key));
  };

  const memberColumns = useMemberColumns(handleRemoveMember);

  /**
   * Global submit – called when last step is submitted.
   */
  const handleFinish = async (): Promise<boolean> => {
    if (!teamInfo) {
      antdMessage.error(i18nT("ui.konnected.teamsCollaboration.teamBuilder.pleaseCompleteTeamInformationFirst"));
      return false;
    }
    if (!members.length) {
      antdMessage.error(i18nT("ui.konnected.teamsCollaboration.teamBuilder.pleaseAddAtLeastOneMemberTo"));
      return false;
    }

    const payload: CreateTeamPayload = {
      name: teamInfo.name.trim(),
      description: teamInfo.description?.trim() || undefined,
      isOpenJoin: teamInfo.isOpenJoin ?? false,
      members: members.map((member) => ({
        email: member.email,
        role: member.role,
        responsibilityArea: member.responsibilityArea,
      })),
    };

    try {
      setSubmitting(true);
      const created = await createTeamApi(payload);
      antdMessage.success(i18nT("ui.konnected.teamsCollaboration.teamBuilder.teamCreatedSuccessfully"));
      // Redirect to “My teams” or to the created team if you have a slug
      if (created.slug) {
        router.push(`/konnected/teams-collaboration/my-teams/${created.slug}`);
      } else {
        router.push('/konnected/teams-collaboration/my-teams');
      }
      return true;
    } catch (err: unknown) {
      const error: TeamCreationError =
        err instanceof Error ? err : new Error(String(err));
      if (error.message === 'PERMISSION_DENIED') {
        antdMessage.error(
          i18nT("ui.konnected.teamsCollaboration.teamBuilder.youDoNotHavePermissionToCreate"),
        );
      } else if (errorCode(error.details) === 'TEAM_NAME_ALREADY_EXISTS') {
        antdMessage.error(i18nT("ui.konnected.teamsCollaboration.teamBuilder.aTeamWithThisNameAlreadyExists"));
      } else {
        antdMessage.error(i18nT("ui.konnected.teamsCollaboration.teamBuilder.couldNotCreateTheTeamPleaseTry"));
      }
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KonnectedPageShell
      title={i18nT("ui.konnected.teamsCollaboration.teamBuilder.teamBuilder")}
      subtitle={
        <span>
          {i18nT("ui.konnected.teamsCollaboration.teamBuilder.configureACollaborationReadyTeamForKonnected")}
        </span>
      }
      primaryAction={
        <Button
          type="primary"
          icon={<TeamOutlined />}
          disabled={!isValidForSubmit || submitting}
          onClick={handleFinish}
        >
          {i18nT("ui.konnected.teamsCollaboration.teamBuilder.createTeam")}
        </Button>
      }
      secondaryActions={
        <Text type="secondary">
          <UserOutlined /> {i18nT("ui.konnected.teamsCollaboration.teamBuilder.youWillBeAutomaticallyAddedAsA")}
        </Text>
      }
    >
      <Card>
        <StepsForm
          onFinish={handleFinish}
          formProps={{ layout: 'vertical' }}
          submitter={{
            submitButtonProps: {
              loading: submitting,
            },
            searchConfig: {
              submitText: 'Create team',
            },
          }}
        >
          {/* Step 1 – Team information */}
          <StepsForm.StepForm<TeamInfo>
            name="teamInfo"
            title={i18nT("ui.konnected.teamsCollaboration.teamBuilder.teamDetails")}
            onFinish={async (values) => {
              const trimmedName = values.name?.trim();
              if (!trimmedName) {
                antdMessage.error(i18nT("ui.konnected.teamsCollaboration.teamBuilder.teamNameIsRequired"));
                return false;
              }
              setTeamInfo({
                name: trimmedName,
                description: values.description?.trim() || undefined,
                isOpenJoin: values.isOpenJoin ?? false,
              });
              return true;
            }}
          >
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
              {i18nT("ui.konnected.teamsCollaboration.teamBuilder.giveYourTeamAClearIdentityAnd")}
            </Paragraph>

            <ProFormText
              name="name"
              label={i18nT("ui.konnected.teamsCollaboration.teamBuilder.teamName")}
              placeholder={i18nT("ui.konnected.teamsCollaboration.teamBuilder.eGRoboticsInnovationSquad")}
              rules={[
                { required: true, message: i18nT("ui.konnected.teamsCollaboration.teamBuilder.pleaseEnterATeamName") },
                { min: 3, message: i18nT("ui.konnected.teamsCollaboration.teamBuilder.nameShouldBeAtLeast3Characters") },
              ]}
              fieldProps={{
                maxLength: 120,
                showCount: true,
              }}
            />

            <ProFormTextArea
              name="description"
              label={i18nT("ui.konnected.teamsCollaboration.teamBuilder.teamDescription")}
              placeholder={i18nT("ui.konnected.teamsCollaboration.teamBuilder.brieflyDescribeTheTeamSPurposeFocus")}
              fieldProps={{
                rows: 4,
                maxLength: 500,
                showCount: true,
              }}
            />

            <ProFormSwitch
              name="isOpenJoin"
              label={i18nT("ui.konnected.teamsCollaboration.teamBuilder.allowJoinRequests")}
              tooltip={i18nT("ui.konnected.teamsCollaboration.teamBuilder.ifEnabledLearnersCanSendJoinRequests")}
            />
          </StepsForm.StepForm>

          {/* Step 2 – Members & roles */}
          <StepsForm.StepForm
            name="members"
            title={i18nT("ui.konnected.teamsCollaboration.teamBuilder.membersRoles")}
            onFinish={async () => {
              if (!members.length) {
                antdMessage.error(i18nT("ui.konnected.teamsCollaboration.teamBuilder.addAtLeastOneMemberToContinue"));
                return false;
              }
              return true;
            }}
          >
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
              {i18nT("ui.konnected.teamsCollaboration.teamBuilder.addCoreTeamMembersNowYouCan")}
            </Paragraph>

            {/* Add-member mini-form */}
            <Card
              size="small"
              style={{ marginBottom: 24 }}
              title={
                <Space>
                  <UserAddOutlined />
                  <span>{i18nT("ui.konnected.teamsCollaboration.teamBuilder.addMember")}</span>
                </Space>
              }
            >
              <Form
                form={memberForm}
                layout="vertical"
                initialValues={{
                  role: 'member' as TeamRole,
                }}
              >
                <Form.Item
                  label={i18nT("ui.konnected.teamsCollaboration.teamBuilder.email")}
                  name="email"
                  rules={[
                    { required: true, message: i18nT("ui.konnected.teamsCollaboration.teamBuilder.pleaseEnterAnEmailAddress") },
                    { type: 'email', message: i18nT("ui.konnected.teamsCollaboration.teamBuilder.pleaseEnterAValidEmailAddress") },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="member@example.org"
                    autoComplete="off"
                  />
                </Form.Item>

                <Form.Item label={i18nT("ui.konnected.teamsCollaboration.teamBuilder.role")} name="role" rules={[{ required: true }]}>
                  <Select>
                    <Option value="leader">{i18nT("ui.konnected.teamsCollaboration.teamBuilder.teamLeader")}</Option>
                    <Option value="coordinator">{i18nT("ui.konnected.teamsCollaboration.teamBuilder.coordinator")}</Option>
                    <Option value="member">{i18nT("ui.konnected.teamsCollaboration.teamBuilder.member")}</Option>
                  </Select>
                </Form.Item>

                <Form.Item label={i18nT("ui.konnected.teamsCollaboration.teamBuilder.responsibilityArea")} name="responsibilityArea">
                  <Input placeholder={i18nT("ui.konnected.teamsCollaboration.teamBuilder.eGImpactTrackingFacilitationContentCuration")} />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" onClick={handleAddMember}>
                      {i18nT("ui.konnected.teamsCollaboration.teamBuilder.addToTeam")}
                    </Button>
                    <Text type="secondary">
                      {i18nT("ui.konnected.teamsCollaboration.teamBuilder.youCanAdjustRolesLaterFromMy")}
                    </Text>
                  </Space>
                </Form.Item>
              </Form>
            </Card>

            {/* Members table */}
            <Table<TeamMember>
              rowKey="key"
              size="middle"
              bordered
              columns={memberColumns}
              dataSource={members}
              pagination={false}
              locale={{
                emptyText: i18nT("ui.konnected.teamsCollaboration.teamBuilder.noMembersAddedYet"),
              }}
            />
          </StepsForm.StepForm>

          {/* Step 3 – Review & confirm */}
          <StepsForm.StepForm name="review" title={i18nT("ui.konnected.teamsCollaboration.teamBuilder.reviewConfirm")}>
            <Paragraph style={{ marginBottom: 16 }}>
              {i18nT("ui.konnected.teamsCollaboration.teamBuilder.reviewYourTeamConfigurationBeforeCreatingIt")}
            </Paragraph>

            <Card size="small" style={{ marginBottom: 24 }} title={i18nT("ui.konnected.teamsCollaboration.teamBuilder.teamSummary")}>
              {teamInfo ? (
                <>
                  <Paragraph>
                    <Text strong>{i18nT("ui.konnected.teamsCollaboration.teamBuilder.name")}</Text> {teamInfo.name}
                  </Paragraph>
                  <Paragraph>
                    <Text strong>{i18nT("ui.konnected.teamsCollaboration.teamBuilder.description")}</Text>{' '}
                    {teamInfo.description || <Text type="secondary">{i18nT("ui.konnected.teamsCollaboration.teamBuilder.notProvided")}</Text>}
                  </Paragraph>
                  <Paragraph>
                    <Text strong>{i18nT("ui.konnected.teamsCollaboration.teamBuilder.joinPolicy")}</Text>{' '}
                    {teamInfo.isOpenJoin ? (
                      <Tag color="success">{i18nT("ui.konnected.teamsCollaboration.teamBuilder.requestsAllowed")}</Tag>
                    ) : (
                      <Tag>{i18nT("ui.konnected.teamsCollaboration.teamBuilder.inviteOnly")}</Tag>
                    )}
                  </Paragraph>
                </>
              ) : (
                <Paragraph type="secondary">
                  {i18nT("ui.konnected.teamsCollaboration.teamBuilder.teamInformationIsIncompleteGoBackTo")}
                </Paragraph>
              )}
            </Card>

            <Card
              size="small"
              style={{ marginBottom: 24 }}
              title={i18nT("ui.konnected.teamsCollaboration.teamBuilder.members", { length: members.length })}
            >
              {members.length ? (
                <Table<TeamMember>
                  rowKey="key"
                  size="small"
                  bordered
                  columns={memberColumns}
                  dataSource={members}
                  pagination={false}
                />
              ) : (
                <Paragraph type="secondary">{i18nT("ui.konnected.teamsCollaboration.teamBuilder.noMembersAddedYet")}</Paragraph>
              )}
            </Card>

            <Card
              size="small"
              type="inner"
              title={
                <Space>
                  <ExclamationCircleOutlined />
                  <span>{i18nT("ui.konnected.teamsCollaboration.teamBuilder.beforeYouCreateTheTeam")}</span>
                </Space>
              }
            >
              <ul className="list-disc pl-5">
                <li>{i18nT("ui.konnected.teamsCollaboration.teamBuilder.youWillBeAddedAsAMember")}</li>
                <li>
                  {i18nT("ui.konnected.teamsCollaboration.teamBuilder.teamLeadersCanManageRolesApproveJoin")}
                </li>
                <li>
                  {i18nT("ui.konnected.teamsCollaboration.teamBuilder.youCanAlwaysModifyMembershipLaterFrom")}{' '}
                  <Text strong>{i18nT("ui.konnected.teamsCollaboration.teamBuilder.teamsCollaborationMyTeams")}</Text>.
                </li>
              </ul>
            </Card>
          </StepsForm.StepForm>
        </StepsForm>
      </Card>
    </KonnectedPageShell>
  );
}
