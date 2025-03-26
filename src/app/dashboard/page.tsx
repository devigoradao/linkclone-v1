import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LinkList from '@/components/dashboard/LinkList';

export default async function DashboardPage() {
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

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', session.user.id)
    .order('position');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Meus Links
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Gerencie seus links compartilhados. Adicione, edite ou remova links conforme necessário.
        </p>
      </div>
      <LinkList initialLinks={links || []} userId={session.user.id} />
    </div>
  );
} 