// app/keenkonnect/user-reputation/account-preferences/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Tabs,
  Upload,
  Switch,
  Checkbox,
  Button,
  Modal,
  Radio,
  Form,
  Input,
  message as antdMessage,
} from 'antd';
import type { TabsProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { UploadOutlined } from '@ant-design/icons';
import { uploadUserAvatar } from '@/services/user';

const { TextArea } = Input;

type NotificationTypeValue =
  | 'team-invites'
  | 'project-matches'
  | 'reputation-updates'
  | 'comments-mentions';

type PrivacyShareValue = 'teams' | 'org' | 'public';

type ProfileFormValues = {
  name: string;
  headline?: string;
  email: string;
  bio?: string;
  avatar?: UploadFile[];
  discoverable?: boolean;
};

type SecurityFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  twoFactorEnabled?: boolean;
  loginAlerts?: boolean;
};

type NotificationFormValues = {
  emailNotifications?: boolean;
  inAppNotifications?: boolean;
  notificationTypes: NotificationTypeValue[];
};

type PrivacyFormValues = {
  visibility: 'public' | 'private';
  shareReputationWith?: PrivacyShareValue[];
  showInSearch?: boolean;
};

const notificationEventOptions = [
  { label: 'Team invitations & join requests', value: 'team-invites' as const },
  { label: 'New project matches', value: 'project-matches' as const },
  {
    label: 'Reputation badges & level changes',
    value: 'reputation-updates' as const,
  },
  { label: 'Comments & mentions', value: 'comments-mentions' as const },
];

const privacySharingOptions = [
  { label: 'My teams & collaborators', value: 'teams' as const },
  { label: 'Organization admins', value: 'org' as const },
  { label: 'Everyone on KeenKonnect', value: 'public' as const },
];

// ✅ Always return UploadFile[]
const normFile = (e: any): UploadFile[] => {
  if (Array.isArray(e)) {
    return e as UploadFile[];
  }
  return (e?.fileList ?? []) as UploadFile[];
};

export default function AccountPreferencesPage(): JSX.Element {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // === Submit handlers =======================================================

  const onFinishProfile = async (values: ProfileFormValues) => {
    try {
      const avatarFile = values.avatar?.[0]?.originFileObj as File | undefined;

      if (avatarFile) {
        await uploadUserAvatar(avatarFile);
      }

      // TODO: wire name / headline / bio to a real profile endpoint
      // when the backend fields are available.
      // eslint-disable-next-line no-console
      console.log('Profile info submitted:', values);

      antdMessage.success('Profile information updated successfully.');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update profile', error);
      antdMessage.error(
        'Unable to update profile for now. Please try again later.',
      );
    }
  };

  const onFinishSecurity = (values: SecurityFormValues) => {
    // eslint-disable-next-line no-console
    console.log('Security settings submitted:', values);
    antdMessage.success('Security settings updated successfully.');
  };

  const onFinishNotifications = (values: NotificationFormValues) => {
    // eslint-disable-next-line no-console
    console.log('Notification settings submitted:', values);
    antdMessage.success('Notification preferences updated successfully.');
  };

  const onFinishPrivacy = (values: PrivacyFormValues) => {
    // eslint-disable-next-line no-console
    console.log('Privacy settings submitted:', values);
    antdMessage.success('Privacy preferences updated successfully.');
  };

  // === Danger zone modal =====================================================

  const showDeleteModal = () => {
    setIsModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setIsModalVisible(false);
  };

  const handleDeleteConfirm = () => {
    // eslint-disable-next-line no-console
    console.log('Account deletion requested');
    antdMessage.success(
      'Account deletion requested. We will contact you shortly.',
    );
    setIsModalVisible(false);
  };

  const items: TabsProps['items'] = [
    {
      key: 'profile',
      label: 'Profile Info',
      children: (
        <Form<ProfileFormValues>
          layout="vertical"
          onFinish={onFinishProfile}
          initialValues={{
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            discoverable: true,
          }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input placeholder="Your display name on KeenKonnect" />
          </Form.Item>

          <Form.Item
            name="headline"
            label="Headline"
            tooltip="Short headline shown in suggestions and team matching."
          >
            <Input placeholder="Product leader, open to cross-team collaboration" />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="bio"
            label="Short bio"
            tooltip="Explain how you like to work, preferred domains, or collaboration style."
          >
            <TextArea
              autoSize={{ minRows: 3, maxRows: 5 }}
              placeholder="Tell collaborators a bit about how you like to work."
            />
          </Form.Item>

          <Form.Item
            name="avatar"
            label="Profile picture"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            extra="This picture is visible to collaborators across Ekoh & KeenKonnect."
          >
            <Upload
              name="avatar"
              listType="picture-card"
              maxCount={1}
              // We handle the upload on form submit
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            name="discoverable"
            label="Profile discoverability"
            valuePropName="checked"
          >
            <div>
              <Switch />
              <span style={{ marginLeft: 8 }}>
                Make my KeenKonnect profile discoverable in search &amp; suggestions
              </span>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Profile
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'security',
      label: 'Security',
      children: (
        <Form<SecurityFormValues>
          layout="vertical"
          onFinish={onFinishSecurity}
          initialValues={{
            loginAlerts: true,
          }}
        >
          <Form.Item
            name="currentPassword"
            label="Current password"
            rules={[
              { required: true, message: 'Please enter your current password' },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New password"
            rules={[
              { required: true, message: 'Please enter your new password' },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirmNewPassword"
            label="Confirm new password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('The new password and confirmation do not match.'),
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="twoFactorEnabled"
            label="Two-factor authentication"
            valuePropName="checked"
          >
            <div>
              <Switch />
              <span style={{ marginLeft: 8 }}>
                Require a second step when signing in from a new device
              </span>
            </div>
          </Form.Item>

          <Form.Item
            name="loginAlerts"
            label="Login alerts"
            valuePropName="checked"
          >
            <div>
              <Switch />
              <span style={{ marginLeft: 8 }}>
                Send me an alert when my account is accessed from a new location
              </span>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Security Settings
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'notifications',
      label: 'Notifications',
      children: (
        <Form<NotificationFormValues>
          layout="vertical"
          onFinish={onFinishNotifications}
          initialValues={{
            emailNotifications: true,
            inAppNotifications: true,
            notificationTypes: ['team-invites', 'reputation-updates'],
          }}
        >
          <Form.Item
            name="emailNotifications"
            label="Email notifications"
            valuePropName="checked"
          >
            <div>
              <Switch />
              <span style={{ marginLeft: 8 }}>
                Receive important updates by email
              </span>
            </div>
          </Form.Item>

          <Form.Item
            name="inAppNotifications"
            label="In-app notifications"
            valuePropName="checked"
          >
            <div>
              <Switch />
              <span style={{ marginLeft: 8 }}>
                Show notifications inside Ekoh &amp; KeenKonnect
              </span>
            </div>
          </Form.Item>

          <Form.Item
            name="notificationTypes"
            label="Notify me about"
            rules={[
              {
                required: true,
                message: 'Select at least one type of notification',
              },
            ]}
          >
            <Checkbox.Group options={notificationEventOptions} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Notification Settings
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'privacy',
      label: 'Privacy',
      children: (
        <Form<PrivacyFormValues>
          layout="vertical"
          onFinish={onFinishPrivacy}
          initialValues={{
            visibility: 'public',
            shareReputationWith: ['teams', 'org'],
            showInSearch: true,
          }}
        >
          <Form.Item name="visibility" label="Profile visibility">
            <Radio.Group>
              <Radio value="public">
                Public – visible to all KeenKonnect users
              </Radio>
              <Radio value="private">
                Private – only visible to you
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="shareReputationWith"
            label="Share my reputation details with"
          >
            <Checkbox.Group options={privacySharingOptions} />
          </Form.Item>

          <Form.Item
            name="showInSearch"
            label="Search visibility"
            valuePropName="checked"
          >
            <div>
              <Switch />
              <span style={{ marginLeft: 8 }}>
                Allow my profile to appear in team matching &amp; collaborator search
              </span>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Privacy Settings
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'danger',
      label: 'Danger Zone',
      children: (
        <div
          style={{
            border: '1px solid #ffccc7',
            borderRadius: 8,
            padding: 24,
            background: '#fff1f0',
          }}
        >
          <h3 style={{ color: '#cf1322', marginBottom: 8 }}>Delete Account</h3>
          <p style={{ marginBottom: 16 }}>
            Deleting your account will permanently remove your KeenKonnect profile,
            reputation data and collaboration history. This action cannot be undone.
          </p>
          <Button danger type="primary" onClick={showDeleteModal}>
            Delete my account
          </Button>

          <Modal
            title="Confirm Account Deletion"
            open={isModalVisible}
            okText="Yes, delete my account"
            okButtonProps={{ danger: true }}
            onOk={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          >
            <p>
              Are you sure you want to delete your account? This will remove your
              KeenKonnect profile and unlink your reputation from any teams.
            </p>
          </Modal>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4">Account &amp; Preferences</h1>

      <Tabs defaultActiveKey="profile" items={items} />
    </div>
  );
}
