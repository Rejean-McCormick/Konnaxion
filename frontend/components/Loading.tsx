// components/Loading.tsx
import { Spin } from 'antd'
export default function Loading() {
  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <Spin />
    </div>
  )
}
