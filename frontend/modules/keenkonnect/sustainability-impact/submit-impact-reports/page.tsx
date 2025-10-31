'use client'

// pages/keenkonnect/sustainability-impact/submit-impact-reports/index.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Form, Input, Select, DatePicker, InputNumber, Upload, Switch, Button, Modal, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import MainLayout from '@/components/layout-components/MainLayout';
import { useRouter } from 'next/navigation';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

const SubmitImpactReports: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  
  // États pour gérer l'upload, la soumission, et la modal de confirmation
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  // Flag pour déterminer si le rapport doit être sauvegardé en brouillon (true) ou soumis final (false)
  const [saveAsDraft, setSaveAsDraft] = useState(true);

  // Fonction simulant l'upload et la soumission
  const onFinish = async (values: any) => {
    setSubmitting(true);
    console.log('Submitted values:', values);
    // Simuler un appel API d'une durée de 1,5 seconde
    setTimeout(() => {
      setSubmitting(false);
      setModalVisible(true);
    }, 1500);
  };

  const handleModalOk = () => {
    setModalVisible(false);
    // Rediriger vers la page Track Project Impact après soumission
    router.push('/keenkonnect/sustainability-impact/track-project-impact');
  };

  return (
    <>
      <Head>
        <title>Submit Impact Reports</title>
        <meta name="description" content="Submit a new impact report for your project." />
      </Head>
      <div className="container mx-auto p-5">
        <h1 className="text-2xl font-bold mb-4">Submit Impact Reports</h1>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Sélecteur du projet */}
          <Form.Item
            name="project"
            label="Select Project"
            rules={[{ required: true, message: 'Please select a project' }]}
          >
            <Select placeholder="Select project">
              <Option value="Project Alpha">Project Alpha</Option>
              <Option value="Project Beta">Project Beta</Option>
              <Option value="Project Gamma">Project Gamma</Option>
            </Select>
          </Form.Item>

          {/* Période de rapport */}
          <Form.Item
            name="reportingPeriod"
            label="Reporting Period"
            rules={[{ required: true, message: 'Please select the reporting period' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          {/* Impact metrics */}
          <Form.Item
            name="peopleAffected"
            label="Number of People Affected"
            rules={[{ required: true, message: 'Please enter the number of people affected' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="Enter number" />
          </Form.Item>

          <Form.Item
            name="co2Reduction"
            label="CO2 Reduction (tons)"
            rules={[{ required: true, message: 'Please enter the CO2 reduction in tons' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="Enter value" />
          </Form.Item>

          {/* Description narrative */}
          <Form.Item
            name="narrative"
            label="Impact Description"
            rules={[{ required: true, message: 'Please provide a description of the impact achieved' }]}
          >
            <TextArea rows={4} placeholder="Provide a narrative description..." />
          </Form.Item>

          {/* Upload des preuves */}
          <Form.Item
            name="evidence"
            label="Attach Evidence or Data Files"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
          >
            <Upload beforeUpload={() => false} listType="text">
              <Button icon={<UploadOutlined />}>Upload File</Button>
            </Upload>
          </Form.Item>

          {/* Option de sauvegarde en brouillon */}
          <Form.Item
            name="saveDraft"
            label="Save as Draft"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren="Draft"
              unCheckedChildren="Submit Final"
              onChange={(checked) => setSaveAsDraft(checked)}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Submit Report
            </Button>
          </Form.Item>
        </Form>

        {/* Modal de confirmation */}
        <Modal
          title="Report Submitted"
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={handleModalOk}
          footer={[
            <Button key="ok" type="primary" onClick={handleModalOk}>
              OK
            </Button>,
          ]}
        >
          <p>Your impact report has been successfully submitted.</p>
        </Modal>
      </div>
    </>
  );
};

SubmitImpactReports.getLayout = (page: React.ReactElement) => <MainLayout>{page}</MainLayout>;

export default SubmitImpactReports;
