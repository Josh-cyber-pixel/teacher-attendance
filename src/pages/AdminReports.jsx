import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api';

export default function AdminReports() {
  const [tab, setTab]           = useState('daily');
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth]       = useState(new Date().toISOString().slice(0,7));
  const [dailyData, setDailyData]   = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function loadDaily() {
    setLoading(true); setError('');
    try {
      const data = await api.get(`/teacher-attendance/report/daily?date=${date}`);
      setDailyData(data.data);
    } catch (err) { setError(err.message || 'Failed to load.'); }
    finally { setLoading(false); }
  }

  async function loadMonthly() {
    setLoading(true); setError('');
    try {
      const data = await api.get(`/teacher-attendance/report/monthly?month=${month}`);
      setMonthlyData(data.data);
    } catch (err) { setError(err.message || 'Failed to load.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (tab === 'daily') loadDaily(); }, [date, tab]);
  useEffect(() => { if (tab === 'monthly') loadMonthly(); }, [month, tab]);

  const fmtTime = dt => dt ? new Date(dt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '—';

  const statusColor = {
    PRESENT:'#16a34a', ABSENT:'#dc2626', LATE:'#d97706', MANUAL:'#7c3aed',
  };

  return (
    <Layout>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <h1 style={{ fontSize:20, fontWeight:700 }}>Attendance Reports</h1>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:10, padding:4 }}>
          {['daily','monthly'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:'8px', borderRadius:8, border:'none',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#1e293b' : '#64748b',
              fontWeight: tab === t ? 600 : 400, fontSize:13,
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#dc2626' }}>
            {error}
          </div>
        )}

        {/* Daily */}
        {tab === 'daily' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
            {loading ? <p style={{ color:'#64748b', fontSize:13 }}>Loading…</p> : dailyData && (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                  {[
                    { label:'Total',   value:dailyData.summary.total },
                    { label:'Present', value:dailyData.summary.present },
                    { label:'Absent',  value:dailyData.summary.absent },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background:'#fff', borderRadius:10, padding:'14px', textAlign:'center', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
                      <p style={{ fontSize:22, fontWeight:800, color:'#1B2B4B' }}>{value}</p>
                      <p style={{ fontSize:11, color:'#94a3b8' }}>{label}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background:'#fff', borderRadius:12, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
                  {dailyData.rows.map((r, i) => (
                    <div key={i} style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'12px 16px', borderBottom: i < dailyData.rows.length-1 ? '1px solid #f1f5f9' : 'none',
                    }}>
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{r.name}</p>
                        <p style={{ fontSize:11, color:'#94a3b8' }}>In: {fmtTime(r.checkInTime)} · Out: {fmtTime(r.checkOutTime)}</p>
                      </div>
                      <span style={{
                        color: statusColor[r.status] || '#64748b',
                        background: (statusColor[r.status] || '#64748b') + '18',
                        padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:700,
                      }}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Monthly */}
        {tab === 'monthly' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={inputStyle} />
            {loading ? <p style={{ color:'#64748b', fontSize:13 }}>Loading…</p> : monthlyData && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {monthlyData.map((t, i) => (
                  <div key={i} style={{ background:'#fff', borderRadius:12, padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <p style={{ fontWeight:600, fontSize:14, color:'#1e293b' }}>{t.name}</p>
                      <span style={{
                        background: t.summary.rate >= 80 ? '#f0fdf4' : '#fef2f2',
                        color: t.summary.rate >= 80 ? '#16a34a' : '#dc2626',
                        padding:'3px 9px', borderRadius:20, fontSize:12, fontWeight:700,
                      }}>{t.summary.rate}%</span>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                      {[
                        { label:'Present', value:t.summary.present, color:'#16a34a' },
                        { label:'Absent',  value:t.summary.absent,  color:'#dc2626' },
                        { label:'Late',    value:t.summary.late,    color:'#d97706' },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ background:'#f8fafc', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                          <p style={{ fontSize:18, fontWeight:700, color }}>{value}</p>
                          <p style={{ fontSize:10, color:'#94a3b8' }}>{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

const inputStyle = { padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, width:'100%' };