import React from 'react';
import { Space, Typography, Alert, Tag, Empty, Result } from 'antd';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import { ConsultationForm, ResultsChart, SuggestionBoard, ImpactTimeline } from '@/modules/konsultations/components';
import { useConsultation, useConsultationResults, useSuggestions, useImpact } from '@/modules/konsultations/hooks';

const { Title, Paragraph, Text } = Typography;

interface ConsultationDetailProps {
  consultationId: string;  // likely passed via route params
}

const ConsultationDetailPage: React.FC<ConsultationDetailProps> = ({ consultationId }) => {
  // Fetch consultation metadata (title, description, status, dates, etc.)
  const { data: consultation, loading, error } = useConsultation(consultationId);
  // Fetch aggregated results for this consultation (e.g., stance distribution)
  const { data: results } = useConsultationResults(consultationId);
  // Fetch citizen suggestions for this consultation
  const { data: suggestions } = useSuggestions(consultationId);
  // Fetch impact timeline entries for this consultation
  const { data: impactItems } = useImpact(consultationId);

  if (error) {
    // Show an error state if consultation failed to load (e.g., not found or server error)
    return (
      <Result 
        status="error" 
        title="Failed to load consultation" 
        subTitle={error.message || 'This consultation may not exist or an error occurred.'} 
      />
    );
  }

  // Determine consultation status tag and date info
  let statusTag: React.ReactNode = null;
  let dateInfo: React.ReactNode = null;
  if (consultation) {
    const isOpen = consultation.status === 'open';
    statusTag = (
      <Tag color={isOpen ? 'blue' : 'red'} style={{ marginRight: 8 }}>
        {isOpen ? 'Open' : 'Closed'}
      </Tag>
    );
    if (isOpen && consultation.closeDate) {
      dateInfo = <Text type="secondary">Closes on {dayjs(consultation.closeDate).format('YYYY-MM-DD')}</Text>;
    } else if (!isOpen && consultation.closeDate) {
      dateInfo = <Text type="secondary">Closed on {dayjs(consultation.closeDate).format('YYYY-MM-DD')}</Text>;
    }
  }

  return (
    <EthikosPageShell 
      title={consultation ? consultation.title : 'Consultation'} 
      sectionLabel="Consultation"
      metaTitle={consultation ? `ethiKos · Consultation · ${consultation.title}` : undefined}
    >
      <PageContainer ghost loading={loading}>
        {consultation ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Consultation metadata */}
            <div>
              {statusTag}
              {dateInfo}
              {consultation.description && (
                <Paragraph style={{ marginTop: 4 }}>{consultation.description}</Paragraph>
              )}
            </div>

            {/* Stance submission form */}
            <ProCard title="Your Stance" bordered>
              <ConsultationForm consultationId={consultation.id} />
            </ProCard>

            {/* Results and Suggestions side by side (responsive) */}
            <ProCard ghost gutter={16} wrap>
              <ProCard colSpan={{ xs: 24, md: 12 }} title="Results">
                {results ? (
                  <ResultsChart data={results} />
                ) : (
                  <Empty description="No results yet" />
                )}
              </ProCard>
              <ProCard colSpan={{ xs: 24, md: 12 }} title="Suggestions">
                {suggestions ? (
                  <SuggestionBoard items={suggestions} />
                ) : (
                  <Empty description="No suggestions yet" />
                )}
              </ProCard>
            </ProCard>

            {/* Impact timeline */}
            <ProCard title="Impact Timeline" bordered>
              {impactItems ? (
                <ImpactTimeline items={impactItems} />
              ) : (
                <Empty description="No impact actions recorded yet." />
              )}
            </ProCard>
          </Space>
        ) : (
          // If consultation is not loaded yet (and not error), show nothing (loading spinner is handled by PageContainer)
          <></>
        )}
      </PageContainer>
    </EthikosPageShell>
  );
};

export default ConsultationDetailPage;
