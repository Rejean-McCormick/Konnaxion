// FILE: frontend/components/compat/Icon.tsx
// components/compat/Icon.tsx
import React from 'react'
import {
  DeleteOutlined,
  EditOutlined,
  LikeOutlined,
  MessageOutlined,
  LoadingOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'

const MAP: Record<string, React.ComponentType<any>> = {
  delete: DeleteOutlined,
  edit: EditOutlined,
  like: LikeOutlined,
  message: MessageOutlined,
  loading: LoadingOutlined,
  plus: PlusOutlined,
  'info-circle': InfoCircleOutlined,
  warning: WarningOutlined,
  'arrow-right': ArrowRightOutlined,
  'arrow-left': ArrowLeftOutlined,
}

type Props = { type: string } & React.HTMLAttributes<HTMLSpanElement>

export default function Icon({ type, ...rest }: Props) {
  const C = MAP[type] ?? InfoCircleOutlined
  return <C {...rest} />
}
