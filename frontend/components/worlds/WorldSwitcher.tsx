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

  .k-universe-select {
    width: clamp(150px, 15vw, 230px);
  }

  .k-world-select {
    width: clamp(150px, 16vw, 250px);
  }

  .ant-select-selector {
    border-radius: 999px !important;
  }

  @media (max-width: 980px) {
    .k-universe-select,
    .k-world-select {
      width: 140px;
    }
  }

  @media (max-width: 760px) {
    .k-universe-select {
      display: none;
    }
    .k-world-select {
      width: 132px;
    }
  }
`;

export default function WorldSwitcher() {
  const { t } = useLanguage();
  const {
    universeKey,
    worldKey,
    runtime,
    universes,
    worlds,
    recentWorldKeys,
    loadingCatalog,
    loadingRuntime,
    catalogError,
    runtimeError,
    switchUniverse,
    switchWorld,
  } = useWorld();

  const universeOptions = useMemo(
    () =>
      universes.map((universe) => ({
        value: universe.key,
        label: universe.title,
        searchText: `${universe.title} ${universe.key}`.toLowerCase(),
        disabled: universe.status === 'archived',
      })),
    [universes],
  );

  const orderedWorlds = useMemo(() => {
    const recentRank = new Map(
      recentWorldKeys.map((key, index) => [key, index]),
    );
    return worlds
      .filter((world) => !universeKey || world.universe_key === universeKey)
      .sort((left, right) => {
        const leftRank = recentRank.get(`${left.universe_key}/${left.key}`);
        const rightRank = recentRank.get(`${right.universe_key}/${right.key}`);
        if (leftRank !== undefined || rightRank !== undefined) {
          if (leftRank === undefined) return 1;
          if (rightRank === undefined) return -1;
          return leftRank - rightRank;
        }
        return left.title.localeCompare(right.title);
      });
  }, [recentWorldKeys, universeKey, worlds]);

  const worldOptions = useMemo(
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

  const filter = (input: string, option?: unknown) =>
    String((option as { searchText?: string } | undefined)?.searchText ?? '').includes(
      input.trim().toLowerCase(),
    );

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
        className="k-universe-select"
        aria-label={t('worlds.activeUniverseAria')}
        loading={loadingCatalog}
        value={universeKey ?? undefined}
        placeholder={t('worlds.selectUniverse')}
        showSearch
        allowClear={false}
        onChange={switchUniverse}
        status={catalogError ? 'error' : undefined}
        filterOption={filter}
        options={universeOptions}
        notFoundContent={
          catalogError ? t('worlds.catalogUnavailable') : t('worlds.noUniverses')
        }
      />
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
        filterOption={filter}
        options={worldOptions}
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
