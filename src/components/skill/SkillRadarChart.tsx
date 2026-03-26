'use client';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

type Props = {
  data: { area: string; score: number }[];
};

export default function SkillRadarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="area" tick={{ fontSize: 13 }} />
        <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={{ fontSize: 11 }} />
        <Radar
          name="スキルスコア"
          dataKey="score"
          stroke="#1a1a1a"
          fill="#1a1a1a"
          fillOpacity={0.25}
        />
        <Tooltip formatter={(v) => [`${v}`, 'スコア']} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
