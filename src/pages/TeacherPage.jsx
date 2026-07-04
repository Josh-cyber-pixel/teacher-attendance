import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import Layout from '../components/Layout';
import api from '../api';

export default function TeacherPage() {
  const { user }  = useAuth();
  const [status, setStatus]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [step, setStep]         = useState('idle'); // idle | otp | done
  const [otp, setOtp]           = useState(['','','','','','']);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage]   = useState('');
  const [error, setError]       = useState('');
  const [working, setWorking]   = useState(false);
  const inputRefs               = useRef([]);
  const timerRef                = useRef(null);

  async function loadStatus() {
    try {
      const data = await api.get('/teacher-attendance/my-status');
      setStatus(data.data);
    } catch (err) {
      setError(err.message || 'Could not load status.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStatus(); }, []);

  useEffect(() => {
    if (countdown <= 0) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [countdown]);

  async function handleRequestOtp() {
    setError('');
    setWorking(true);
    try {
      const data = await api.post('/teacher-attendance/request-otp');
      setCountdown(data.data.expiresInSeconds || 600);
      setStep('otp');
      setMessage('OTP sent to your registered phone number.');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message || 'Could not send OTP.');
    } finally {
      setWorking(false);
    }
  }

  function handleOtpChange(val, idx) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(e, idx) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  async function handleCheckIn() {
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter all 6 digits.'); return; }
    setError('');
    setWorking(true);
    try {
      const data = await api.post('/teacher-attendance/check-in', { otp: code });
      setMessage(data.message || 'Checked in successfully!');
      setStep('done');
      await loadStatus();
    } catch (err) {
      setError(err.message || 'Check-in failed.');
      setOtp(['','','','','','']);
      inputRefs.current[0]?.focus();
    } finally {
      setWorking(false);
    }
  }

  async function handleCheckOut() {
    setError('');
    setWorking(true);
    try {
      const data = await api.post('/teacher-attendance/check-out');
      setMessage(data.message || 'Checked out successfully!');
      await loadStatus();
    } catch (err) {
      setError(err.message || 'Check-out failed.');
    } finally {
      setWorking(false);
    }
  }

  const fmtTime = dt => dt ? new Date(dt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '—';
  const fmtCountdown = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  const statusColor = {
    PRESENT: '#16a34a', ABSENT: '#dc2626',
    LATE: '#d97706', MANUAL: '#7c3aed',
  };

  return (
    <Layout>
      <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>

        {/* Greeting */}
        <div style={{ background:'#1B2B4B', borderRadius: 14, padding: '20px 24px', color:'#fff' }}>
          <p style={{ fontSize: 13, color:'rgba(255,255,255,0.6)', marginBottom: 4 }}>
            {new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {user?.firstName}
          </h2>
        </div>

        {/* Status card */}
        {!loading && status && (
          <div style={{ background:'#fff', borderRadius: 14, padding: 20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color:'#475569' }}>TODAY'S STATUS</span>
              <span style={{
                background: statusColor[status.status] + '18',
                color: statusColor[status.status],
                padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              }}>{status.status}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
              {[
                { label:'Check In',  value: fmtTime(status.checkInTime) },
                { label:'Check Out', value: fmtTime(status.checkOutTime) },
              ].map(({ label, value }) => (
                <div key={label} style={{ background:'#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color:'#94a3b8', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color:'#1e293b' }}>{value}</p>
                </div>
              ))}
            </div>
            {status.isLocked && (
              <div style={{
                marginTop: 12, background:'#fef2f2', border:'1px solid #fecaca',
                borderRadius: 8, padding: '10px 12px', fontSize: 13, color:'#dc2626',
              }}>
                Your OTP is locked. Contact admin to unlock.
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {message && (
          <div style={{
            background:'#f0fdf4', border:'1px solid #bbf7d0',
            borderRadius: 10, padding: '12px 14px', fontSize: 13, color:'#16a34a',
          }}>{message}</div>
        )}
        {error && (
          <div style={{
            background:'#fef2f2', border:'1px solid #fecaca',
            borderRadius: 10, padding: '12px 14px', fontSize: 13, color:'#dc2626',
          }}>{error}</div>
        )}

        {/* OTP Entry */}
        {step === 'otp' && (
          <div style={{ background:'#fff', borderRadius: 14, padding: 20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color:'#1e293b', marginBottom: 6 }}>Enter OTP</p>
            <p style={{ fontSize: 12, color:'#64748b', marginBottom: 16 }}>
              Enter the 6-digit code sent to your phone.
              {countdown > 0 && <span style={{ color:'#f97316', fontWeight:600 }}> Expires in {fmtCountdown(countdown)}</span>}
            </p>
            <div style={{ display:'flex', gap: 8, justifyContent:'center', marginBottom: 16 }}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => inputRefs.current[idx] = el}
                  type="text" inputMode="numeric"
                  maxLength={1} value={digit}
                  onChange={e => handleOtpChange(e.target.value, idx)}
                  onKeyDown={e => handleOtpKeyDown(e, idx)}
                  style={{
                    width: 44, height: 52, textAlign:'center',
                    fontSize: 22, fontWeight: 700,
                    border: '2px solid ' + (digit ? '#1B2B4B' : '#e2e8f0'),
                    borderRadius: 10, outline:'none',
                  }}
                />
              ))}
            </div>
            <button onClick={handleCheckIn} disabled={working} style={{...btnPrimary, width:'100%'}}>
              {working ? 'Verifying…' : 'Verify & Check In'}
            </button>
          </div>
        )}

        {/* Action buttons */}
        {!loading && status && step !== 'otp' && (
          <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
            {!status.checkedIn && !status.isLocked && (
              <button onClick={handleRequestOtp} disabled={working} style={btnPrimary}>
                {working ? 'Sending OTP…' : 'Request Check-In OTP'}
              </button>
            )}
            {status.checkedIn && !status.checkedOut && (
              <button onClick={handleCheckOut} disabled={working} style={btnSecondary}>
                {working ? 'Checking out…' : 'Check Out'}
              </button>
            )}
            {status.checkedIn && status.checkedOut && (
              <div style={{
                background:'#f0fdf4', border:'1px solid #bbf7d0',
                borderRadius: 10, padding: '14px', fontSize: 14,
                color:'#16a34a', fontWeight: 600, textAlign:'center',
              }}>
                ✓ All done for today!
              </div>
            )}
          </div>
        )}

      </div>
    </Layout>
  );
}

const btnPrimary = {
  background:'#1B2B4B', color:'#fff', border:'none',
  padding:'14px', borderRadius:10, fontSize:14,
  fontWeight:600, width:'100%',
};
const btnSecondary = {
  background:'#f97316', color:'#fff', border:'none',
  padding:'14px', borderRadius:10, fontSize:14,
  fontWeight:600, width:'100%',
};