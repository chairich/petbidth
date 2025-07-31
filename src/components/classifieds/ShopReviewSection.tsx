'use client';

import { useState } from 'react';
import ShopReviewForm from './ShopReviewForm';
import ShopReviews from './ShopReviews';

export default function ShopReviewSection({ shopId }: { shopId: string }) {
  const [refreshFlag, setRefreshFlag] = useState(0);

  return (
    <div>
      <ShopReviewForm shopId={shopId} onReviewSubmitted={() => setRefreshFlag((r) => r + 1)} />
      <ShopReviews key={refreshFlag} shopId={shopId} />
    </div>
  );
}
