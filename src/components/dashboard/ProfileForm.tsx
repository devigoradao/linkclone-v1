'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import type { Profile } from '@/types/database';

interface ProfileFormProps {
  profile: Profile;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(profile.username);
  const [fullName, setFullName] = useState(profile.full_name);
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [socialLinks, setSocialLinks] = useState({
    instagram: profile.instagram_url || '',
    twitter: profile.twitter_url || '',
    facebook: profile.facebook_url || '',
    linkedin: profile.linkedin_url || '',
    youtube: profile.youtube_url || '',
  });

  const supabase = createClient();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      setUploadProgress(0);

      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('Você precisa selecionar uma imagem para fazer upload.');
      }

      const file = e.target.files[0];
      
      // Validar tamanho do arquivo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 5MB.');
      }

      // Validar tipo do arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo deve ser uma imagem.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;

      // Simular progresso de upload
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Remover avatar antigo se existir
      if (avatarUrl) {
        const oldFileName = avatarUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([oldFileName]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      clearInterval(interval);
      setUploadProgress(100);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);

      // Atualizar o perfil com o novo avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast.success('Avatar atualizado com sucesso!');
      router.refresh();

      // Resetar o progresso após um momento
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (error: any) {
      toast.error('Erro ao fazer upload do avatar: ' + error.message);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Função auxiliar para formatar URLs de redes sociais
      const formatSocialUrl = (platform: string, username: string): string => {
        if (!username) return '';
        username = username.trim();
        // Remove qualquer URL existente para extrair apenas o username
        username = username.replace(/^https?:\/\//, '').replace(/^www\./, '');
        username = username.replace(`${platform}.com/`, '');
        username = username.replace(`${platform}.com`, '');
        username = username.replace(/^\/+|\/+$/g, ''); // Remove barras no início/fim
        return username;
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          full_name: fullName,
          bio,
          avatar_url: avatarUrl,
          instagram_url: formatSocialUrl('instagram', socialLinks.instagram),
          twitter_url: formatSocialUrl('twitter', socialLinks.twitter),
          facebook_url: formatSocialUrl('facebook', socialLinks.facebook),
          linkedin_url: formatSocialUrl('linkedin', socialLinks.linkedin),
          youtube_url: formatSocialUrl('youtube', socialLinks.youtube),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
      router.refresh();
    } catch (error: any) {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Foto de Perfil
          </label>
          <div className="mt-2 flex items-center gap-x-3">
            <div className="relative h-24 w-24">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <UserCircleIcon className="h-20 w-20 text-white" />
                </div>
              )}
              {uploadProgress > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-full rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white font-medium">
                      {uploadProgress}%
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              <button
                type="button"
                className={`relative px-3 py-2 text-sm font-semibold text-gray-900 bg-white rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Enviando...' : 'Alterar foto'}
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            JPG, PNG ou GIF. Tamanho máximo de 5MB.
          </p>
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
            Nome de Usuário
          </label>
          <div className="mt-2">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="seu_username"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Será usado na URL da sua página: linkshare.com/{username}
          </p>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium leading-6 text-gray-900">
            Nome Completo
          </label>
          <div className="mt-2">
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Seu Nome Completo"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium leading-6 text-gray-900">
            Bio
          </label>
          <div className="mt-2">
            <textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Conte um pouco sobre você..."
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Uma breve descrição sobre você que será exibida na sua página pública.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Redes Sociais</h3>
          
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
              Instagram
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                instagram.com/
              </span>
              <input
                type="text"
                id="instagram"
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                className="flex-1 min-w-0 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="seu.perfil"
              />
            </div>
          </div>

          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
              Twitter
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                twitter.com/
              </span>
              <input
                type="text"
                id="twitter"
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                className="flex-1 min-w-0 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="seu_perfil"
              />
            </div>
          </div>

          <div>
            <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
              Facebook
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                facebook.com/
              </span>
              <input
                type="text"
                id="facebook"
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                className="flex-1 min-w-0 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="seu.perfil"
              />
            </div>
          </div>

          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
              LinkedIn
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                linkedin.com/in/
              </span>
              <input
                type="text"
                id="linkedin"
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                className="flex-1 min-w-0 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="seu-perfil"
              />
            </div>
          </div>

          <div>
            <label htmlFor="youtube" className="block text-sm font-medium text-gray-700">
              YouTube
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                youtube.com/
              </span>
              <input
                type="text"
                id="youtube"
                value={socialLinks.youtube}
                onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                className="flex-1 min-w-0 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="@seu.canal"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
} 