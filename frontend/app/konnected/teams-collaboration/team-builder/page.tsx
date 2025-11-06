'use client';

import React, { useMemo, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Steps, Form, Input, Button, Space, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';

type TeamInfo = {
  name: string;
  description?: string;

type Member = {
  id?: string;       // may be undefined when newly added
  email: string;
  role?: string;

export default function TeamBuilderPage() {
  const router = useRouter();

  // ----- Step state -----
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = useMemo(
    () => [{ title: 'Team Info' }, { title: 'Invite Members' }],
    []
  );

  // ----- Form state -----
  const [teamInfoForm] = Form.useForm<TeamInfo>();
  const [inviteForm] = Form.useForm<Member>();

  const [teamInfo, setTeamInfo] = useState<TeamInfo>({ name: '' });
  const [members, setMembers] = useState<Member[]>([]);

  // ----- Table columns with safe row keys -----
  const columns: ColumnsType<Member> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <Typography.Text>{text}</Typography.Text>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (text?: string) => <Typography.Text>{text || 'Member'}</Typography.Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            onClick={() =>
              setMembers((prev) =>
                prev.filter((m) => (m.id ?? m.email) !== (record.id ?? record.email))
              )
            }
          >
            Remove
          </Button>
        </Space>
      ),
    },
  ];

  // ----- Handlers -----
  const submitTeamInfo = async () => {
    try {
      const values = await teamInfoForm.validateFields();
      setTeamInfo(values);
      setCurrentStep(1);
    } catch {
      // validation errors are shown by antd
    }

  const addMember = async () => {
    try {
      const values = await inviteForm.validateFields();
      // ensure a stable non-undefined key; prefer provided id else generate from email
      const stableId = values.id && values.id.trim().length > 0
        ? values.id
        : `${values.email.toLowerCase()}-${Date.now()}`;

      setMembers((prev) => {
        // dedupe by email
        if (prev.some((m) => m.email.toLowerCase() === values.email.toLowerCase())) {
          message.warning('This email is already invited.');
          return prev;
        }
        return [...prev, { ...values, id: stableId }];
      });
      inviteForm.resetFields();
    } catch {
      // validation errors are shown by antd
    }

  const finish = async () => {
    // TODO: replace with actual API call
    message.success('Team created');
    router.push('/konnected/teams-collaboration/project-workspaces');

  return (
    <PageContainer title="Team Builder">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Steps current={currentStep} items={steps} />

        {currentStep === 0 && (
          <Form
            form={teamInfoForm}
            layout="vertical"
            initialValues={teamInfo}
            onFinish={submitTeamInfo}
          >
            <Form.Item
              label="Team name"
              name="name"
              rules={[{ required: true, message: 'Please enter a team name' }]}
            >
              <Input placeholder="e.g. Product Growth" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea placeholder="Optional description" autoSize={{ minRows: 3 }} />
            </Form.Item>

            <Space>
              <Button type="primary" htmlType="submit">
                Next
              </Button>
            </Space>
          </Form>
        )}

        {currentStep === 1 && (
          <>
            <Form form={inviteForm} layout="inline" onFinish={addMember}>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Email required' },
                  { type: 'email', message: 'Invalid email' },
                ]}
              >
                <Input placeholder="member@example.com" />
              </Form.Item>

              <Form.Item name="role" initialValue="Member">
                <Input placeholder="Role (optional)" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Add
                </Button>
              </Form.Item>
            </Form>

            <Table<Member>
              dataSource={members}
              columns={columns}
              // rowKey fix: never undefined
              rowKey={(record) => record.id ?? record.email}
              pagination={false}
            />

            <Space>
              <Button onClick={() => setCurrentStep(0)}>Back</Button>
              <Button
                type="primary"
                onClick={finish}
                disabled={!teamInfo.name || members.length === 0}
              >
                Create team
              </Button>
            </Space>
          </>
        )}
      </Space>
    </PageContainer>
  );
}
