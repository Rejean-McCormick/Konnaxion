'use client'
import React from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { CardStyled } from './style'

type User = { userId: string }
export default function UserPieChart({ users }: { users: User[] }) {
  const data = [
    { name: 'Email', value: 0 },
    { name: 'Google', value: 0 },
    { name: 'Facebook', value: 0 },
  ]
  for (const u of users) {
    if (u.userId.includes('auth0')) data[0].value++
    else if (u.userId.includes('google')) data[1].value++
    else data[2].value++
  }

  const COLORS = ['#A97BE9', '#EA4335', '#1890FF']

  return (
    <CardStyled title="Proportion of Users">
      <div style={{ width: '100%', height: 294 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {data.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </CardStyled>
  )
}
