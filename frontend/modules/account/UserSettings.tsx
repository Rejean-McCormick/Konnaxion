// FILE: frontend/modules/account/UserSettings.tsx
// frontend/modules/account/UserSettings.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  LockOutlined,
  MailOutlined,
  NotificationOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Alert,
  Button,
  Form,
  Input,
  Space,
  Switch,
  Tabs,
  Typography,
} from 'antd';
import type { TabsProps } from 'antd';
import React from 'react';

import usePageTitle from '@/hooks/usePageTitle';

const { Title, Paragraph, Text } = Typography;

type ProfileSettingsValues = {
  displayName: string;
  username: string;
  bio?: string;
};

type SecuritySettingsValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type NotificationSettingsValues = {
  emailActivity: boolean;
  emailDigest: boolean;
  pushImportant: boolean;
};

type PrivacySettingsValues = {
  publicProfile: boolean;
  showBadges: boolean;
  showActivity: boolean;
};

// Simple placeholder submit handler – wire to your API as needed.
function fakeSubmit(message: string) {
   
  console.log(`[UserSettings] ${message}`);
}

const ProfileSettingsTab: React.FC = () => {
  const { t: i18nT } = useLanguage();
  const [form] = Form.useForm<ProfileSettingsValues>();

  const onFinish = (values: ProfileSettingsValues) => {
    fakeSubmit(`Profile updated: ${JSON.stringify(values)}`);
  };

  return (
    <>
      <Title level={4}>{i18nT("ui.account.usersettings.profile")}</Title>
      <Paragraph type="secondary">
        {i18nT("ui.account.usersettings.updateYourBasicAccountInformationThisIs")}
      </Paragraph>

      <Form<ProfileSettingsValues>
        form={form}
        layout="vertical"
        initialValues={{
          displayName: '',
          username: '',
          bio: '',
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="displayName"
          label={i18nT("ui.account.usersettings.displayName")}
          rules={[{ required: true, message: i18nT("ui.account.usersettings.pleaseEnterADisplayName") }]}
        >
          <Input prefix={<UserOutlined />} placeholder={i18nT("ui.account.usersettings.yourName")} />
        </Form.Item>

        <Form.Item
          name="username"
          label={i18nT("ui.account.usersettings.username")}
          rules={[{ required: true, message: i18nT("ui.account.usersettings.pleaseEnterAUsername") }]}
        >
          <Input addonBefore="@" placeholder={i18nT("ui.account.usersettings.handle")} />
        </Form.Item>

        <Form.Item name="bio" label={i18nT("ui.account.usersettings.bio")}>
          <Input.TextArea rows={3} placeholder={i18nT("ui.account.usersettings.shortBioShownOnYourPublicProfile")} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {i18nT("ui.account.usersettings.saveChanges")}
            </Button>
            <Text type="secondary">{i18nT("ui.account.usersettings.changesMayTakeAFewSecondsTo")}</Text>
          </Space>
        </Form.Item>
      </Form>
    </>
  );
};

const SecuritySettingsTab: React.FC = () => {
  const { t: i18nT } = useLanguage();
  const [form] = Form.useForm<SecuritySettingsValues>();

  const onFinish = (values: SecuritySettingsValues) => {
    fakeSubmit(`Security updated: ${JSON.stringify(values)}`);
  };

  return (
    <>
      <Title level={4}>{i18nT("ui.account.usersettings.security")}</Title>
      <Paragraph type="secondary">
        {i18nT("ui.account.usersettings.changeYourPasswordAndReviewBasicSecurity")}
      </Paragraph>

      <Form<SecuritySettingsValues>
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="currentPassword"
          label={i18nT("ui.account.usersettings.currentPassword")}
          rules={[{ required: true, message: i18nT("ui.account.usersettings.pleaseEnterYourCurrentPassword") }]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label={i18nT("ui.account.usersettings.newPassword")}
          rules={[{ required: true, message: i18nT("ui.account.usersettings.pleaseEnterANewPassword") }]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={i18nT("ui.account.usersettings.confirmNewPassword")}
          dependencies={['newPassword']}
          rules={[
            { required: true, message: i18nT("ui.account.usersettings.pleaseConfirmYourNewPassword") },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('The two passwords do not match'),
                );
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {i18nT("ui.account.usersettings.updatePassword")}
            </Button>
          </Space>
        </Form.Item>

        <Alert
          type="info"
          showIcon
          message={i18nT("ui.account.usersettings.twoFactorAuthentication")}
          description={i18nT("ui.account.usersettings.whenReadyYouCanExtendThisSection")}
        />
      </Form>
    </>
  );
};

const NotificationSettingsTab: React.FC = () => {
  const { t: i18nT } = useLanguage();
  const onFinish = (values: NotificationSettingsValues) => {
    fakeSubmit(`Notifications updated: ${JSON.stringify(values)}`);
  };

  return (
    <>
      <Title level={4}>{i18nT("ui.account.usersettings.notifications")}</Title>
      <Paragraph type="secondary">
        {i18nT("ui.account.usersettings.chooseHowYouWantToBeNotified")}
      </Paragraph>

      <Form<NotificationSettingsValues>
        layout="vertical"
        initialValues={{
          emailActivity: true,
          emailDigest: true,
          pushImportant: true,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="emailActivity"
          valuePropName="checked"
          label={i18nT("ui.account.usersettings.emailMeAboutNewActivity")}
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="emailDigest"
          valuePropName="checked"
          label={i18nT("ui.account.usersettings.sendAWeeklySummaryDigest")}
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="pushImportant"
          valuePropName="checked"
          label={i18nT("ui.account.usersettings.showInAppAlertsForImportantEvents")}
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<NotificationOutlined />}>
            {i18nT("ui.account.usersettings.saveNotificationSettings")}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

const PrivacySettingsTab: React.FC = () => {
  const { t: i18nT } = useLanguage();
  const onFinish = (values: PrivacySettingsValues) => {
    fakeSubmit(`Privacy updated: ${JSON.stringify(values)}`);
  };

  return (
    <>
      <Title level={4}>{i18nT("ui.account.usersettings.privacy")}</Title>
      <Paragraph type="secondary">
        {i18nT("ui.account.usersettings.controlHowYourProfileAndActivityAppear")}
      </Paragraph>

      <Form<PrivacySettingsValues>
        layout="vertical"
        initialValues={{
          publicProfile: true,
          showBadges: true,
          showActivity: true,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="publicProfile"
          valuePropName="checked"
          label={i18nT("ui.account.usersettings.makeMyProfileDiscoverable")}
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="showBadges"
          valuePropName="checked"
          label={i18nT("ui.account.usersettings.showMyBadgesOnMyPublicProfile")}
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="showActivity"
          valuePropName="checked"
          label={i18nT("ui.account.usersettings.showMyRecentActivityOnMyProfile")}
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {i18nT("ui.account.usersettings.savePrivacySettings")}
            </Button>
            <Text type="secondary">
              {i18nT("ui.account.usersettings.theseSettingsOnlyAffectWhatOtherUsers")}
            </Text>
          </Space>
        </Form.Item>
      </Form>
    </>
  );
};

const UserSettings: React.FC = () => {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.account.usersettings.accountSettings"));

  const items: TabsProps['items'] = [
    {
      key: 'profile',
      label: (
        <Space>
          <UserOutlined />
          <span>{i18nT("ui.account.usersettings.profile")}</span>
        </Space>
      ),
      children: <ProfileSettingsTab />,
    },
    {
      key: 'security',
      label: (
        <Space>
          <LockOutlined />
          <span>{i18nT("ui.account.usersettings.security")}</span>
        </Space>
      ),
      children: <SecuritySettingsTab />,
    },
    {
      key: 'notifications',
      label: (
        <Space>
          <NotificationOutlined />
          <span>{i18nT("ui.account.usersettings.notifications")}</span>
        </Space>
      ),
      children: <NotificationSettingsTab />,
    },
    {
      key: 'privacy',
      label: (
        <Space>
          <MailOutlined />
          <span>{i18nT("ui.account.usersettings.privacy")}</span>
        </Space>
      ),
      children: <PrivacySettingsTab />,
    },
  ];

  return (
    <PageContainer
      header={{
        title: i18nT("ui.account.usersettings.userSettings"),
        subTitle: i18nT("ui.account.usersettings.manageYourProfileSecurityNotificationsAndPrivacy"),
      }}
    >
      <Tabs defaultActiveKey="profile" items={items} />
    </PageContainer>
  );
};

export default UserSettings;
