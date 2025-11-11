"use client";
/**
 * Description: Sculpture table with support for sorting according to likes, comments and visits
 * Author: Hieu Chu
 */

import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { CardStyled } from './style';

type Maker = {
  firstName: string;
  lastName: string;
};

export type SculptureRow = {
  accessionId: string;
  name: string;
  primaryMaker: Maker;
  totalLikes: number;
  totalComments: number;
  totalVisits: number;
};

type Props = {
  sculptures: SculptureRow[];
};

// Typage assoupli pour le wrapper styled afin d'éviter les erreurs de génériques
const StyledTable = styled(Table as unknown as React.ComponentType<any>)`
  .ant-table table {
    border-left: 1px solid #e8e8e8;
    border-top: 1px solid #e8e8e8;
    border-right: 1px solid #e8e8e8;
  }
`;

export default function SculptureTable({ sculptures }: Props): JSX.Element {
  const router = useRouter();

  const columns: ColumnsType<SculptureRow> = [
    {
      title: 'Sculpture Name',
      dataIndex: 'name',
    },
    {
      title: 'Author',
      key: 'author',
      render: (_: unknown, { primaryMaker }) => (
        <span>{`${primaryMaker.firstName} ${primaryMaker.lastName}`}</span>
      ),
    },
    {
      title: 'Likes',
      dataIndex: 'totalLikes',
      sorter: (a, b) => a.totalLikes - b.totalLikes,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Comments',
      dataIndex: 'totalComments',
      sorter: (a, b) => a.totalComments - b.totalComments,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Visits',
      dataIndex: 'totalVisits',
      sorter: (a, b) => a.totalVisits - b.totalVisits,
      sortDirections: ['descend', 'ascend'],
    },
  ];

  return (
    <CardStyled title="Sculpture Rankings">
      <StyledTable
        rowKey="accessionId"
        dataSource={sculptures}
        columns={columns}
        pagination={{ pageSize: 10 }}
        className="sculpture-table"
        onRow={(record: SculptureRow) => ({
          onClick: () => router.push(`/sculptures/id/${record.accessionId}`),
        })}
      />
    </CardStyled>
  );
}
