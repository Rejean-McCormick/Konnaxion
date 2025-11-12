// C:\MyCode\Konnaxionv14\frontend\components\dashboard-components\UserPieChart.tsx
// Version corrigée basée sur le dump fourni. :contentReference[oaicite:0]{index=0}
'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { CardStyled } from './style'

type User = { userId: string }
type Props = { users: User[] }
type PieDatum = { name: string; value: number }

export default function UserPieChart({ users }: Props) {
  // Comptage sans indexation de tableau
  let email = 0
  let google = 0
  let facebook = 0

  for (const u of users) {
    const id = u.userId
    if (id.includes('auth0')) email += 1
    else if (id.includes('google')) google += 1
    else facebook += 1
  }

  const data: PieDatum[] = [
    { name: 'Email', value: email },
    { name: 'Google', value: google },
    { name: 'Facebook', value: facebook },
  ]

  const COLORS = ['#A97BE9', '#EA4335', '#1890FF'] as const

  return (
    <CardStyled title="Proportion of Users">
      <div style={{ width: '100%', height: 294 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.name}
                  // Évite l'indexation non sûre avec une couleur de repli
                  fill={COLORS[i % COLORS.length] ?? '#8884d8'}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </CardStyled>
  )
}
