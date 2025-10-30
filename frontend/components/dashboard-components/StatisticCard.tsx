import React from 'react';
import { Card, Statistic } from 'antd';

type StatisticCardProps = {
  title: string;
  value: number;
};

const StatisticCard: React.FC<StatisticCardProps> = ({ title, value }) => {
  return (
    <Card>
      <Statistic title={title} value={value} />
    </Card>
  );
};

export default StatisticCard;
