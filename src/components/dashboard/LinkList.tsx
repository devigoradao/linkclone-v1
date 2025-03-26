'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/config';
import toast from 'react-hot-toast';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Link } from '@/types/database';

interface LinkListProps {
  initialLinks: Link[];
  userId: string;
}

export default function LinkList({ initialLinks, userId }: LinkListProps) {
  const [links, setLinks] = useState<Link[]>(initialLinks || []);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState('Visitar');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }
    const file = e.target.files[0];
    // Validar tamanho (5MB) e tipo
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('O arquivo deve ser uma imagem');
      return;
    }
    setSelectedFile(file);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setDescription('');
    setCtaText('Visitar');
    setSelectedFile(null);
    setEditingLink(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let thumbnailUrl = '';
      if (selectedFile) {
        thumbnailUrl = await uploadImage(selectedFile);
      }

      if (isEditing && editingLink) {
        // Atualiza o link existente
        const updates = {
          title,
          url,
          description,
          cta_text: ctaText,
          ...(thumbnailUrl && { thumbnail_url: thumbnailUrl }),
        };

        const { error } = await supabase
          .from('links')
          .update(updates)
          .eq('id', editingLink.id);

        if (error) throw error;

        // Atualiza o estado local
        setLinks(links.map(link => 
          link.id === editingLink.id 
            ? { ...link, ...updates } 
            : link
        ));
        toast.success('Link atualizado com sucesso!');
      } else {
        // Cria um novo link
        const newLink = {
          title,
          url,
          description,
          thumbnail_url: thumbnailUrl,
          cta_text: ctaText,
          user_id: userId,
          position: links.length,
          is_active: true,
          is_highlighted: false,
        };

        const { data, error } = await supabase
          .from('links')
          .insert([newLink])
          .select()
          .single();

        if (error) throw error;

        setLinks([...links, data]);
        toast.success('Link adicionado com sucesso!');
      }

      resetForm();
    } catch (error: any) {
      toast.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} link: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (link: Link) => {
    setTitle(link.title);
    setUrl(link.url);
    setDescription(link.description || '');
    setCtaText(link.cta_text);
    setEditingLink(link);
    setIsEditing(true);
    // Scroll suave até o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    try {
      const linkToDelete = links.find(link => link.id === id);
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Se o link tinha uma imagem, remove ela também
      if (linkToDelete?.thumbnail_url) {
        const fileName = linkToDelete.thumbnail_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('thumbnails')
            .remove([fileName]);
        }
      }

      setLinks(links.filter(link => link.id !== id));
      toast.success('Link removido com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao remover link: ' + error.message);
    }
  };

  const handleToggleHighlight = async (id: string) => {
    try {
      const linkToUpdate = links.find(link => link.id === id);
      if (!linkToUpdate) return;

      const isCurrentlyHighlighted = linkToUpdate.is_highlighted;

      // Se o link não está destacado, primeiro removemos o destaque de qualquer outro link
      if (!isCurrentlyHighlighted) {
        const { error: clearError } = await supabase
          .from('links')
          .update({ is_highlighted: false })
          .eq('user_id', userId)
          .eq('is_highlighted', true);

        if (clearError) throw clearError;
      }

      // Então atualizamos o status do link selecionado
      const { error: updateError } = await supabase
        .from('links')
        .update({ is_highlighted: !isCurrentlyHighlighted })
        .eq('id', id);

      if (updateError) throw updateError;

      // Atualiza o estado local
      setLinks(links.map(link => ({
        ...link,
        is_highlighted: link.id === id ? !isCurrentlyHighlighted : false
      })));

      toast.success(isCurrentlyHighlighted ? 'Destaque removido!' : 'Link destacado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar destaque: ' + error.message);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descrição (máx. 150 caracteres)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 150))}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            maxLength={150}
          />
          <p className="mt-1 text-sm text-gray-500">
            {description.length}/150 caracteres
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cta" className="block text-sm font-medium text-gray-700">
              Texto do botão
            </label>
            <input
              type="text"
              id="cta"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
              Imagem (opcional)
            </label>
            <input
              type="file"
              id="thumbnail"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : isEditing ? 'Atualizar Link' : 'Adicionar Link'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {links.length === 0 ? (
          <p className="text-center text-gray-500">
            Você ainda não tem nenhum link. Adicione seu primeiro link acima!
          </p>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              className={`relative rounded-lg border transition-all duration-200 ${
                link.is_highlighted
                  ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-center sm:items-start gap-3 sm:gap-4">
                    {link.thumbnail_url && (
                      <div className="flex-shrink-0">
                        <Image
                          src={link.thumbnail_url}
                          alt={link.title}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover w-12 h-12 sm:w-16 sm:h-16"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => handleToggleHighlight(link.id)}
                      className={`flex-shrink-0 transform transition-transform hover:scale-110 ${
                        link.is_highlighted ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-500'
                      }`}
                      title={link.is_highlighted ? 'Remover destaque' : 'Destacar link'}
                    >
                      {link.is_highlighted ? (
                        <StarSolidIcon className="h-6 w-6" />
                      ) : (
                        <StarOutlineIcon className="h-6 w-6" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-medium break-words ${
                          link.is_highlighted ? 'text-indigo-900' : 'text-gray-900'
                        }`}>
                          {link.title}
                        </h3>
                        {link.description && (
                          <p className="mt-1 text-sm text-gray-600 break-words line-clamp-2">
                            {link.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-indigo-600 truncate"
                          >
                            {link.url}
                          </a>
                          <span className="hidden sm:block text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-500">{link.cta_text}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-shrink-0 items-start gap-2">
                        <button
                          onClick={() => handleEdit(link)}
                          className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                          title="Editar link"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(link.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remover link"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 