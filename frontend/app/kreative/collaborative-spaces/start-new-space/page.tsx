// FILE: frontend/app/kreative/collaborative-spaces/start-new-space/page.tsx
// app/kreative/collaborative-spaces/start-new-space/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Form,
  Input,
  Radio,
  Select,
  Space,
  Typography,
  Upload,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useState } from 'react';

import KreativePageShell from '@/app/kreative/kreativePageShell';
import PageContainer from '@/components/PageContainer';
import { createCollabSession } from '@/services/kreative';

const { TextArea } = Input;
const { Option } = Select;
const { Paragraph } = Typography;

type PrivacyOption = 'Public' | 'Private';

interface InvitedMemberField {
  email: string;
}

interface StartNewSpaceFormValues {
  name: string;
  description: string;
  category: string;
  privacy: PrivacyOption;
  invitedMembers?: InvitedMemberField[];
  banner?: UploadFile[];
}

// Minimal type for Upload onChange (keeps us away from implicit any)
type UploadChangeParamLite = {
  fileList: UploadFile[];
};

export default function StartNewSpacePage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [form] = Form.useForm<StartNewSpaceFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (info: UploadChangeParamLite) => {
    setFileList(info.fileList);
  };

  const onFinish = async (values: StartNewSpaceFormValues) => {
    const sessionType =
      values.category === 'Music Jam Session'
        ? 'music'
        : values.category === 'Art Study Group'
          ? 'painting'
          : 'mixed';

    setSubmitting(true);
    try {
      const created = await createCollabSession({
        name: values.name,
        session_type: sessionType,
      });
      form.resetFields();
      setFileList([]);
      return created;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KreativePageShell
      title={i18nT("ui.kreative.collaborativeSpaces.startNewSpace.startANewSpace")}
      subtitle={i18nT("ui.kreative.collaborativeSpaces.startNewSpace.defineYourCollaborativeSpaceSoOthersCan")}
    >
      <PageContainer title={i18nT("ui.kreative.collaborativeSpaces.startNewSpace.startANewSpace")}>
        <Alert
          type="info"
          showIcon
          message={i18nT("ui.kreative.collaborativeSpaces.startNewSpace.coreCollaborationSessionIsPersisted")}
          description={i18nT("ui.kreative.collaborativeSpaces.startNewSpace.nameAndSessionTypeAreSavedThrough")}
          style={{ marginBottom: 16 }}
        />
        <Paragraph type="secondary" style={{ marginBottom: 24 }}>
          {i18nT("ui.kreative.collaborativeSpaces.startNewSpace.defineYourCollaborativeSpaceSoOthersCan")}
        </Paragraph>

        <Form<StartNewSpaceFormValues>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ privacy: 'Public', category: 'Art Study Group' }}
        >
          {/* Space Name */}
          <Form.Item
            label={i18nT("ui.kreative.collaborativeSpaces.startNewSpace.spaceName")}
            name="name"
            rules={[{ required: true, message: i18nT("ui.kreative.collaborativeSpaces.startNewSpace.pleaseEnterASpaceName") }]}
          >
            <Input placeholder={i18nT("ui.kreative.collaborativeSpaces.startNewSpace.enterTheNameOfYourSpace")} />
          </Form.Item>

          {/* Description / Purpose */}
          <Form.Item
            label={i18nT("ui.kreative.collaborativeSpaces.startNewSpace.descriptionPurpose")}
            name="description"
            rules={[
              {
                required: true,
                message: i18nT("ui.kreative.collaborativeSpaces.startNewSpace.pleaseProvideADescriptionForYourSpace"),
              },
            ]}
          >
            <TextArea
              rows={5}
              placeholder={i18nT("ui.kreative.collaborativeSpaces.startNewSpace.describeThePurposeAndVisionOfYour")}
            />
          </Form.Item>

          {/* Category / Type */}
          <Form.Item
            label={i18nT("ui.kreative.collaborativeSpaces.startNewSpace.categoryType")}
            name="category"
            rules={[{ required: true, message: i18nT("ui.kreative.collaborativeSpaces.startNewSpace.pleaseSelectACategory") }]}
          >
            <Select placeholder={i18nT("ui.kreative.collaborativeSpaces.startNewSpace.selectACategory")}>
              <Option value="Art Study Group">{i18nT("ui.kreative.collaborativeSpaces.startNewSpace.artStudyGroup")}</Option>
              <Option value="Music Jam Session">{i18nT("ui.kreative.collaborativeSpaces.startNewSpace.musicJamSession")}</Option>
              <Option value="Creative Writing Circle">
                {i18nT("ui.kreative.collaborativeSpaces.startNewSpace.creativeWritingCircle")}
              </Option>
              <Option value="Digital Innovation Hub">
                {i18nT("ui.kreative.collaborativeSpaces.startNewSpace.digitalInnovationHub")}
              </Option>
            </Select>
          </Form.Item>

          {/* Privacy Setting */}
          <Form.Item
            label={i18nT("ui.kreative.collaborativeSpaces.startNewSpace.privacySetting")}
            name="privacy"
            rules={[{ required: true, message: i18nT("ui.kreative.collaborativeSpaces.startNewSpace.pleaseChooseAPrivacySetting") }]}
          >
            <Radio.Group>
              <Radio value="Public">{i18nT("ui.kreative.collaborativeSpaces.startNewSpace.publicAnyoneCanJoin")}</Radio>
              <Radio value="Private">{i18nT("ui.kreative.collaborativeSpaces.startNewSpace.privateInviteOnly")}</Radio>
            </Radio.Group>
          </Form.Item>

          {/* Invite Initial Members (only when Private) */}
          <Form.Item shouldUpdate={(prev, cur) => prev.privacy !== cur.privacy}>
            {({ getFieldValue }) =>
              getFieldValue('privacy') === 'Private' ? (
                <Form.List name="invitedMembers">
                  {(fields, { add, remove }) => (
                    <Space
                      direction="vertical"
                      style={{ width: '100%' }}
                    >
                      {fields.map((field) => (
                        <Space key={field.key} align="baseline">
                          <Form.Item
                            {...field}
                            name={[field.name, 'email']}
                            rules={[
                              {
                                required: true,
                                message: i18nT("ui.kreative.collaborativeSpaces.startNewSpace.pleaseEnterAnEmailAddress"),
                              },
                              {
                                type: 'email',
                                message: i18nT("ui.kreative.collaborativeSpaces.startNewSpace.pleaseEnterAValidEmailAddress"),
                              },
                            ]}
                          >
                            <Input placeholder={i18nT("ui.kreative.collaborativeSpaces.startNewSpace.enterMemberEmail")} />
                          </Form.Item>
                          <Button
                            type="link"
                            onClick={() => remove(field.name)}
                          >
                            {i18nT("ui.kreative.collaborativeSpaces.startNewSpace.remove")}
                          </Button>
                        </Space>
                      ))}
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          icon={<PlusOutlined />}
                        >
                          {i18nT("ui.kreative.collaborativeSpaces.startNewSpace.inviteMember")}
                        </Button>
                      </Form.Item>
                    </Space>
                  )}
                </Form.List>
              ) : null
            }
          </Form.Item>

          {/* Space Banner or Icon Upload */}
          <Form.Item label={i18nT("ui.kreative.collaborativeSpaces.startNewSpace.spaceIconBannerImage")} name="banner">
            <Upload
              beforeUpload={() => false} // prevent auto-upload
              fileList={fileList}
              onChange={handleFileChange}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>{i18nT("ui.kreative.collaborativeSpaces.startNewSpace.uploadImage")}</Button>
            </Upload>
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {i18nT("ui.kreative.collaborativeSpaces.startNewSpace.createSpace")}
            </Button>
          </Form.Item>
        </Form>
      </PageContainer>
    </KreativePageShell>
  );
}
