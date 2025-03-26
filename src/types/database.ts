export type Link = {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  url: string;
  description?: string;
  thumbnail_url?: string | null;
  cta_text: string;
  position: number;
  is_active: boolean;
  is_highlighted: boolean;
  updated_at: string;
};

export type Profile = {
  id: string;
  created_at: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  facebook_url?: string | null;
  linkedin_url?: string | null;
  youtube_url?: string | null;
};

export interface Analytics {
  id: string;
  link_id: string;
  clicks: number;
  last_clicked_at: string;
  created_at: string;
  updated_at: string;
} 