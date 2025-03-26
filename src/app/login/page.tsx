import AuthForm from '@/components/auth/AuthForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <AuthForm mode="login" />
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Não tem uma conta?{' '}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  );
} 