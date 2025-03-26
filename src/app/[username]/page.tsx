import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Profile, Link } from '@/types/database';
import {
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
} from 'react-icons/fa';

export default async function UserPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('is_highlighted', { ascending: false })
    .order('position');

  // Garantir que links nunca seja null
  const sortedLinks = (links || []).sort((a, b) => {
    if (a.is_highlighted && !b.is_highlighted) return -1;
    if (!a.is_highlighted && b.is_highlighted) return 1;
    return a.position - b.position;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-10">
          {profile.avatar_url ? (
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-6">
              <Image
                src={profile.avatar_url}
                alt={profile.full_name}
                fill
                className="rounded-full border-4 border-white shadow-xl object-cover"
                priority
              />
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center border-4 border-white shadow-xl mb-6">
              <span className="text-3xl sm:text-4xl font-bold text-white">
                {profile.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
            {profile.full_name}
          </h1>
          <p className="text-lg text-gray-600 text-center mb-4">@{profile.username}</p>
          {profile.bio && (
            <p className="text-gray-600 text-center max-w-md mb-8 px-4">
              {profile.bio}
            </p>
          )}

          {/* Social Media Icons */}
          <div className="flex items-center justify-center gap-4 mb-10 flex-wrap px-4">
            {profile.instagram_url && (
              <a
                href={`https://instagram.com/${profile.instagram_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-all duration-200 hover:scale-110"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg hover:shadow-xl">
                  <FaInstagram className="w-6 h-6 text-white" />
                </div>
              </a>
            )}
            {profile.twitter_url && (
              <a
                href={`https://twitter.com/${profile.twitter_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-all duration-200 hover:scale-110"
              >
                <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center shadow-lg hover:shadow-xl">
                  <FaTwitter className="w-6 h-6 text-white" />
                </div>
              </a>
            )}
            {profile.facebook_url && (
              <a
                href={`https://facebook.com/${profile.facebook_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-all duration-200 hover:scale-110"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl">
                  <FaFacebook className="w-6 h-6 text-white" />
                </div>
              </a>
            )}
            {profile.linkedin_url && (
              <a
                href={`https://linkedin.com/in/${profile.linkedin_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-all duration-200 hover:scale-110"
              >
                <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center shadow-lg hover:shadow-xl">
                  <FaLinkedin className="w-6 h-6 text-white" />
                </div>
              </a>
            )}
            {profile.youtube_url && (
              <a
                href={`https://youtube.com/${profile.youtube_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-all duration-200 hover:scale-110"
              >
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg hover:shadow-xl">
                  <FaYoutube className="w-6 h-6 text-white" />
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Links Section */}
        <div className="space-y-4 px-4">
          {sortedLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block group transform transition-all duration-200 hover:scale-[1.01] ${
                link.is_highlighted ? 'hover:scale-[1.02]' : ''
              }`}
            >
              <div
                className={`rounded-2xl ${
                  link.is_highlighted
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 shadow-lg'
                    : 'p-[2px] bg-gradient-to-r from-indigo-600/40 via-purple-500/40 to-pink-500/40 hover:from-indigo-600/60 hover:via-purple-500/60 hover:to-pink-500/60'
                }`}
              >
                <div
                  className={`
                    rounded-2xl transition-all duration-200
                    ${link.is_highlighted
                      ? 'text-white'
                      : 'bg-white h-full'
                    }
                  `}
                >
                  {link.is_highlighted ? (
                    // Layout para link destacado
                    <div className="p-6 flex flex-col sm:flex-row gap-6">
                      <div className="sm:w-1/3 flex-shrink-0">
                        {link.thumbnail_url ? (
                          <Image
                            src={link.thumbnail_url}
                            alt={link.title}
                            width={320}
                            height={240}
                            className="w-full rounded-xl object-cover aspect-4/3 shadow-md"
                          />
                        ) : (
                          <div className="w-full aspect-4/3 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-md">
                            <span className="text-4xl font-bold text-white">
                              {link.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center text-center sm:text-left gap-4">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-semibold line-clamp-1">
                            {link.title}
                          </h2>
                          {link.description && (
                            <p className="text-base text-white/90 mt-2 sm:mt-3 leading-relaxed">
                              {link.description}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-medium bg-white/90 text-indigo-600 shadow-sm w-[140px] mx-auto sm:mx-0 hover:bg-white transition-colors duration-200">
                          {link.cta_text}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Layout para links normais
                    <div className="p-4 flex items-center gap-4">
                      {link.thumbnail_url ? (
                        <div className="flex-shrink-0">
                          <Image
                            src={link.thumbnail_url}
                            alt={link.title}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-indigo-600">
                            {link.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold text-gray-900 line-clamp-1">
                          {link.title}
                        </h2>
                        {link.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {link.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-600/5 to-purple-500/5 text-gray-700 group-hover:from-indigo-600/10 group-hover:to-purple-500/10 group-hover:text-indigo-600 transition-colors duration-200">
                          {link.cta_text}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Feito com ❤️ usando{' '}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              LinkShare
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 