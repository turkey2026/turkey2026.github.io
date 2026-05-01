// Spots / Restaurants curated tab + Packing + Flights

const { useState: useStateS, useEffect: useEffectS } = React;

function Spots({ initialFilter }) {
  const [city, setCity] = useStateS(initialFilter?.city || 'All');
  const [cat, setCat] = useStateS(initialFilter?.category || 'All');
  const [active, setActive] = useStateS(null);
  const [customSpots, setCustomSpots] = useStateS([]);

  useEffectS(() => {
    if (window.db) {
      const ref = window.db.ref('turkey26/custom_spots');
      ref.on('value', snap => {
        const val = snap.val();
        setCustomSpots(val ? Object.entries(val).map(([_key, s]) => ({ ...s, _key, _custom: true })) : []);
      });
      return () => ref.off();
    } else {
      try { setCustomSpots(JSON.parse(localStorage.getItem('turkey26_custom_spots') || '[]')); } catch {}
    }
  }, []);

  const addCustomSpot = (spot) => {
    if (window.db) {
      window.db.ref('turkey26/custom_spots').push(spot);
    } else {
      const updated = [...customSpots, { ...spot, _key: Date.now().toString(), _custom: true }];
      setCustomSpots(updated);
      localStorage.setItem('turkey26_custom_spots', JSON.stringify(updated));
    }
  };

  const allSpots = [...window.SPOTS, ...customSpots];
  const cities = ['All', ...new Set(allSpots.map(s => s.city))];
  const cats = ['All', ...new Set(allSpots.map(s => s.category))];
  let filtered = allSpots;
  if (city !== 'All') filtered = filtered.filter(s => s.city === city);
  if (cat !== 'All') filtered = filtered.filter(s => s.category === cat);

  return (
    <div className="page">
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container">
          <SectionHeader num="VI" title="Restaurants & spots" lead="Every recommendation, sorted. Tap any to open in Google Maps." />

          <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
            <FilterGroup label="City" value={city} options={cities} onChange={setCity} />
            <FilterGroup label="Category" value={cat} options={cats} onChange={setCat} />
            <div style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)' }}>
              {filtered.length} of {allSpots.length}
            </div>
          </div>

          {/* Map — above tiles */}
          <div id="spots-atlas">
            <window.SpotsMap spots={filtered} activeName={active} onActivate={setActive} />
          </div>

          {/* Add a spot */}
          <AddSpotForm onAdd={addCustomSpot} />

          {/* Spot tiles grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 0, borderTop: '1px solid var(--rule)', borderLeft: '1px solid var(--rule)', marginTop: 40 }}>
            {filtered.map((s, i) => (
              <div key={s._key || s.name || i} className="spot-tile" onClick={() => setActive(s.name)} style={{
                padding: '24px 22px',
                borderRight: '1px solid var(--rule)',
                borderBottom: '1px solid var(--rule)',
                background: active === s.name ? 'var(--paper-warm)' : 'var(--cream)',
                display: 'block',
                position: 'relative',
                transition: 'background 240ms',
                minHeight: 180,
                cursor: 'pointer',
                outline: active === s.name ? '2px solid var(--terra)' : 'none',
                outlineOffset: -2,
              }}>
                <div className="eyebrow" style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: categoryColor(s.category), fontSize: 12 }}>{categoryGlyph(s.category)}</span>
                    <span>{s.city} · {s.category}</span>
                  </span>
                  <span style={{ color: s._custom ? 'var(--sea)' : priorityColor2(s.priority) }}>
                    {s._custom ? '+ Added' : priorityDot(s.priority)}
                  </span>
                </div>
                <div className="display" style={{ fontSize: 24, lineHeight: 1.15, marginBottom: 10 }}>{s.name}</div>
                <div style={{ fontSize: 13.5, color: 'var(--ink-mute)', lineHeight: 1.55 }}>{s.desc}</div>
                <div style={{ position: 'absolute', bottom: 18, right: 22, display: 'flex', gap: 14, alignItems: 'center' }}>
                  <button onClick={(e) => { e.stopPropagation(); setActive(s.name); document.getElementById('spots-atlas')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }}
                    style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-soft)', textDecoration: 'underline', textUnderlineOffset: 4 }}
                    title="Show on map">map ↑</button>
                  {s.maps && <a href={s.maps} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--terra)', fontStyle: 'italic' }}>↗</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .spot-tile:hover { background: var(--paper-warm) !important; }
      `}</style>
    </div>
  );
}

function AddSpotForm({ onAdd }) {
  const blank = { name: '', city: 'Bodrum', category: 'Food', desc: '', maps: '' };
  const [isOpen, setIsOpen] = useStateS(false);
  const [form, setForm] = useStateS(blank);
  const [flash, setFlash] = useStateS(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    onAdd({ ...form, priority: 'med' });
    setForm(blank);
    setFlash(true);
    setTimeout(() => { setFlash(false); setIsOpen(false); }, 1200);
  };

  if (!isOpen) {
    return (
      <div style={{ marginTop: 32 }}>
        <button onClick={() => setIsOpen(true)} style={{
          width: '100%',
          padding: '18px',
          border: '1px dashed var(--rule)',
          background: 'transparent',
          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--ink-mute)',
          transition: 'border-color 200ms, color 200ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--terra)'; e.currentTarget.style.color = 'var(--terra)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--ink-mute)'; }}>
          + Suggest a spot
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{
      marginTop: 32,
      background: flash ? 'oklch(95% 0.06 145)' : 'var(--cream)',
      border: '1px solid var(--rule)',
      padding: 24,
      display: 'grid',
      gap: 14,
      transition: 'background 320ms',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="display" style={{ fontSize: 22 }}><em>Suggest</em> a spot</div>
        <button type="button" onClick={() => { setForm(blank); setIsOpen(false); }} style={{ color: 'var(--ink-mute)', fontSize: 22 }}>×</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="iax-row">
        <div style={{ gridColumn: '1 / -1' }}>
          <span className="label">Name</span>
          <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Macakizi Beach Club" required />
        </div>
        <div>
          <span className="label">City</span>
          <select className="select" value={form.city} onChange={e => setForm({...form, city: e.target.value})}>
            <option>Bodrum</option>
            <option>Istanbul</option>
          </select>
        </div>
        <div>
          <span className="label">Category</span>
          <select className="select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            {['Food','Bar','Beach Club','Sight','Activity','Shop','Neighborhood'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <span className="label">Description</span>
          <input className="input" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="What makes it worth going?" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <span className="label">Google Maps link (optional)</span>
          <input className="input" value={form.maps} onChange={e => setForm({...form, maps: e.target.value})} placeholder="https://maps.google.com/..." />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
        {flash && <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'oklch(45% 0.12 145)' }}>Added ✓</span>}
        <button type="button" className="btn" onClick={() => { setForm(blank); setIsOpen(false); }}>Cancel</button>
        <button type="submit" className="btn solid" disabled={!form.name}>Add spot</button>
      </div>
    </form>
  );
}

function FilterGroup({ label, value, options, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span className="eyebrow">{label}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)} style={{
            padding: '8px 14px',
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
            background: value === o ? 'var(--ink)' : 'transparent',
            color: value === o ? 'var(--cream)' : 'var(--ink-soft)',
            border: '1px solid ' + (value === o ? 'var(--ink)' : 'var(--rule)'),
            transition: 'all 200ms',
          }}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function priorityColor2(p) {
  return { must: 'var(--terra)', high: 'var(--ochre-deep)', med: 'var(--ink-mute)', low: 'var(--ink-mute)' }[p];
}
function priorityDot(p) {
  return { must: '★ MUST', high: '◆ HIGH', med: '○ MED', low: '○' }[p];
}

function categoryGlyph(cat) {
  return ({
    'Beach Club': '~',
    'Food': '◉',
    'Bar': '◇',
    'Sight': '△',
    'Shop': '□',
    'Activity': '◎',
    'Neighborhood': '⌒',
  })[cat] || '·';
}

function categoryColor(cat) {
  return ({
    'Beach Club': 'var(--sea)',
    'Food': 'var(--terra)',
    'Bar': 'var(--plum)',
    'Sight': 'var(--ochre-deep)',
    'Shop': 'var(--olive)',
    'Activity': 'var(--ochre-deep)',
    'Neighborhood': 'var(--ink-soft)',
  })[cat] || 'var(--ink-mute)';
}

// — Flights —

function Flights() {
  return (
    <div className="page">
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container">
          <SectionHeader num="VII" title="The flights" lead="Five legs across nine days. Bookings live here." />

          <div style={{ background: 'var(--cream)', border: '1px solid var(--rule)' }}>
            <div className="flight-header" style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr 1fr 120px 140px 100px',
              gap: 16,
              padding: '14px 24px',
              background: 'var(--paper-warm)',
              borderBottom: '1px solid var(--rule)',
              fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-mute)',
            }}>
              <div>Leg</div><div>Route</div><div>Date · Time</div><div>Carrier</div><div>Booking</div><div>Who</div>
            </div>
            {window.FLIGHTS.map((f, i) => (
              <div key={i} className="flight-row" style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr 1fr 120px 140px 100px',
                gap: 16,
                padding: '20px 24px',
                borderBottom: i === window.FLIGHTS.length - 1 ? 'none' : '1px solid var(--rule-soft)',
                alignItems: 'center',
              }}>
                <div className="display" style={{ fontSize: 18, fontStyle: 'italic' }}>{f.leg}</div>
                <div className="flight-route" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="display" style={{ fontSize: 28 }}>{f.from}</div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ height: 1, background: 'var(--rule)', position: 'relative' }}>
                      <span style={{ position: 'absolute', right: -1, top: -4, fontSize: 10, color: 'var(--terra)' }}>✈</span>
                    </div>
                  </div>
                  <div className="display" style={{ fontSize: 28 }}>{f.to}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{f.date}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 2 }}>{f.depart}{f.arrive !== '—' ? ` → ${f.arrive}` : ''}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{f.carrier}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--terra)' }}>{f.booking}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)', textTransform: 'capitalize' }}>{f.who}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// — Packing —

function Packing() {
  const [checked, setChecked] = useStateS({});

  useEffectS(() => {
    if (window.db) {
      const ref = window.db.ref('turkey26/packing');
      ref.on('value', snap => setChecked(snap.val() || {}));
      return () => ref.off();
    } else {
      try { setChecked(JSON.parse(localStorage.getItem('turkey26_packing') || '{}')); } catch {}
    }
  }, []);

  const toggle = (k) => {
    const next = !checked[k];
    if (window.db) {
      window.db.ref('turkey26/packing/' + k.replace(/[.#$[\]/]/g, '_')).set(next);
    } else {
      const updated = { ...checked, [k]: next };
      setChecked(updated);
      localStorage.setItem('turkey26_packing', JSON.stringify(updated));
    }
  };

  const resetAll = () => {
    if (window.db) {
      window.db.ref('turkey26/packing').remove();
    } else {
      setChecked({});
      localStorage.removeItem('turkey26_packing');
    }
  };

  const totalItems = window.PACKING.reduce((n, c) => n + c.items.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="page">
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container">
          <SectionHeader num="VIII" title="Packing list" lead="Beach, balloon, mosque-ready. Tick as you pack." />

          <div className="packing-header" style={{ marginBottom: 32, padding: '20px 24px', background: 'var(--paper-warm)', border: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="display" style={{ fontSize: 22, fontStyle: 'italic' }}>{checkedCount} / {totalItems} packed</div>
            <div style={{ flex: 1, margin: '0 32px', height: 4, background: 'var(--rule)', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(checkedCount / totalItems) * 100}%`, background: 'var(--terra)', transition: 'width 320ms' }} />
            </div>
            <button className="btn" onClick={resetAll}>Reset</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {window.PACKING.map(c => (
              <div key={c.cat} style={{ background: 'var(--cream)', border: '1px solid var(--rule)', padding: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 16 }}>{c.cat}</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {c.items.map(item => {
                    const k = c.cat + '::' + item;
                    const on = !!checked[k];
                    return (
                      <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'inherit', userSelect: 'none' }}>
                        <span style={{
                          width: 18, height: 18, border: '1.5px solid ' + (on ? 'var(--terra)' : 'var(--rule)'),
                          background: on ? 'var(--terra)' : 'transparent',
                          color: 'var(--cream)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, transition: 'all 180ms',
                        }}>{on ? '✓' : ''}</span>
                        <input type="checkbox" checked={on} onChange={() => toggle(k)} style={{ display: 'none' }} />
                        <span style={{
                          fontSize: 14,
                          textDecoration: on ? 'line-through' : 'none',
                          color: on ? 'var(--ink-mute)' : 'var(--ink)',
                          transition: 'all 180ms',
                        }}>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

window.Spots = Spots;
window.Flights = Flights;
window.Packing = Packing;
