import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Erro de Autenticação</h1>
        <p className="mb-8 text-gray-600">
          Ocorreu um erro durante o processo de autenticação. Por favor, tente fazer login novamente ou entre
          em contato com o suporte se o problema persistir.
        </p>
        <Link
          href="/login"
          className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Voltar para o Login
        </Link>
      </div>
    </div>
  );
} 