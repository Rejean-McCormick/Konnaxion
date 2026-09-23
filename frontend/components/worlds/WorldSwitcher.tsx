'use client';

import { GlobalOutlined, WarningOutlined } from '@ant-design/icons';
import { Select, Tag, Tooltip } from 'antd';
import { useMemo } from 'react';
import styled from 'styled-components';

import { useLanguage } from '@/context/LanguageContext';
import { useWorld } from '@/context/WorldContext';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;

  .k-world-select {
    width: clamp(160px, 18vw, 280px);
  }

  .k-world-select .ant-select-selector {
    border-radius: 999px !important;
  }

  @media (max-width: 980px) {
    .k-world-select {
      width: 150px;
    }
  }

  @media (max-width: 760px) {
    .k-world-select {
      width: 126px;
    }
  }
`;

export default function WorldSwitcher() {
  const { t } = useLanguage();
  const {
    worldKey,
    runtime,
    worlds,
    recentWorldKeys,
    loadingCatalog,
    loadingRuntime,
    catalogError,
    runtimeError,
    switchWorld,
  } = useWorld();

  const orderedWorlds = useMemo(() => {
    const recentRank = new Map(
      recentWorldKeys.map((key, index) => [key, index]),
    );

    return [...worlds].sort((left, right) => {
      const leftRank = recentRank.get(left.key);
      const rightRank = recentRank.get(right.key);
      if (leftRank !== undefined || rightRank !== undefined) {
        if (leftRank === undefined) return 1;
        if (rightRank === undefined) return -1;
        return leftRank - rightRank;
      }
      return left.title.localeCompare(right.title);
    });
  }, [recentWorldKeys, worlds]);

  const options = useMemo(
    () =>
      orderedWorlds.map((world) => ({
        value: world.key,
        label: world.title,
        searchText: `${world.title} ${world.key}`.toLowerCase(),
        disabled:
          !world.current_release ||
          world.current_release.status !== 'current' ||
          (world.status !== 'active' && !world.can_manage),
      })),
    [orderedWorlds],
  );

  const dataPlaneDisabled = runtime?.capabilities?.data_plane_enabled === false;
  const title = runtimeError
    ? t('worlds.runtimeError')
    : catalogError
      ? t('worlds.catalogError')
      : dataPlaneDisabled
        ? t('worlds.dataPlaneDisabled')
        : t('worlds.switchTooltip');

  return (
    <Wrapper>
      <Tooltip title={title}>
        {runtimeError || catalogError || dataPlaneDisabled ? (
          <WarningOutlined />
        ) : (
          <GlobalOutlined />
        )}
      </Tooltip>
      <Select<string>
        className="k-world-select"
        aria-label={t('worlds.activeAria')}
        loading={loadingCatalog || loadingRuntime}
        value={worldKey ?? undefined}
        placeholder={t('worlds.select')}
        showSearch
        allowClear={false}
        onChange={switchWorld}
        status={runtimeError ? 'error' : undefined}
        filterOption={(input, option) => {
          const searchText = String(
            (option as { searchText?: string })?.searchText ?? '',
          );
          return searchText.includes(input.trim().toLowerCase());
        }}
        options={options}
        notFoundContent={
          catalogError ? t('worlds.catalogUnavailable') : t('worlds.none')
        }
      />
      {runtime?.release.dirty ? (
        <Tooltip title={t('worlds.dirtyTooltip')}>
          <Tag style={{ marginInlineEnd: 0 }}>{t('worlds.modified')}</Tag>
        </Tooltip>
      ) : null}
    </Wrapper>
  );
}
