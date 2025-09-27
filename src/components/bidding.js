import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import '../styles/style.css';

import API from '../api';

API.get('/api/bidding');


// Axios instance (set VITE_API_BASE or REACT_APP_API_BASE if needed)
const API = axios.create({ baseURL: import.meta?.env?.VITE_API_BASE || process.env.REACT_APP_API_BASE || '' });

/* =======================
   Sample data fallback
   ======================= */
const SAMPLE_LOTS = [
  {
    id: 'LOT-101',
    title: 'Warehouse A – Chennai',
    warehouseId: 'WH-CH-001',
    location: 'Chennai, TN',
    description: 'Various scrap materials; pallets and packing returns.',
    startAtIso: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    endAtIso: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    status: 'upcoming'
  },
  {
    id: 'LOT-202',
    title: 'Hangar B – Bengaluru',
    warehouseId: 'HG-BLR-014',
    location: 'Bengaluru, KA',
    description: 'Aluminium scrap, iron boring, mixed cable reels.',
    startAtIso: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    endAtIso: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    status: 'open'
  }
];

const SAMPLE_BIDS_BY_LOT = {
  'LOT-202': [
    { user: 'ravi.k', amount: 1500, tsIso: new Date(Date.now() - 10 * 60 * 1000).toISOString(), status: 'outbid' },
    { user: 'asha.p', amount: 1600, tsIso: new Date(Date.now() - 7 * 60 * 1000).toISOString(), status: 'outbid' },
    { user: 'megha.s', amount: 1700, tsIso: new Date(Date.now() - 2 * 60 * 1000).toISOString(), status: 'leading' }
  ],
  'LOT-101': []
};

/* =======================
   UTC formatting helpers
   ======================= */
function ordinal(n){ const s=["th","st","nd","rd"], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }
function fmtUtcDateTime(iso){
  if(!iso) return '—';
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth()+1).padStart(2,'0');
  const day = String(d.getUTCDate()).padStart(2,'0');
  const hh = String(d.getUTCHours()).padStart(2,'0');
  const mm = String(d.getUTCMinutes()).padStart(2,'0');
  return `${y}-${m}-${day} ${hh}:${mm} UTC`;
}
function formatRangeUTC(startIso, endIso){
  if(!startIso || !endIso) return '—';
  const s = new Date(startIso), e = new Date(endIso);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const day = ordinal(s.getUTCDate());
  const month = months[s.getUTCMonth()];
  const year = s.getUTCFullYear();
  const tf = (d)=>{ let h=d.getUTCHours(), m=String(d.getUTCMinutes()).padStart(2,'0'); const ampm=h>=12?'PM':'AM'; h=h%12||12; return `${h}:${m} ${ampm}`; };
  return `${day} ${month} ${year} Between ${tf(s)} to ${tf(e)} (UTC)`;
}

const Bidding = () => {
  const [step, setStep] = useState('choice'); // choice | participate | conduct
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);

  // Rules / schedule (UTC ISO)
  const [rules, setRules] = useState({
    minStart: 1000, minIncrement: 100, endAtIso: '',
    graceSeconds: 180, extendSeconds: 120, highestValidSeconds: 120,
    allowForceClose: true, reserve: 0
  });

  // Meta for headers (UTC ISO)
  const [auctionMeta, setAuctionMeta] = useState({
    title:'', warehouseId:'', location:'', startAtIso:'', endAtIso:''
  });

  // Bids and UI
  const [bids, setBids] = useState([]);
  const [filters, setFilters] = useState({ user:'', min:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  // Timer
  const [countdown, setCountdown] = useState('--:--');
  const [auctionStatus, setAuctionStatus] = useState('open');
  const endAtRef = useRef(null);
  const tickRef = useRef(null);

  // Bid form
  const [bidAmount, setBidAmount] = useState(0);
  const [bidNote, setBidNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [bidError, setBidError] = useState('');
  const [bidInfo, setBidInfo] = useState('');

  /* Fetch list for participate; coerce times to UTC ISO if needed */
  useEffect(() => {
    if (step === 'participate') {
      API.get('/api/auctions?state=open,upcoming')
        .then(r => {
          const raw = Array.isArray(r.data) ? r.data : SAMPLE_LOTS;
          const fixIso = (x)=> x && !String(x).endsWith('Z') ? new Date(x).toISOString() : x;
          const fixed = raw.map(l => ({ ...l, startAtIso: fixIso(l.startAtIso), endAtIso: fixIso(l.endAtIso) }));
          setLots(fixed);
        })
        .catch(() => setLots(SAMPLE_LOTS));
    }
  }, [step]);

  // Provide defaults when only samples exist
  useEffect(() => {
    if (step === 'participate' && lots.length && !rules.endAtIso) {
      setRules(prev => ({ ...prev, minStart: 1000, minIncrement: 100 }));
    }
  }, [step, lots, rules.endAtIso]);

  /* Admin: load current auction */
  useEffect(() => {
    if (step === 'conduct') {
      setLoading(true); setError('');
      Promise.all([API.get('/api/auctions/current'), API.get('/api/auctions/current/bids')])
        .then(([aRes, bRes]) => {
          const a = aRes.data || {};
          const fixIso = (x)=> x && !String(x).endsWith('Z') ? new Date(x).toISOString() : x;
          setRules(prev => ({
            ...prev,
            minStart: a.minStart ?? prev.minStart,
            minIncrement: a.minIncrement ?? prev.minIncrement,
            graceSeconds: a.graceSeconds ?? prev.graceSeconds,
            extendSeconds: a.extendSeconds ?? prev.extendSeconds,
            highestValidSeconds: a.highestValidSeconds ?? prev.highestValidSeconds,
            allowForceClose: a.allowForceClose ?? prev.allowForceClose,
            reserve: a.reserve ?? prev.reserve,
            endAtIso: fixIso(a.endAtIso) ?? prev.endAtIso
          }));
          setAuctionMeta({
            title: a.title || '',
            warehouseId: a.warehouseId || a.assetId || '',
            location: a.location || a.city || '',
            startAtIso: fixIso(a.startAtIso || a.startAt) || '',
            endAtIso: fixIso(a.endAtIso || a.endAt) || ''
          });
          if (a.endAtIso || a.endAt) endAtRef.current = new Date(a.endAtIso || a.endAt);
          setBids(Array.isArray(bRes.data) ? bRes.data : []);
          setAuctionStatus(a.status || 'open');
        })
        .catch(e => { setError('Failed to load auction settings'); console.error(e); })
        .finally(() => setLoading(false));
    }
  }, [step]);

  /* Countdown from UTC ISO */
  useEffect(() => {
    clearInterval(tickRef.current);
    if (auctionStatus !== 'open' || !endAtRef.current) { setCountdown('--:--'); return; }
    tickRef.current = setInterval(() => {
      if (auctionStatus !== 'open' || !endAtRef.current) { setCountdown('--:--'); return; }
      const ms = endAtRef.current.getTime() - Date.now();
      if (ms <= 0) { setCountdown('00:00'); setAuctionStatus('closed'); clearInterval(tickRef.current); return; }
      const s = Math.floor(ms / 1000);
      setCountdown(`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [rules.endAtIso, auctionStatus]);

  /* Derived values */
  const leadingBid = useMemo(() => bids.find(b => b.status === 'leading') || null, [bids]);
  const currentPrice = useMemo(() => leadingBid ? leadingBid.amount : 0, [leadingBid]);
  const requiredNextBid = useMemo(
    () => currentPrice ? currentPrice + Number(rules.minIncrement || 0) : Number(rules.minStart || 0),
    [currentPrice, rules.minStart, rules.minIncrement]
  );

  /* Handlers */
  const handleRuleChange = (e) => { const {name,type,value,checked}=e.target; setRules(r=>({...r,[name]:type==='checkbox'?checked:value})); };

  // Option B: treat datetime-local as UTC wall time
  const setEndFromInput = (value) => {
    // value like "2025-09-25T22:15"
    if (!value) return;
    const iso = `${value}:00Z`;             // force UTC exact minute
    const d = new Date(iso);
    if (!isNaN(d.getTime())) {
      endAtRef.current = d;
      setRules(r => ({ ...r, endAtIso: iso }));
      setAuctionMeta(m => ({ ...m, endAtIso: iso }));
    }
  };

  const saveRules = async () => {
    try {
      setError('');
      const payload = {
        ...rules,
        minStart: Number(rules.minStart || 0),
        minIncrement: Number(rules.minIncrement || 0),
        graceSeconds: Number(rules.graceSeconds || 0),
        extendSeconds: Number(rules.extendSeconds || 0),
        highestValidSeconds: Number(rules.highestValidSeconds || 0),
        reserve: Number(rules.reserve || 0),
        title: auctionMeta.title || undefined,
        startAtIso: auctionMeta.startAtIso || undefined
      };
      if (!payload.endAtIso) throw new Error('Set end time');
      if (payload.minIncrement < 1) throw new Error('Min increment must be ≥ 1');
      await API.patch('/api/auctions/current', payload);
      setSubmitMessage('Rules saved');
    } catch (e) { setError(e.message || 'Failed to save rules'); }
  };

  const forceClose = async () => {
    if (!rules.allowForceClose) { setError('Force close disabled by policy.'); return; }
    setAuctionStatus('closed'); try { await API.post('/api/auctions/current/force-close'); } catch(e){ console.error(e); }
  };

  /* List -> detail */
  const openLot = (l) => {
    setSelectedLot(l);
    setAuctionMeta({
      title: l.title || '',
      warehouseId: l.warehouseId || l.assetId || '',
      location: l.location || '',
      startAtIso: l.startAtIso || '',
      endAtIso: l.endAtIso || ''
    });
    if (l.endAtIso) { endAtRef.current = new Date(l.endAtIso); setRules(r => ({ ...r, endAtIso: l.endAtIso })); }
    API.get(`/api/auctions/${l.id}/bids`)
      .then(r => setBids(Array.isArray(r.data) ? r.data : (SAMPLE_BIDS_BY_LOT[l.id] || [])))
      .catch(() => setBids(SAMPLE_BIDS_BY_LOT[l.id] || []));
  };

  /* Place bid */
  const submitBid = async () => {
    setBidError(''); setBidInfo('');
    const required = requiredNextBid;
    if (Number(bidAmount) < required) { setBidError(`Bid must be at least ${required.toLocaleString()}.`); return; }
    if (auctionStatus !== 'open') { setBidError('Auction is not open.'); return; }
    setPlacing(true);
    const prevLeading = bids.find(b => b.status === 'leading') || null;
    const optimistic = { user:'me', amount:Number(bidAmount), tsIso:new Date().toISOString(), status:'leading', optimistic:true };
    setBids(prev => [{...optimistic}, ...prev.map(b => ({...b, status: b.status==='leading'?'outbid':b.status}))]);

    // Anti-snipe (UTC)
    if (endAtRef.current && Number(rules.graceSeconds) > 0 && Number(rules.extendSeconds) > 0) {
      const msLeft = endAtRef.current.getTime() - Date.now();
      if (msLeft <= Number(rules.graceSeconds) * 1000) {
        endAtRef.current = new Date(endAtRef.current.getTime() + Number(rules.extendSeconds) * 1000);
        const newIso = endAtRef.current.toISOString();
        setRules(r => ({ ...r, endAtIso: newIso }));
        setAuctionMeta(m => ({ ...m, endAtIso: newIso }));
      }
    }

    try {
      const res = await API.post('/api/auctions/current/bids', { amount:Number(bidAmount), note: bidNote });
      if (res?.data?.bid) {
        setBids(prev => { const copy=[...prev]; const i=copy.findIndex(b=>b.optimistic); if(i>=0) copy[i]=res.data.bid; return copy; });
        setBidInfo('Bid placed successfully.');
      } else {
        setBidInfo('Bid submitted.');
      }
    } catch (e) {
      setBids(prev => { const copy=prev.filter(b=>!b.optimistic); if(prevLeading) copy.unshift(prevLeading); return copy; });
      setBidError('Failed to place bid. Please try again.');
    } finally {
      setPlacing(false); setBidAmount(requiredNextBid);
    }
  };

  return (
    <section className="section admin-dark snap-like">
      {step !== 'choice' && (
        <div className="toolbar">
          <button className="btn btn-secondary" onClick={() => { setStep('choice'); setSelectedLot(null); }}>← Back to choices</button>
        </div>
      )}

      {step === 'choice' && (
        <div className="cards">
          <div className="card" onClick={() => setStep('participate')}>
            <h3>Participate in Bidding</h3>
            <p>View ongoing and upcoming biddings.</p>
          </div>
          <div className="card" onClick={() => setStep('conduct')}>
            <h3>Conduct a Bid</h3>
            <p>Configure rules and monitor bids.</p>
          </div>
        </div>
      )}

      {/* PARTICIPATE: List view */}
      {step === 'participate' && !selectedLot && (
        <div className="adm-card">
          <div className="tabs">
            <button className="tab active">All Events</button>
            <button className="tab">Today’s Disposal</button>
            <button className="tab">Today’s Procurement</button>
            <button className="tab">Upcoming Disposal</button>
          </div>

          <table className="adm-table wide">
            <thead>
              <tr>
                <th style={{width:70}}>Sl No</th>
                <th>Company / Lot</th>
                <th>Description</th>
                <th style={{width:360}}>Date & Time</th>
                <th style={{width:120}}></th>
              </tr>
            </thead>
            <tbody>
              {lots.map((l, idx) => (
                <tr key={l.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="cell-title">{l.title || '—'}</div>
                    <div className="cell-sub muted">{l.warehouseId || l.assetId || '—'} • {l.location || '—'}</div>
                  </td>
                  <td className="wrap">{l.description || '—'}</td>
                  <td>{formatRangeUTC(l.startAtIso, l.endAtIso)}</td>
                  <td>
                    <button className="btn primary" onClick={() => openLot(l)}>
                      {l.status === 'open' ? 'View live' : 'Preview'}
                    </button>
                  </td>
                </tr>
              ))}
              {!lots.length && <tr><td colSpan="5" className="muted">No events available.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* PARTICIPATE: Detail view */}
      {step === 'participate' && selectedLot && (
        <div className="adm-grid">
          <div className="adm-card">
            <div className="actions" style={{ marginBottom: 8 }}>
              <button className="btn btn-secondary" onClick={()=> setSelectedLot(null)}>← Back to list</button>
            </div>
            <h3>Participate in Bidding</h3>

            <div className="status" style={{ marginTop: 8 }}>
              <span className="stat">Title: <span className="muted">{auctionMeta.title || '—'}</span></span>
              <span className="stat">Warehouse ID: <span className="muted">{auctionMeta.warehouseId || '—'}</span></span>
              <span className="stat">Location: <span className="muted">{auctionMeta.location || '—'}</span></span>
            </div>

            <div className="status">
              <span className="stat">Starts: <span className="muted">{fmtUtcDateTime(auctionMeta.startAtIso)}</span></span>
              <span className="stat">Ends: <span className="muted">{fmtUtcDateTime(auctionMeta.endAtIso)}</span></span>
              <span className="stat">Time left: <span>{countdown}</span></span>
              <span className="stat">Highest bid: <span>{currentPrice ? currentPrice.toLocaleString() : '—'}</span></span>
              <span className="stat">Next min bid: <span>{requiredNextBid.toLocaleString()}</span></span>
            </div>

            <div className="adm-row">
              <div>
                <label>Bid amount</label>
                <input type="number" min={requiredNextBid} value={bidAmount} onChange={(e)=> setBidAmount(Number(e.target.value || 0))}/>
              </div>
              <div>
                <label>Bidder note (optional)</label>
                <input type="text" value={bidNote} onChange={(e)=> setBidNote(e.target.value)} />
              </div>
            </div>

            <div className="actions">
              <button className="btn primary" onClick={submitBid} disabled={placing || auctionStatus !== 'open'}>
                {placing ? 'Placing…' : 'Place bid'}
              </button>
            </div>

            {bidError && <p style={{ color: '#b91c1c', marginTop: 8 }}>{bidError}</p>}
            {bidInfo && <p className="muted" style={{ marginTop: 8 }}>{bidInfo}</p>}
          </div>

          <div className="adm-card">
            <h3>Recent bids</h3>
            <table className="adm-table">
              <thead>
                <tr><th>Bidder</th><th className="right">Amount</th><th>Time (UTC)</th><th>Status</th></tr>
              </thead>
              <tbody>
                {bids.map((b,i)=>(
                  <tr key={i}>
                    <td>{b.user}</td>
                    <td className="right">{Number(b.amount).toLocaleString()}</td>
                    <td>{(b.tsIso||'').replace('T',' ').slice(0,19)}</td>
                    <td><span className={`tag ${b.status==='leading'?'leading':'outbid'}`}>{b.status}</span></td>
                  </tr>
                ))}
                {!bids.length && <tr><td colSpan="4" className="muted">No bids yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONDUCT */}
      {step === 'conduct' && (
        <div className="adm-grid">
          <div className="adm-card">
            <h3>Auction settings</h3>

            <div className="adm-row">
              <div>
                <label>Start price (min bid)</label>
                <input type="number" name="minStart" min="0" value={rules.minStart} onChange={handleRuleChange}/>
              </div>
              <div>
                <label>Min increment</label>
                <input type="number" name="minIncrement" min="1" value={rules.minIncrement} onChange={handleRuleChange}/>
              </div>
            </div>

            <div className="adm-row">
              <div>
                <label>Ends at (UTC)</label>
                <input
                  type="datetime-local"
                  value={rules.endAtIso ? rules.endAtIso.slice(0,16) : ''}
                  onChange={(e)=> setEndFromInput(e.target.value)}
                />
              </div>
              <div>
                <label>Grace window (min)</label>
                <input type="number" min="0"
                  value={Math.floor(Number(rules.graceSeconds||0)/60)}
                  onChange={(e)=> setRules(r=>({...r,graceSeconds: Number(e.target.value||0)*60}))}
                />
              </div>
            </div>

            <div className="adm-row">
              <div>
                <label>Extend by (min)</label>
                <input type="number" min="0"
                  value={Math.floor(Number(rules.extendSeconds||0)/60)}
                  onChange={(e)=> setRules(r=>({...r,extendSeconds: Number(e.target.value||0)*60}))}
                />
              </div>
              <div>
                <label>Highest bid valid (sec)</label>
                <input type="number" name="highestValidSeconds" min="0" value={rules.highestValidSeconds} onChange={handleRuleChange}/>
              </div>
            </div>

            <div className="adm-row">
              <div>
                <label>Allow force close</label>
                <select value={rules.allowForceClose ? 'Yes':'No'} onChange={(e)=> setRules(r=>({...r,allowForceClose:e.target.value==='Yes'}))}>
                  <option>Yes</option><option>No</option>
                </select>
              </div>
              <div>
                <label>Reserve price (optional)</label>
                <input type="number" name="reserve" min="0" value={rules.reserve} onChange={handleRuleChange}/>
              </div>
            </div>

            <div className="actions mt8">
              <button className="btn primary" onClick={saveRules}>Save rules</button>
              <button className="btn warn" onClick={()=>setAuctionStatus('paused')}>Pause</button>
              <button className="btn success" onClick={()=>setAuctionStatus('open')}>Resume</button>
              <button className="btn danger" onClick={forceClose}>Force close</button>
            </div>

            <div className="status">
              <span className="stat">Status: <strong>{auctionStatus}</strong></span>
              <span className="stat">Ends: <span className="muted">{fmtUtcDateTime(rules.endAtIso)}</span></span>
              <span className="stat">Countdown: <span>{countdown}</span></span>
              <span className="stat">Next min bid: <span>{requiredNextBid.toLocaleString()}</span></span>
            </div>
          </div>

          <div className="adm-card">
            <h3>Bid monitor</h3>
            <div className="adm-row">
              <div>
                <label>Filter by bidder</label>
                <input type="text" value={filters.user} onChange={(e)=> setFilters(f=>({...f, user:e.target.value}))}/>
              </div>
              <div>
                <label>Min amount</label>
                <input type="number" value={filters.min} onChange={(e)=> setFilters(f=>({...f, min:e.target.value}))}/>
              </div>
            </div>
            <div className="actions">
              <button className="btn">Apply</button>
              <button className="btn" onClick={()=> setFilters({ user:'', min:'' })}>Clear</button>
              <button className="btn" onClick={()=>{
                const rows = [['bidder','amount','time_utc','status']];
                bids.forEach(b => rows.push([b.user, String(b.amount), (b.tsIso||'').replace('T',' ').slice(0,19), b.status]));
                const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
                const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'bids.csv'; a.click(); URL.revokeObjectURL(url);
              }}>Export CSV</button>
            </div>
            <table className="adm-table">
              <thead>
                <tr><th>Bidder</th><th className="right">Amount</th><th>Time (UTC)</th><th>Status</th></tr>
              </thead>
              <tbody>
                {bids.map((b, i) => (
                  <tr key={i}>
                    <td>{b.user}</td>
                    <td className="right">{Number(b.amount).toLocaleString()}</td>
                    <td>{(b.tsIso||'').replace('T',' ').slice(0,19)}</td>
                    <td><span className={`tag ${b.status==='leading'?'leading':'outbid'}`}>{b.status}</span></td>
                  </tr>
                ))}
                {!bids.length && <tr><td colSpan="4" className="muted">No bids yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default Bidding;