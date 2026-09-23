'use client';

// FILE: frontend/modules/konsultations/components/ConsultationForm.tsx
﻿import { useRequest } from 'ahooks';
import { useLanguage } from '@/context/LanguageContext';
import { message as antdMessage, Button, Form, Slider } from 'antd';
import React, { useState } from 'react';

import { post } from '@/services/_request';

interface ConsultationFormProps {
  // Made optional so <ConsultationForm /> without props in ConsultationHub compiles;
  // runtime guard below ensures we don't submit without an ID.
  consultationId?: string | number;
  // Optionally, currentValue could be passed in to show existing stance
  initialValue?: number;
}

const stanceMarks = {
  [-3]: '-3',
  [-2]: '-2',
  [-1]: '-1',
  0: '0',
  1: '1',
  2: '2',
  3: '3',
};

const stanceLabels: Record<number, string> = {
  [-3]: 'Strongly Against',
  [-2]: 'Against',
  [-1]: 'Slightly Against',
  0: 'Neutral',
  1: 'Slightly For',
  2: 'For',
  3: 'Strongly For',
};

const ConsultationForm: React.FC<ConsultationFormProps> = ({
  consultationId,
  initialValue,
}) => {
  const { t: i18nT } = useLanguage();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Use ahooks useRequest for the submission API call (POST stance)
  const { run: submitStance } = useRequest(
    async (value: number) => {
      if (consultationId == null) {
        throw new Error('consultationId is required to submit a stance.');
      }

      const topic = Number(consultationId);
      if (!Number.isFinite(topic)) {
        throw new Error(`Invalid consultation/topic id: ${consultationId}`);
      }

      // Konsultations is a UI over canonical ethiKos topics. Persist the stance
      // through the canonical API.
      return post('ethikos/stances/', {
        topic,
        value,
      });
    },
    {
      manual: true,
      onSuccess: () => {
        antdMessage.success(i18nT("ui.konsultations.consultationform.yourStanceHasBeenRecorded"));
        // Optionally refresh consultation data (results, etc.)
        // Keep the selected stance visible after a successful save.
      },
      onError: () => {
        antdMessage.error(i18nT("ui.konsultations.consultationform.failedToSubmitStancePleaseTryAgain"));
      },
      onFinally: () => setSubmitting(false),
    },
  );

  const onFinish = ({ value }: { value: number }) => {
    setSubmitting(true);
    submitStance(value);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ value: initialValue }}
      onFinish={onFinish}
    >
      <Form.Item
        label={i18nT("ui.konsultations.consultationform.yourStance")}
        name="value"
        rules={[{ required: true, message: i18nT("ui.konsultations.consultationform.pleaseSelectAStance") }]}
      >
        <Slider
          min={-3}
          max={3}
          step={1}
          marks={stanceMarks}
          tooltip={{ formatter: (val) => stanceLabels[val as number] }}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>
          {i18nT("ui.konsultations.consultationform.submitStance")}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ConsultationForm;
