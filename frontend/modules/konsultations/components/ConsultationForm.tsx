import React, { useState } from 'react';
import { Form, Slider, Input, Button, message as antdMessage } from 'antd';
// (Assume an axios-based helper or useRequest hook is available for API calls)
import { useRequest } from 'ahooks';

interface ConsultationFormProps {
  consultationId: string | number;
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

const ConsultationForm: React.FC<ConsultationFormProps> = ({ consultationId, initialValue }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Use ahooks useRequest for the submission API call (POST stance)
  const { run: submitStance } = useRequest(
    async (value: number, comment?: string) => {
      // Example API endpoint: POST /api/konsultations/consultations/{id}/vote/
      // Payload: { value: ..., comment: ... }
      // (The exact endpoint may vary; adjust based on backend routes)
      return await axios.post(`/api/konsultations/consultations/${consultationId}/vote/`, {
        value,
        comment,
      });
    },
    {
      manual: true,
      onSuccess: () => {
        antdMessage.success('Your stance has been recorded.');
        // Optionally refresh consultation data (results, etc.)
        form.resetFields(['comment']);
      },
      onError: () => {
        antdMessage.error('Failed to submit stance. Please try again.');
      },
      onFinally: () => setSubmitting(false),
    }
  );

  const onFinish = ({ value, comment }: { value: number; comment?: string }) => {
    setSubmitting(true);
    submitStance(value, comment);
  };

  return (
    <Form 
      form={form} 
      layout="vertical" 
      initialValues={{ value: initialValue, comment: '' }} 
      onFinish={onFinish}
    >
      <Form.Item 
        label="Your stance" 
        name="value" 
        rules={[{ required: true, message: 'Please select a stance.' }]}
      >
        <Slider 
          min={-3} max={3} step={1} marks={stanceMarks} 
          tooltip={{ formatter: (val) => stanceLabels[val as number] }} 
        />
      </Form.Item>
      <Form.Item label="Comment (optional)" name="comment">
        <Input.TextArea rows={3} placeholder="Add an explanation or suggestion (optional)" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>
          Submit Stance
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ConsultationForm;
