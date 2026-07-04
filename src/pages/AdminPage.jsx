import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api';

const STATUS_COLOR = {
  PRESENT: { bg:'#f0fdf4', color:'#16a34a', dot:'#16a34a' },
  ABSENT:  { bg:'#fef2f2', color:'#dc2626', dot:'#dc2626' },
  LATE:    { bg:'#fffbeb', color:'#d97706', dot:'#d97706' },
  MANUAL:  { bg:'#f5f3ff', color:'#7c3aed', dot:'#7c3aed' },
};

export default function AdminPage() {
  const [teachers, setTeachers]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [marking, setMarking]       = useState(null);
  const [markForm, setMarkForm]     = useState({ status:'PRESENT', note:'' });
  const [markMsg, setMarkMsg]       = useState('');
  const [unlocking, setUnlocking]   = useState(null);

  async function load() {
    try {
      const data = await api.get('/teacher-attendance/today');
      setTeachers(data.data);
    } catch (err) {
      setError(err.message || 'Could not load data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleManualMark(e) {
    e.preventDefault();
    if (!marking) return;
    try {
      await api.post(`/teacher-attendance/${marking.teacherId}/manual-mark`, markForm);
      setMarkMsg(`Marked ${marking.name} as ${markForm.status}.`);
      setMarking(null);
      setMarkForm({ status:'PRESENT', note:'' });
      await load();
    } catch (err) {
      setMarkMsg(err.message || 'Failed to mark attendance.');
    }
  }

  async function handleUnlock(teacherId) {
    setUnlocking(teacherId);
    try {
      await api.post(`/teacher-attendance/${teacherId}/unlock`);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to unlock.');
    } finally {
      setUnlocking(null);
    }
  }

  const present = teachers.filter(t => t.status === 'PRESENT' || t.status === 'MANUAL').length;
  const absent  = teachers.filter(t => t.status === 'ABSENT').length;
  const fmtTime = dt => dt ? new Date(dt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '—';

  return (
    <Layout>
      <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>

        <h1 style={{ fontSize: 20, fontWeight: 700, color:'#1e293b' }}>
          Live Attendance — {new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })}
        </h1>

        {/* Summary */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 12 }}>
          {[
            { label:'Total',   value: teachers.length, color:'#1B2B4B' },
            { label:'Present', value: present,          color:'#16a34a' },
            { label:'Absent',  value: absent,           color:'#dc2626' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background:'#fff', borderRadius: 12, padding: '16px',
              textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <p style={{ fontSize: 26, fontWeight: 800, color }}>{value}</p>
              <p style={{ fontSize: 12, color:'#64748b', marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>

        {markMsg && (
          <div style={{
            background:'#f0fdf4', border:'1px solid #bbf7d0',
            borderRadius:10, padding:'10px 14px', fontSize:13, color:'#16a34a',
          }}>{markMsg}</div>
        )}
        {error && (
          <div style={{
            background:'#fef2f2', border:'1px solid #fecaca',
            borderRadius:10, padding:'10px 14px', fontSize:13, color:'#dc2626',
          }}>{error}</div>
        )}

        {/* Teacher list */}
        {loading ? (
          <p style={{ color:'#64748b', fontSize:13 }}>Loading…</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
            {teachers.map(t => {
              const sc = STATUS_COLOR[t.status] || STATUS_COLOR.ABSENT;
              return (
                <div key={t.teacherId} style={{
                  background:'#fff', borderRadius:12, padding:'14px 16px',
                  boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
                  display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
                    <div style={{
                      width:38, height:38, borderRadius:'50%',
                      background:'#1B2B4B', color:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontWeight:700, fontSize:14, flexShrink:0,
                    }}>
                      {t.name.charAt(0)}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontWeight:600, fontSize:14, color:'#1e293b', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {t.name}
                      </p>
                      <p style={{ fontSize:11, color:'#94a3b8' }}>
                        In: {fmtTime(t.checkInTime)} · Out: {fmtTime(t.checkOutTime)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                    <span style={{
                      background:sc.bg, color:sc.color,
                      padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:700,
                    }}>{t.status}</span>
                    <button
                      onClick={() => { setMarking(t); setMarkMsg(''); }}
                      style={{
                        background:'#f1f5f9', border:'none', color:'#475569',
                        padding:'5px 10px', borderRadius:7, fontSize:12, fontWeight:500,
                      }}>Mark</button>
                    {t.status === 'ABSENT' && (
                      <button
                        onClick={() => handleUnlock(t.teacherId)}
                        disabled={unlocking === t.teacherId}
                        style={{
                          background:'#fef3c7', border:'none', color:'#92400e',
                          padding:'5px 10px', borderRadius:7, fontSize:12, fontWeight:500,
                        }}>Unlock</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Manual Mark Modal */}
        {marking && (
          <div style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
            display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16,
          }}>
            <div style={{ background:'#fff', borderRadius:16, padding:24, width:'100%', maxWidth:380 }}>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>Manual Mark</h3>
              <p style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>{marking.name}</p>
              <form onSubmit={handleManualMark} style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={markForm.status}
                    onChange={e => setMarkForm(f => ({ ...f, status:e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">Late</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Note (optional)</label>
                  <input
                    type="text" value={markForm.note}
                    onChange={e => setMarkForm(f => ({ ...f, note:e.target.value }))}
                    placeholder="e.g. Sick leave"
                    style={inputStyle}
                  />
                </div>
                <div style={{ display:'flex', gap:8, marginTop:4 }}>
                  <button type="button" onClick={() => setMarking(null)} style={btnSecondary}>Cancel</button>
                  <button type="submit" style={btnPrimary}>Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

const labelStyle = { fontSize:12, fontWeight:600, color:'#475569', display:'block', marginBottom:4 };
const inputStyle = { width:'100%', padding:'9px 11px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14 };
const btnPrimary   = { flex:1, background:'#1B2B4B', color:'#fff', border:'none', padding:'10px', borderRadius:8, fontSize:13, fontWeight:600 };
const btnSecondary = { flex:1, background:'#f1f5f9', color:'#475569', border:'none', padding:'10px', borderRadius:8, fontSize:13, fontWeight:600 };