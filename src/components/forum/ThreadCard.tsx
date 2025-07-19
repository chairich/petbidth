'use client';

import Link from 'next/link';
import Image from 'next/image';

type Thread = {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
};

const ThreadCard = ({ thread }: { thread: Thread }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow hover:shadow-lg transition-all h-full w-full max-w-sm mx-auto">
      {thread.image_url ? (
        <img
          src={thread.image_url}
          alt={thread.title}
          className="w-full h-[160px] object-cover"
        />
      ) : (
        <div className="w-full h-[160px] bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-400">
          No Image
        </div>
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold text-zinc-100 mb-1">{thread.title}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-2">{thread.content}</p>
        <Link href={`/forum/${thread.id}`} className="text-blue-500 text-sm font-medium">
          Read more →
        </Link>
      </div>
    </div>
  );
};

export default ThreadCard;
