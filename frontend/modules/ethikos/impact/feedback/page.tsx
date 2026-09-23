// FILE: frontend/modules/ethikos/impact/feedback/page.tsx
'use client'

import { useLanguage } from '@/context/LanguageContext';
import { Comment } from '@ant-design/compatible';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Button, Empty, Input, List, Rate } from 'antd';
import { useState } from 'react';

import usePageTitle from '@/hooks/usePageTitle';
import { fetchFeedback, submitFeedback } from '@/services/impact';

export default function FeedbackLoops() {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.impact.feedback.impactFeedback"));

  const { data, loading, mutate } = useRequest(fetchFeedback);
  const [message, setMessage] = useState('');
  const [stars, setStars] = useState<number>(0);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    await submitFeedback({ body: message.trim(), rating: stars || undefined });
    setMessage('');
    setStars(0);
    mutate();
    setSending(false);
  };

  return (
    <PageContainer ghost loading={loading}>
      <ProCard title={i18nT("ui.ethikos.impact.feedback.addYourFeedback")} ghost>
        <Rate onChange={setStars} value={stars} />
        <Input.TextArea
          rows={3}
          placeholder={i18nT("ui.ethikos.impact.feedback.tellUsWhatWorkedOrWhatDidn")}
          value={message}
          onChange={e => setMessage(e.target.value)}
          style={{ marginTop: 8 }}
        />
        <Button type="primary" onClick={send} loading={sending} style={{ marginTop: 8 }}>
          {i18nT("ui.ethikos.impact.feedback.submit")}
        </Button>
      </ProCard>

      <ProCard title={i18nT("ui.ethikos.impact.feedback.communityFeedback_e4854a")} ghost style={{ marginTop: 24 }}>
        {data?.items.length ? (
          <List
            dataSource={data.items ?? []}
            renderItem={f => (
              <li>
                <Comment
                  author={f.author}
                  datetime={f.createdAt}
                  content={
                    <>
                      {f.rating !== undefined && <Rate disabled value={f.rating} />}
                      <p style={{ marginTop: 4 }}>{f.body}</p>
                    </>
                  }
                />
              </li>
            )}
          />
        ) : (
          <Empty description={i18nT("ui.ethikos.impact.feedback.noFeedbackYet")} />
        )}
      </ProCard>
    </PageContainer>
  );
}
