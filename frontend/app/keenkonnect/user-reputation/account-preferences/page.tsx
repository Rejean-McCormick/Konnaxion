'use client'

import React, { useState } from "react";
import {
  Tabs,
  Form,
  Input,
  Button,
  Upload,
  Modal,
  Switch,
  Radio,
  message as antdMessage,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import PageContainer from "@/components/PageContainer";

const { TabPane } = Tabs;

export default function AccountPreferencesPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Modal handlers
  const showDeleteModal = () => {
    setIsModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setIsModalVisible(false);
  };

  const handleDeleteConfirm = () => {
    // Appel API éventuel pour suppression de compte
    antdMessage.success("Account deletion requested.");
    setIsModalVisible(false);
  };

  // Form handlers
  const onFinishProfile = (values: any) => {
    console.log("Profile Info:", values);
    antdMessage.success("Profile info saved.");
  };

  const onFinishSecurity = (values: any) => {
    console.log("Security Info:", values);
    antdMessage.success("Security info saved.");
  };

  const onFinishNotifications = (values: any) => {
    console.log("Notifications Settings:", values);
    antdMessage.success("Notifications settings saved.");
  };

  const onFinishPrivacy = (values: any) => {
    console.log("Privacy Settings:", values);
    antdMessage.success("Privacy settings saved.");
  };

  return (
    <PageContainer title="Account & Preferences">
      <Tabs defaultActiveKey="profile">
        {/* ===== Profile Info ===== */}
        <TabPane tab="Profile Info" key="profile">
          <Form
            layout="vertical"
            onFinish={onFinishProfile}
            initialValues={{ name: "John Doe", email: "john.doe@example.com" }}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input readOnly />
            </Form.Item>
            <Form.Item label="Profile Picture" name="avatar">
              <Upload name="avatar" listType="picture" showUploadList={false}>
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Profile
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        {/* ===== Security ===== */}
        <TabPane tab="Security" key="security">
          <Form layout="vertical" onFinish={onFinishSecurity}>
            <Form.Item
              label="Current Password"
              name="currentPassword"
              rules={[{ required: true, message: "Please enter your current password" }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[{ required: true, message: "Please enter your new password" }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="Confirm New Password"
              name="confirmNewPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Please confirm your new password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("The two passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Security Settings
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        {/* ===== Notifications ===== */}
        <TabPane tab="Notifications" key="notifications">
          <Form
            layout="vertical"
            onFinish={onFinishNotifications}
            initialValues={{ teamInvites: true, emailUpdates: false }}
          >
            <Form.Item label="Team Invites" name="teamInvites" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Email Updates" name="emailUpdates" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Notification Settings
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        {/* ===== Privacy ===== */}
        <TabPane tab="Privacy" key="privacy">
          <Form
            layout="vertical"
            onFinish={onFinishPrivacy}
            initialValues={{ visibility: "public" }}
          >
            <Form.Item label="Profile Visibility" name="visibility">
              <Radio.Group>
                <Radio value="public">Public</Radio>
                <Radio value="private">Private</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Privacy Settings
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        {/* ===== Danger Zone ===== */}
        <TabPane tab="Danger Zone" key="danger">
          <div
            style={{
              padding: "16px",
              background: "#fff",
              border: "1px solid #f0f0f0",
              borderRadius: "4px",
            }}
          >
            <p style={{ color: "red", fontWeight: "bold" }}>
              Warning: Deleting your account is irreversible. Please proceed with caution.
            </p>
            <Button type="primary" danger onClick={showDeleteModal}>
              Delete Account
            </Button>
            <Modal
              title="Confirm Account Deletion"
              open={isModalVisible}
              onOk={handleDeleteConfirm}
              onCancel={handleDeleteCancel}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
              <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            </Modal>
          </div>
        </TabPane>
      </Tabs>
    </PageContainer>
  );
}
