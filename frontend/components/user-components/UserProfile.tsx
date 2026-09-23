// FILE: frontend/components/user-components/UserProfile.tsx
// C:\MyCode\Konnaxionv14\frontend\components\user-components\UserProfile.tsx
// Référence dump: :contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1}

'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Alert, Card, Empty, List, Typography } from 'antd';
import { isAxiosError } from 'axios';
import { useSearchParams } from 'next/navigation';
import React from 'react';

import api from '@/api';

const { Title, Text } = Typography;

/** Types sûrs et minimaux pour ce composant */
interface ProfileSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
}

interface CommentItem {
  commentId: string;
  author: string;
  content: string;
  createdAt: string; // ISO string
}

interface RequestError {
  statusCode: number;
  message: string;
}

const UserProfile: React.FC = () => {
  const { t: i18nT } = useLanguage();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id') ?? '';

  const [profile, setProfile] = React.useState<ProfileSummary | null>(null);
  const [comments, setComments] = React.useState<CommentItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<RequestError | null>(null);

  /** Supprime un commentaire localement avec typage strict */
  const deleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((x) => x.commentId !== commentId));
  };

  React.useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        // Client "payload-first": renvoie directement T, pas AxiosResponse<T>
        const [p, c] = await Promise.all([
          api.get<ProfileSummary>(`/users/${userId}`),
          api.get<CommentItem[]>(`/users/${userId}/comments`),
        ]);

        if (cancelled) return;
        setProfile(p);
        setComments(c);
      } catch (e: unknown) {
        let statusCode = 500;
        let message = i18nT("ui.userComponents.userprofile.requestFailed");
        if (isAxiosError<{ statusCode?: number; message?: string }>(e)) {
          statusCode = e.response?.data?.statusCode ?? e.response?.status ?? 500;
          message = e.response?.data?.message ?? e.message ?? 'Request failed';
        } else if (e instanceof Error) {
          message = e.message;
        }
        if (!cancelled) setError({ statusCode, message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [userId, i18nT]);

  return (
    <div className="p-6">
      <Title level={2}>{i18nT("ui.userComponents.userprofile.userProfile")}</Title>

      {!userId && (
        <Alert
          type="warning"
          message={i18nT("ui.userComponents.userprofile.missingUserId")}
          description={i18nT("ui.userComponents.userprofile.ajoutezIdUserIdALUrl")}
          className="mb-4"
        />
      )}

      {error && (
        <Alert
          type="error"
          showIcon
          className="mb-4"
          message={i18nT("ui.userComponents.userprofile.erreur", { statusCode: error.statusCode })}
          description={error.message}
        />
      )}

      <Card loading={loading} className="mb-6">
        {profile ? (
          <>
            <Title level={4} className="mb-1">
              {profile.name}
            </Title>
            {profile.bio ? <Text type="secondary">{profile.bio}</Text> : <Text type="secondary">{i18nT("ui.userComponents.userprofile.noBio")}</Text>}
          </>
        ) : (
          <Empty description={i18nT("ui.userComponents.userprofile.noProfileLoaded")} />
        )}
      </Card>

      <Card title={i18nT("ui.userComponents.userprofile.recentComments")} loading={loading}>
        {comments.length === 0 ? (
          <Empty description={i18nT("ui.userComponents.userprofile.noComments")} />
        ) : (
          <List
            dataSource={comments}
            renderItem={(item) => (
              <List.Item
                key={item.commentId}
                actions={[
                  <button
                    key="delete"
                    onClick={() => deleteComment(item.commentId)}
                    className="text-red-600"
                    aria-label={i18nT("ui.userComponents.userprofile.deleteComment", { commentId: item.commentId })}
                  >
                    {i18nT("ui.userComponents.userprofile.delete")}
                  </button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <div className="flex items-center gap-2">
                      <Text strong>{item.author}</Text>
                      <Text type="secondary">{new Date(item.createdAt).toLocaleString()}</Text>
                    </div>
                  }
                  description={item.content}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default UserProfile;
