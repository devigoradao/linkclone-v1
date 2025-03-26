'use client';

import { supabase } from '@/lib/supabase/config';
import type { Link } from '@/types/database';

interface UserLinksProps {
  links: Link[];
}

export default function UserLinks({ links }: UserLinksProps) {
  const handleClick = async (linkId: string) => {
    try {
      await supabase.from('analytics').insert([
        {
          link_id: linkId,
          clicks: 1,
        },
      ]);
    } catch (error) {
      console.error('Error registering click:', error);
    }
  };

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
          onClick={() => handleClick(link.id)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">{link.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{link.url}</p>
            </div>
            <span className="rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600">
              {link.cta_text}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
} 