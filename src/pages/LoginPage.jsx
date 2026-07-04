import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password);
      const isAdmin = u.role === 'ADMIN' || u.role === 'SUPER_ADMIN';
      navigate(isAdmin ? '/admin' : '/teacher', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1B2B4B 0%, #2d4a8a 100%)',
      padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32,
        width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, background: '#f97316',
            borderRadius: 14, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12,
          }}>ET</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>EduTrack</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Teacher Attendance System</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap: 14 }}>
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#dc2626', padding: '10px 12px',
              borderRadius: 8, fontSize: 13,
            }}>{error}</div>
          )}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display:'block', marginBottom: 4 }}>
              Email
            </label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@school.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display:'block', marginBottom: 4 }}>
              Password
            </label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>
          <button type="submit" disabled={loading} style={btnPrimary}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
  borderRadius: 8, fontSize: 14, outline: 'none',
};

const btnPrimary = {
  background: '#1B2B4B', color: '#fff', border: 'none',
  padding: '12px', borderRadius: 8, fontSize: 14,
  fontWeight: 600, width: '100%', marginTop: 4,
};