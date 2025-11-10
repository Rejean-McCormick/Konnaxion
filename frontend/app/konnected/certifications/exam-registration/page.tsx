'use client'

// File: /app/konnected/certifications/exam-registration/page.tsx
import React, { useState } from 'react';
import type { NextPage } from 'next';
import {
  Form,
  Input,
  Button,
  Steps,
  Select,
  Radio,
  Checkbox,
  Result,
  message as antdMessage,
} from 'antd';
import PageContainer from '@/components/PageContainer';

const { Step } = Steps;
const { Option } = Select;

const ExamRegistration: NextPage = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [form] = Form.useForm();
  const [registrationData, setRegistrationData] = useState<any>({});
  const [registrationCompleted, setRegistrationCompleted] = useState<boolean>(false);

  const steps = [
    { title: 'Choose Exam' },
    { title: 'Schedule Details' },
    { title: 'Confirmation' },
  ];

  // Étape suivante
  const next = () => {
    form
      .validateFields()
      .then((values) => {
        setRegistrationData({ ...registrationData, ...values });
        setCurrentStep((s) => s + 1);
      })
      .catch((info) => {
        console.log('Validation Failed:', info);
      });
  };

  // Étape précédente
  const prev = () => {
    setCurrentStep((s) => s - 1);
  };

  // Soumission finale
  const onSubmit = () => {
    antdMessage.success('Registration complete!');
    setRegistrationCompleted(true);
  };

  // Contenu par étape
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <Form.Item
              label="Select Exam"
              name="examChoice"
              rules={[{ required: true, message: 'Please select an exam' }]}
            >
              <Select placeholder="Choose an exam">
                <Option value="exam1">Certification Exam Level 1</Option>
                <Option value="exam2">Certification Exam Level 2</Option>
                <Option value="exam3">Certification Exam Advanced</Option>
              </Select>
            </Form.Item>
          </>
        );
      case 1:
        return (
          <>
            <Form.Item
              label="Preferred Exam Session"
              name="examSession"
              rules={[{ required: true, message: 'Please select an exam session' }]}
            >
              <Radio.Group>
                <Radio value="session1">Monday, October 2, 2023 - Online</Radio>
                <Radio value="session2">Wednesday, October 4, 2023 - Online</Radio>
                <Radio value="session3">Friday, October 6, 2023 - In-Person</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true, message: 'Please enter your full name' }]}
            >
              <Input placeholder="Enter your full name" />
            </Form.Item>
            <Form.Item
              name="agreeTerms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject('You must agree to the terms'),
                },
              ]}
            >
              <Checkbox>I agree to the Terms and Conditions</Checkbox>
            </Form.Item>
          </>
        );
      case 2:
        return (
          <>
            <p>
              <strong>Exam Choice:</strong> {registrationData.examChoice}
            </p>
            <p>
              <strong>Exam Session:</strong> {registrationData.examSession}
            </p>
            <p>
              <strong>Full Name:</strong> {registrationData.fullName}
            </p>
          </>
        );
      default:
        return null;
    }
  };

  // Résultat post-soumission
  if (registrationCompleted) {
    return (
      <PageContainer title="Exam Registration">
        <Result
          status="success"
          title="Registration Successful!"
          subTitle={`You have successfully registered for ${registrationData.examChoice}. Further details have been sent to your email.`}
          extra={[
            <Button type="primary" key="explore">
              Explore Certifications
            </Button>,
          ]}
        />
      </PageContainer>
    );
  }

  // Rendu principal
  return (
    <PageContainer title="Exam Registration">
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>

      <Form form={form} layout="vertical">
        {renderStepContent()}
        <div style={{ marginTop: 24 }}>
          {currentStep > 0 && (
            <Button style={{ marginRight: 8 }} onClick={prev}>
              Back
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={next}>
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" onClick={onSubmit}>
              Submit Registration
            </Button>
          )}
        </div>
      </Form>
    </PageContainer>
  );
};

export default ExamRegistration;
