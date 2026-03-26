import { signIn } from '@/auth';

export default function LoginPage() {
  return (
    <main style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>HRPortfolio</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <form
          action={async () => {
            'use server';
            await signIn('github', { redirectTo: '/dashboard' });
          }}
        >
          <button
            type="submit"
            style={{ padding: '0.75rem 1.5rem', background: '#1a1a1a', color: '#fff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
          >
            GitHubでログイン
          </button>
        </form>
      </div>
    </main>
  );
}
