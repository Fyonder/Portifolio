'use client';

import { SpeedInsights } from '@vercel/speed-insights/next';

export default function VercelSpeedInsights() {
  return <SpeedInsights sampleRate={1} />;
}