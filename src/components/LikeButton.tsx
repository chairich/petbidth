'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

type LikeButtonProps = {
  auctionId: string;
};

export default function LikeButton({ auctionId }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: likedData } = await supabase
          .from('auction_likes')
          .select('*')
          .eq('auction_id', auctionId)
          .eq('user_id', user.id)
          .single();

        setLiked(!!likedData);
      }

      const { count } = await supabase
        .from('auction_likes')
        .select('*', { count: 'exact', head: true })
        .eq('auction_id', auctionId);

      setLikesCount(count || 0);
    };

    fetchLikeStatus();
  }, [auctionId]);

  const toggleLike = async () => {
    if (!user) return;

    if (liked) {
      await supabase
        .from('auction_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('auction_id', auctionId);
      setLiked(false);
      setLikesCount(likesCount - 1);
    } else {
      await supabase
        .from('auction_likes')
        .insert({ user_id: user.id, auction_id: auctionId });
      setLiked(true);
      setLikesCount(likesCount + 1);
    }
  };

  return (
    <button onClick={toggleLike} className="btn p-0 border-0 bg-transparent">
      <i className={`bi bi-heart${liked ? '-fill text-danger' : ''}`} />
      <span className="ms-1">{likesCount}</span>
    </button>
  );
}
