'use client'

// File: /pages/konnected/certifications/exam-registration.tsx
import React, { useState } from 'react';
import { NextPage } from 'next';
import {
  Form,
  Input,
  Button,
  Steps,
  Select,
  Radio,
  Checkbox,
  Result,
  message,
} from 'antd';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { Step } = Steps;
const { Option } = Select;

const ExamRegistration: NextPage = () => {
  // State pour gérer l'étape courante de l'inscription
  const [currentStep, setCurrentStep] = useState<number>(0);
  // Instance du formulaire
  const [form] = Form.useForm();
  // State pour stocker les données saisies
  const [registrationData, setRegistrationData] = useState<any>({});
  // State pour indiquer que l'inscription est terminée
  const [registrationCompleted, setRegistrationCompleted] = useState<boolean>(false);

  // Définition des titres d'étape
  const steps = [
    { title: 'Choose Exam' },
    { title: 'Schedule Details' },
    { title: 'Confirmation' },
  ];

  // Passage à l'étape suivante après validation des champs
  const next = () => {
    form
      .validateFields()
      .then((values) => {
        // Enregistrer les valeurs dans le state global d'inscription
        setRegistrationData({ ...registrationData, ...values });
        setCurrentStep(currentStep + 1);
      })
      .catch((info) => {
        console.log('Validation Failed:', info);
      });

  // Retour à l'étape précédente
  const prev = () => {
    setCurrentStep(currentStep - 1);

  // Traitement final de la soumission
  const onSubmit = () => {
    // Ici, vous pouvez intégrer un appel API ou une logique de paiement.
    message.success('Registration complete!');
    setRegistrationCompleted(true);

  // Rendu conditionnel du contenu selon l'étape courante
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

  // Une fois l'inscription terminée, afficher une page de résultat
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

// Correction: envelopper la page dans MainLayout via getLayout

  return <MainLayout>{page}</MainLayout>;

export default ExamRegistration;
