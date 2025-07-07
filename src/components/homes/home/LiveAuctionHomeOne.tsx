import dynamic from 'next/dynamic';

const MyTimer = dynamic<{ endTime: string | Date }>(() => import('@/common/Timer'), { ssr: false });