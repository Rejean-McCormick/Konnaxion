'use client';

import { Segmented, Tooltip } from 'antd';
import styled from 'styled-components';

import { useLanguage } from '@/context/LanguageContext';
import type { Language } from '@/i18n/config';

const CompactSegmented = styled(Segmented)`
  flex: 0 0 auto;
  border: 1px solid var(--ant-color-border);
  border-radius: 999px;

  .ant-segmented-item,
  .ant-segmented-thumb {
    border-radius: 999px;
  }

  .ant-segmented-item-label {
    min-width: 30px;
    padding-inline: 7px;
    font-size: 12px;
    font-weight: 700;
  }
`;

const OPTIONS: Array<{ label: string; value: Language }> = [
  { label: 'FR', value: 'fr' },
  { label: 'EN', value: 'en' },
];

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Tooltip title={t('language.tooltip')}>
      <CompactSegmented
        size="small"
        value={language}
        options={OPTIONS}
        aria-label={t('language.switchAria')}
        onChange={(value) => setLanguage(value as Language)}
      />
    </Tooltip>
  );
}
