'use client';

// File: app/kreative/collaborative-spaces/start-new-space/page.tsx
import React, { useState } from 'react';
import { Form, Input, Select, Radio, Button, Upload, Space as AntdSpace, message as antdMessage } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@ant-design/pro-components';

const { TextArea } = Input;
const { Option } = Select;

export default function StartNewSpacePage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [fileList, setFileList] = useState<any[]>([]);

  // Upload change handler
  const handleFileChange = (info: any) => {
    setFileList([...info.fileList]);
  };

  // Submit handler
  const onFinish = (values: any) => {
    const spaceData = {
      ...values,
      banner: fileList,
    };
    console.log('New Space Data:', spaceData);
    antdMessage.success('Your new space has been created successfully!');
    router.push('/kreative/collaborative-spaces/new-space-id'); // TODO: replace with created ID
  };

  return (
    <PageContainer title="Start a New Space">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ privacy: 'Public', category: 'Art Study Group' }}
      >
        {/* Space Name */}
        <Form.Item
          label="Space Name"
          name="name"
          rules={[{ required: true, message: 'Please enter a space name.' }]}
        >
          <Input placeholder="Enter the name of your space" />
        </Form.Item>

        {/* Description / Purpose */}
        <Form.Item
          label="Description / Purpose"
          name="description"
          rules={[{ required: true, message: 'Please provide a description for your space.' }]}
        >
          <TextArea rows={5} placeholder="Describe the purpose and vision of your space" />
        </Form.Item>

        {/* Category / Type */}
        <Form.Item
          label="Category / Type"
          name="category"
          rules={[{ required: true, message: 'Please select a category.' }]}
        >
          <Select placeholder="Select a category">
            <Option value="Art Study Group">Art Study Group</Option>
            <Option value="Music Jam Session">Music Jam Session</Option>
            <Option value="Creative Writing Circle">Creative Writing Circle</Option>
            <Option value="Digital Innovation Hub">Digital Innovation Hub</Option>
          </Select>
        </Form.Item>

        {/* Privacy Setting */}
        <Form.Item
          label="Privacy Setting"
          name="privacy"
          rules={[{ required: true, message: 'Please choose a privacy setting.' }]}
        >
          <Radio.Group>
            <Radio value="Public">Public (Anyone can join)</Radio>
            <Radio value="Private">Private (Invite Only)</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Invite Initial Members (only when Private) */}
        <Form.Item shouldUpdate={(prev, cur) => prev.privacy !== cur.privacy}>
          {({ getFieldValue }) =>
            getFieldValue('privacy') === 'Private' ? (
              <Form.List name="invitedMembers">
                {(fields, { add, remove }) => (
                  <>
                    <AntdSpace direction="vertical" style={{ width: '100%' }}>
                      {fields.map((field) => (
                        <AntdSpace key={field.key} align="baseline">
                          <Form.Item
                            {...field}
                            name={[field.name, 'email']}
                            rules={[{ required: true, message: 'Please enter an email address.' }]}
                          >
                            <Input placeholder="Enter member email" />
                          </Form.Item>
                          <Button type="link" onClick={() => remove(field.name)}>
                            Remove
                          </Button>
                        </AntdSpace>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                          Invite Member
                        </Button>
                      </Form.Item>
                    </AntdSpace>
                  </>
                )}
              </Form.List>
            ) : null
          }
        </Form.Item>

        {/* Space Banner or Icon Upload */}
        <Form.Item label="Space Icon / Banner Image" name="banner">
          <Upload
            beforeUpload={() => false} // prevent auto-upload
            fileList={fileList}
            onChange={handleFileChange}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Upload Image</Button>
          </Upload>
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Space
          </Button>
        </Form.Item>
      </Form>
    </PageContainer>
  );
}
