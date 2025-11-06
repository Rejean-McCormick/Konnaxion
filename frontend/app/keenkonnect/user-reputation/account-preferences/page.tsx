'use client'

// File: /pages/keenkonnect/user-reputation/account-preferences.tsx
import React, { useState } from "react";
import { NextPage } from "next";
import {
  Tabs,
  Form,
  Input,
  Button,
  Upload,
  Modal,
  Switch,
  Radio,
  message
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import PageContainer from "@/components/PageContainer";
// Ajout de l'import de MainLayout pour appliquer le layout global
import MainLayout from "@/components/layout-components/MainLayout";

const { TabPane } = Tabs;

const AccountPreferencesPage: NextPage = () => {
  // État pour gérer la visibilité du Modal de suppression de compte
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Gestion des événements liés au Modal de suppression
  const showDeleteModal = () => {
    setIsModalVisible(true);
  const handleDeleteCancel = () => {
    setIsModalVisible(false);
  const handleDeleteConfirm = () => {
    // Ici, vous appellerez éventuellement une API pour la suppression de compte
    message.success("Account deletion requested.");
    setIsModalVisible(false);

  // Gestion des soumissions de formulaire pour chaque section
  const onFinishProfile = (values: any) => {
    console.log("Profile Info:", values);
    message.success("Profile info saved.");

  const onFinishSecurity = (values: any) => {
    console.log("Security Info:", values);
    message.success("Security info saved.");

  const onFinishNotifications = (values: any) => {
    console.log("Notifications Settings:", values);
    message.success("Notifications settings saved.");

  const onFinishPrivacy = (values: any) => {
    console.log("Privacy Settings:", values);
    message.success("Privacy settings saved.");

  return (
    <PageContainer title="Account & Preferences">
      <Tabs defaultActiveKey="profile">
        {/* ===== Section Profile Info ===== */}
        <TabPane tab="Profile Info" key="profile">
          <Form
            layout="vertical"
            onFinish={onFinishProfile}
            initialValues={{
              name: "John Doe",
              email: "john.doe@example.com",
            }}
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

        {/* ===== Section Security ===== */}
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
                    return Promise.reject("The two passwords do not match!");
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            {/* Vous pouvez ajouter ici des paramètres 2FA si nécessaire */}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Security Settings
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        {/* ===== Section Notifications ===== */}
        <TabPane tab="Notifications" key="notifications">
          <Form
            layout="vertical"
            onFinish={onFinishNotifications}
            initialValues={{ teamInvites: true, emailUpdates: false }}
          >
            <Form.Item
              label="Team Invites"
              name="teamInvites"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Email Updates"
              name="emailUpdates"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Notification Settings
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        {/* ===== Section Privacy ===== */}
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

        {/* ===== Section Danger Zone ===== */}
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

// Correction : envelopper la page dans MainLayout via la fonction getLayout

  return <MainLayout>{page}</MainLayout>;

export default AccountPreferencesPage;
