import { useAuth } from '../AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const isAdmin          = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <header style={{
        background: '#1B2B4B', color: '#fff',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          <span style={{
            background: '#f97316', color: '#fff',
            fontWeight: 700, fontSize: 13,
            padding: '4px 8px', borderRadius: 6,
          }}>ET</span>
          <span style={{ fontWeight: 600, fontSize: 15 }}>EduTrack</span>
          {isAdmin && (
            <nav style={{ display:'flex', gap: 4, marginLeft: 16 }}>
              {[
                { to: '/admin',          label: 'Live' },
                { to: '/admin/reports',  label: 'Reports' },
                { to: '/admin/settings', label: 'Settings' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} style={{
                  color: location.pathname === to ? '#fff' : 'rgba(255,255,255,0.6)',
                  textDecoration: 'none', fontSize: 13, fontWeight: 500,
                  padding: '4px 10px', borderRadius: 6,
                  background: location.pathname === to ? 'rgba(255,255,255,0.1)' : 'transparent',
                }}>{label}</Link>
              ))}
            </nav>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            {user?.firstName} {user?.lastName}
          </span>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none',
            color: '#fff', padding: '6px 12px', borderRadius: 6, fontSize: 12,
          }}>Sign out</button>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, maxWidth: 680, width: '100%', margin: '0 auto', padding: '32px 16px' }}>
        {children}
      </main>

      <footer style={{ textAlign:'center', padding: '16px', fontSize: 11, color: '#94a3b8' }}>
        © {new Date().getFullYear()} NoxVector · EduTrack Teacher Attendance
      </footer>
    </div>
  );
}