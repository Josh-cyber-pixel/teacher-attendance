import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api';

export default function AdminSettings() {
  const [wifiIp, setWifiIp]   = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/teacher-attendance/settings')
      .then(data => {
        setWifiIp(data.data?.SCHOOL_WIFI_IP || '');
      })
      .catch(err => setError(err.message || 'Could not load settings.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setMessage(''); setError('');
    try {
      await api.patch('/teacher-attendance/settings/SCHOOL_WIFI_IP', { value: wifiIp });
      setMessage('School WiFi IP saved. Teachers must now be on this IP to check in.');
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <h1 style={{ fontSize:20, fontWeight:700 }}>Settings</h1>

        <div style={{ background:'#fff', borderRadius:14, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>School WiFi IP</h2>
          <p style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>
            Teachers must be connected to this IP address to request a check-in OTP.
            Leave blank to disable IP validation (allow check-in from anywhere).
            You can enter multiple IPs separated by commas.
          </p>

          {loading ? <p style={{ color:'#64748b', fontSize:13 }}>Loading…</p> : (
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'#475569', display:'block', marginBottom:4 }}>
                  IP Address(es)
                </label>
                <input
                  type="text" value={wifiIp}
                  onChange={e => setWifiIp(e.target.value)}
                  placeholder="e.g. 192.168.1.1 or 192.168.1.1, 10.0.0.1"
                  style={{ width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14 }}
                />
              </div>
              {message && (
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#16a34a' }}>
                  {message}
                </div>
              )}
              {error && (
                <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#dc2626' }}>
                  {error}
                </div>
              )}
              <button type="submit" disabled={saving} style={{
                background:'#1B2B4B', color:'#fff', border:'none',
                padding:'11px', borderRadius:8, fontSize:14, fontWeight:600,
              }}>
                {saving ? 'Saving…' : 'Save Settings'}
              </button>
            </form>
          )}
        </div>

        <div style={{ background:'#fffbeb', border:'1px solid #fef08a', borderRadius:12, padding:16 }}>
          <p style={{ fontSize:13, fontWeight:600, color:'#92400e', marginBottom:4 }}>How to find your school WiFi IP</p>
          <p style={{ fontSize:12, color:'#78350f', lineHeight:1.6 }}>
            Connect to the school WiFi, then visit{' '}
            <a href="https://api.ipify.org" target="_blank" rel="noreferrer" style={{ color:'#1B2B4B', fontWeight:600 }}>
              api.ipify.org
            </a>{' '}
            to see your public IP. For internal networks, check your router's admin panel for the LAN IP range.
          </p>
        </div>
      </div>
    </Layout>
  );
}