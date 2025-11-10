/**
 * Description: Stylesheet for recent activity components
 * Author: Hieu Chu
 */

import React, { CSSProperties, ForwardedRef } from 'react';
import styled from 'styled-components';
import { Card, Col, Form, Typography, Empty, Table } from 'antd';
import type { SVGProps } from 'react';
import {
  LikeOutlined,
  LikeFilled,
  LikeTwoTone,
  DislikeOutlined,
  DislikeFilled,
  DislikeTwoTone,
  MessageOutlined,
  MessageFilled,
  StarOutlined,
  StarFilled,
  StarTwoTone,
  HeartOutlined,
  HeartFilled,
  HeartTwoTone,
  ShareAltOutlined,
  EyeOutlined,
  EyeFilled,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  CheckOutlined,
  CloseOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  BellOutlined,
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

/* --------------------------------------------------------------------------------
   AntD v5 does not export a generic <Icon />.
   Shim to keep usages like <DescriptionIcon type="like" /> working.
-------------------------------------------------------------------------------- */

type LegacyIconName =
  | 'like' | 'like-filled' | 'like-two-tone'
  | 'dislike' | 'dislike-filled' | 'dislike-two-tone'
  | 'message' | 'message-filled'
  | 'star' | 'star-filled' | 'star-two-tone'
  | 'heart' | 'heart-filled' | 'heart-two-tone'
  | 'share' | 'eye' | 'eye-filled'
  | 'edit' | 'delete' | 'plus' | 'minus'
  | 'check' | 'close' | 'warning' | 'info' | 'question'
  | 'calendar' | 'clock' | 'user' | 'team' | 'bell' | 'search' | 'filter' | 'setting'
  | 'loading';

/** All AntD icons share the same component type. */
type AnyAntdIcon = typeof LikeOutlined;

const ICON_MAP: Record<LegacyIconName, AnyAntdIcon> = {
  like: LikeOutlined,
  'like-filled': LikeFilled,
  'like-two-tone': LikeTwoTone,
  dislike: DislikeOutlined,
  'dislike-filled': DislikeFilled,
  'dislike-two-tone': DislikeTwoTone,
  message: MessageOutlined,
  'message-filled': MessageFilled,
  star: StarOutlined,
  'star-filled': StarFilled,
  'star-two-tone': StarTwoTone,
  heart: HeartOutlined,
  'heart-filled': HeartFilled,
  'heart-two-tone': HeartTwoTone,
  share: ShareAltOutlined,
  eye: EyeOutlined,
  'eye-filled': EyeFilled,
  edit: EditOutlined,
  delete: DeleteOutlined,
  plus: PlusOutlined,
  minus: MinusOutlined,
  check: CheckOutlined,
  close: CloseOutlined,
  warning: WarningOutlined,
  info: InfoCircleOutlined,
  question: QuestionCircleOutlined,
  calendar: CalendarOutlined,
  clock: ClockCircleOutlined,
  user: UserOutlined,
  team: TeamOutlined,
  bell: BellOutlined,
  search: SearchOutlined,
  filter: FilterOutlined,
  setting: SettingOutlined,
  loading: LoadingOutlined,
};

export type IconProps = {
  /** Legacy name, e.g. 'like', 'star-filled', 'heart-two-tone', 'loading' */
  type?: LegacyIconName;
  /** Custom SVG React component (legacy `<Icon component={...} />` usage) */
  component?: React.ComponentType<SVGProps<SVGSVGElement>>;
  rotate?: number;
  spin?: boolean;
  /** Matches AntD twoTone type: string or [primary, secondary] */
  twoToneColor?: string | [string, string];
  className?: string;
  style?: CSSProperties;
  title?: string;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
} & Omit<React.HTMLAttributes<HTMLSpanElement>, 'onClick' | 'title'>;

/** Local Icon shim */
export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(function LegacyIcon(
  { type, component: CustomSvg, rotate, spin, twoToneColor, className, style, title, onClick, ...rest },
  ref
) {
  // Custom SVG support
  if (CustomSvg) {
    const Comp = CustomSvg;
    const wrapperStyle: CSSProperties = {
      display: 'inline-flex',
      lineHeight: 0,
      verticalAlign: 'middle',
      ...(rotate ? { transform: `rotate(${rotate}deg)` } : null),
      ...(spin ? { animation: 'antIconSpin 1s linear infinite' } : null),
      ...style,
    };
    return (
      <span ref={ref} className={className} style={wrapperStyle} onClick={onClick} title={title} {...rest}>
        <Comp width="1em" height="1em" fill="currentColor" focusable="false" aria-hidden={title ? undefined : true} />
      </span>
    );
  }

  const Mapped = type ? ICON_MAP[type] : undefined;
  const RenderIcon = Mapped ?? QuestionCircleOutlined;

  const needsWrap = !!rotate;
  const iconEl = (
    <RenderIcon
      spin={spin}
      rotate={needsWrap ? undefined : rotate}
      twoToneColor={twoToneColor as any}
      style={style}
      className={className}
    />
  );

  if (!needsWrap) {
    return (
      <span ref={ref} onClick={onClick} title={title} {...rest}>
        {iconEl}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      onClick={onClick}
      title={title}
      style={{ display: 'inline-flex', lineHeight: 0, verticalAlign: 'middle', transform: `rotate(${rotate}deg)` }}
      {...rest}
    >
      {iconEl}
    </span>
  );
});

/* --------------------------------------------------------------------------------
   Styled exports (API preserved)
-------------------------------------------------------------------------------- */

export const CardStyled: React.FC<React.ComponentProps<typeof Card>> = (props) => (
  <Card bordered={false} bodyStyle={{ padding: '20px 24px 20px' }} {...props} />
);

export const ColStyled = styled(Col)`
  padding-bottom: 12px;
`;

/** Previously: styled(Icon) from 'antd' — now styled local shim */
export const DescriptionIcon = styled(Icon)`
  font-size: 20px;
`;

export const ShadowCard = styled(CardStyled)`
  box-shadow: rgba(0, 0, 0, 0.06) 0px 9px 24px;
  border-width: 1px;
  border-style: solid;
  border-color: rgb(242, 242, 242);
  border-radius: 3px;
  transition: all 150ms ease-in-out 0s;

  &:hover {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 9px 24px;
    cursor: pointer;
    transition: all 150ms ease-in-out 0s;
  }
`;

export const CustomFormItem = styled(Form.Item)`
  margin-bottom: 8px;

  &.ant-form-item-with-help {
    margin-bottom: 5px;
  }
`;

export const FormCol = styled(Col)`
  padding-left: 0px !important;
  padding-right: 0px !important;
`;

export const Subtitle = styled(Text)`
  display: block;
  margin-bottom: 12px;
`;

export const EmptyImage = styled(Empty)`
  height: 230px;
  margin: 0;
  border-bottom: 0.3px solid rgba(0, 0, 0, 0.25);

  & .ant-empty-image {
    margin-top: 220px;
  }
`;

export const StyledTable = styled(Table)`
  .ant-table table {
    border-left: 1px solid #e8e8e8;
    border-top: 1px solid #e8e8e8;
    border-right: 1px solid #e8e8e8;
  }
`;
