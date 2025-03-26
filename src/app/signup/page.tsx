import AuthForm from '@/components/auth/AuthForm';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <AuthForm mode="signup" />
    </main>
  );
} 