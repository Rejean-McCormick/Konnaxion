'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Alert, Button, Form, Input, Select } from 'antd';
import React from 'react';

import KreativePageShell from '@/app/kreative/kreativePageShell';

const { TextArea } = Input;
const { Option } = Select;

type IdeaFormValues = {
  title: string;
  description: string;
  category: string;
};

export default function CreateNewIdea(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [form] = Form.useForm<IdeaFormValues>();

  return (
    <KreativePageShell
      title={i18nT("ui.kreative.ideaIncubator.createNewIdea.createNewIdea")}
      subtitle={i18nT("ui.kreative.ideaIncubator.createNewIdea.previewTheIntendedIdeaIncubatorIntakeModel")}
    >
      <Alert
        type="info"
        showIcon
        message={i18nT("ui.kreative.ideaIncubator.createNewIdea.ideaCreationIsADeclaredPreview")}
        description={i18nT("ui.kreative.ideaIncubator.createNewIdea.kreativeDoesNotExposeAnIdeaIncubator")}
        style={{ marginBottom: 16 }}
      />
      <Form<IdeaFormValues> form={form} layout="vertical">
        <Form.Item label={i18nT("ui.kreative.ideaIncubator.createNewIdea.titleOfIdea")} name="title">
          <Input placeholder={i18nT("ui.kreative.ideaIncubator.createNewIdea.enterTitleOfYourIdea")} />
        </Form.Item>
        <Form.Item label={i18nT("ui.kreative.ideaIncubator.createNewIdea.detailedDescription")} name="description">
          <TextArea rows={6} placeholder={i18nT("ui.kreative.ideaIncubator.createNewIdea.explainYourIdeaAndTheProblemIt")} />
        </Form.Item>
        <Form.Item label={i18nT("ui.kreative.ideaIncubator.createNewIdea.categoryField")} name="category">
          <Select placeholder={i18nT("ui.kreative.ideaIncubator.createNewIdea.selectACategory")}>
            <Option value="Technology">{i18nT("ui.kreative.ideaIncubator.createNewIdea.technology")}</Option>
            <Option value="Art">{i18nT("ui.kreative.ideaIncubator.createNewIdea.art")}</Option>
            <Option value="Education">{i18nT("ui.kreative.ideaIncubator.createNewIdea.education")}</Option>
            <Option value="Health">{i18nT("ui.kreative.ideaIncubator.createNewIdea.health")}</Option>
            <Option value="Environment">{i18nT("ui.kreative.ideaIncubator.createNewIdea.environment")}</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" disabled>
            {i18nT("ui.kreative.ideaIncubator.createNewIdea.submitUnavailable")}
          </Button>
        </Form.Item>
      </Form>
    </KreativePageShell>
  );
}
