'use client'

// File: /pages/kreative/collaborative-spaces/start-new-space.tsx
import React, { useState } from 'react';
import { NextPage } from 'next';
import {
  Form,
  Input,
  Select,
  Radio,
  Button,
  Upload,
  Space as AntdSpace,
  message,
} from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';
import Icon from '@/components/compat/Icon';


const { TextArea } = Input;
const { Option } = Select;

const StartNewSpace: NextPage = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  // State to manage file uploads for the space banner or icon.
  const [fileList, setFileList] = useState<any[]>([]);

  // Handler for file upload changes.
  const handleFileChange = (info: any) => {
    // Prevent automatic upload and update fileList locally.
    setFileList([...info.fileList]);
  };

  // Handler when the form is submitted.
  const onFinish = (values: any) => {
    const spaceData = {
      ...values,
      // Include the file information from fileList (to be handled by an API).
      banner: fileList,
    };
    console.log('New Space Data:', spaceData);
    message.success('Your new space has been created successfully!');
    // Optionally auto-join the user and then redirect to the space’s detail page.
    router.push('/kreative/collaborative-spaces/' + 'new-space-id'); // Replace 'new-space-id' with the actual ID.
  };

  return (
    <PageContainer title="Start a New Space">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          privacy: 'Public',
          category: 'Art Study Group',
        }}
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
          rules={[
            { required: true, message: 'Please provide a description for your space.' },
          ]}
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

        {/* Invite Initial Members - Conditional on Private Privacy */}
        <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.privacy !== curValues.privacy}>
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
                            fieldKey={[field.fieldKey, 'email']}
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
            beforeUpload={() => false} // Prevent auto-upload.
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
};

StartNewSpace.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default StartNewSpace;
