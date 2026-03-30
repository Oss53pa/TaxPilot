import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useModeStore } from '../../store/modeStore';

type Status = 'loading' | 'error';

export default function ExternalAuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const setUser = useAuthStore((s) => s.setUser);
  const setMode = useModeStore((s) => s.setUserMode);
  const completeOnboarding = useModeStore((s) => s.completeOnboarding);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMessage("Aucun token fourni dans l'URL.");
      return;
    }
    exchangeToken(token);
  }, [searchParams]);

  async function exchangeToken(token: string) {
    try {
      setStatus('loading');

      if (!supabase) {
        throw new Error('Supabase non configure');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Call atlas-sso to validate token and get magic link
      const response = await fetch(`${supabaseUrl}/functions/v1/atlas-sso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de validation du token');
      }

      // Establish session
      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash: data.token_hash,
        type: 'magiclink',
      });

      if (otpError) {
        throw new Error(otpError.message);
      }

      // Get user from session
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser({
          id: parseInt(user.id.slice(0, 8), 16),
          username: user.email || '',
          email: user.email || '',
          is_staff: false,
          is_superuser: false,
        });
      }

      // Decode the original Atlas Studio JWT to extract the plan
      // and auto-configure Liass'Pilot mode (entreprise vs cabinet)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const plan = (payload.plan || '').toLowerCase();
        if (plan.includes('cabinet') || plan.includes('illimit')) {
          setMode('cabinet');
        } else {
          setMode('entreprise');
        }
        completeOnboarding();
      } catch {
        // Default to entreprise if JWT decode fails
        setMode('entreprise');
        completeOnboarding();
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('External auth error:', message);
      setStatus('error');
      setErrorMessage(message);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
      }}
    >
      <div style={{ maxWidth: 400, width: '100%', padding: 24, textAlign: 'center' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 40,
          }}
        >
          <h1
            style={{
              color: '#C8A960',
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Liass'Pilot
          </h1>

          {status === 'loading' && (
            <div>
              <p style={{ color: '#aaa', fontSize: 14, marginBottom: 16 }}>Connexion en cours...</p>
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: '3px solid rgba(200,169,96,0.3)',
                  borderTopColor: '#C8A960',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto',
                }}
              />
              <p style={{ color: '#666', fontSize: 12, marginTop: 16 }}>
                Validation de votre session Atlas Studio
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {status === 'error' && (
            <div>
              <p style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Connexion impossible
              </p>
              <p style={{ color: '#aaa', fontSize: 13, marginBottom: 24 }}>{errorMessage}</p>
              <a
                href="https://atlas-studio.org/portal"
                style={{
                  display: 'inline-block',
                  background: '#C8A960',
                  color: '#0a0a0a',
                  padding: '10px 24px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Retour a Atlas Studio
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
