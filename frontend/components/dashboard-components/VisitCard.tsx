// FILE: frontend/components/dashboard-components/VisitCard.tsx
// C:\MyCode\Konnaxionv14\frontend\components\dashboard-components\VisitCard.tsx
'use client'

/**
 * Description: Visit statistics card, including total visits and trend graph
 * Author: Hieu Chu
 */

import { useLanguage } from '@/context/LanguageContext';
import React from 'react'

import ChartCard from '@/components/charts/ChartCard'

import {
  BarContainer,
  CardDivider,
  CardFooter,
  HelperIcon,
  MainIcon,
  NumberInfoStyled,
} from './style'

type Point = { x: string | number; y: number }

interface Props {
  TOTAL_VISITS: number
  DAILY_VISITS: number
  DAILY_VISITS_CHANGE: number
  VISIT_DATA: Point[]
  SINGLE_SCULPTURE?: boolean
}

export default function VisitCard({
  TOTAL_VISITS,
  DAILY_VISITS,
  DAILY_VISITS_CHANGE,
  VISIT_DATA,
  SINGLE_SCULPTURE,
}: Props) {
  const { t: i18nT } = useLanguage();
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <MainIcon type="environment" style={{ color: '#F73F3F' }} />
        <NumberInfoStyled subTitle={i18nT("ui.dashboardComponents.visitcard.totalVisits")} total={TOTAL_VISITS} />
        {!SINGLE_SCULPTURE && (
          <HelperIcon title={i18nT("ui.dashboardComponents.visitcard.totalNumberOfTimesSculpturesHaveBeen")} />
        )}
      </div>

      <BarContainer>
        <ChartCard type="area" data={VISIT_DATA} height={90} />
      </BarContainer>

      <CardDivider />

      <CardFooter
        title={i18nT("ui.dashboardComponents.visitcard.dailyVisits")}
        value={DAILY_VISITS}
        change={DAILY_VISITS_CHANGE}
      />
    </>
  )
}
