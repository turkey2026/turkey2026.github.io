// Overview tab — landing content after hero

function useDecisions() {
  const [overrides, setOverrides] = React.useState({});
  React.useEffect(() => {
    if (window.db) {
      const ref = window.db.ref('turkey26/decisions');
      ref.on('value', snap => setOverrides(snap.val() || {}));
      return () => ref.off();
    }
  }, []);
  const decisions = window.DECISIONS.map(d => ({
    ...d,
    status: overrides[d.id] || d.status,
  }));
  const toggle = (id, current) => {
    const next = current === 'decided' ? 'open' : 'decided';
    if (window.db) {
      window.db.ref('turkey26/decisions/' + id).set(next);
    } else {
      setOverrides(prev => ({ ...prev, [id]: next }));
    }
  };
  return [decisions, toggle];
}

function Overview({ onNav }) {
  const photos = window.PHOTOS;
  const [decisions, toggleDecision] = useDecisions();

  return (
    <div className="page">
      {/* Editorial intro */}
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container">
          <div className="ov-intro" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 80, alignItems: 'center' }}>
            <div>
              <h2 className="display" style={{ fontSize: 'clamp(48px, 6vw, 92px)' }}>
                A trip on <em>paper.</em>
              </h2>
              <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn solid" onClick={() => onNav('itinerary')}>Read the itinerary →</button>
                <button className="btn" onClick={() => onNav('spots')}>See the map</button>
              </div>
            </div>

            <div className="ov-city-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <CityCard photo={photos.bodrum1} city="Bodrum" sub="Aegean coast · 4 nights" notes="Beach clubs, gulet day, lunch at Macakizi" onClick={() => onNav('itinerary')} />
              <CityCard photo={photos.istanbul1} city="Istanbul" sub="Bosphorus · 5 nights" notes="Hagia Sophia, Bosphorus cruise, Mikla rooftop" onClick={() => onNav('itinerary')} />
            </div>
          </div>
        </div>
      </section>

      {/* The crew */}
      <section className="section">
        <div className="container">
          <SectionHeader num="01" title="The crew" />
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${window.TRIP.crew.length}, minmax(0, 1fr))`, gap: 16 }} className="crew-grid">
            {window.TRIP.crew.map(p => (
              <div key={p.name} style={{
                padding: '28px 20px',
                background: 'var(--cream)',
                border: '1px solid var(--rule)',
                position: 'relative',
                minWidth: 0,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: p.color, color: 'var(--cream)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--serif)', fontSize: 24, fontStyle: 'italic',
                  marginBottom: 16,
                }}>{p.initial}</div>
                <div className="display" style={{ fontSize: 'clamp(20px, 1.6vw, 28px)' }}>{p.name}</div>
                <div className="eyebrow" style={{ marginTop: 6, fontSize: 9 }}>{p.role}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @media (max-width: 1100px) { .crew-grid { grid-template-columns: repeat(3, 1fr) !important; } }
          @media (max-width: 640px)  { .crew-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        `}</style>
      </section>

      {/* Good to know */}
      <section className="section">
        <div className="container">
          <SectionHeader num="02" title="Good to know" lead="Practical things " />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 0, borderTop: '1px solid var(--rule)', borderLeft: '1px solid var(--rule)' }}>
            {window.GOOD_TO_KNOW.map(g => (
              <div key={g.title} style={{
                padding: '28px 24px',
                borderRight: '1px solid var(--rule)',
                borderBottom: '1px solid var(--rule)',
                background: 'var(--cream)',
              }}>
                <div className="display" style={{ fontSize: 22, marginBottom: 8 }}>{g.title}</div>
                <div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{g.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pending decisions */}
      <section className="section" style={{ background: 'var(--paper-warm)' }}>
        <div className="container">
          <SectionHeader num="03" title="Outstanding decisions" lead="What still needs a yes / no before we go." />
          <div style={{ display: 'grid', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)' }}>
            {decisions.map(d => {
              const done = d.status === 'decided';
              return (
                <div
                  key={d.id}
                  onClick={() => toggleDecision(d.id, d.status)}
                  data-cursor="hover"
                  style={{
                    background: 'var(--cream)',
                    padding: '20px 24px',
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr 2fr',
                    gap: 24,
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background 200ms',
                  }}
                  className="decision-row"
                >
                  <span className={`tag ${done ? '' : 'terra'}`}>
                    {done ? '✓ Decided' : '○ Open'}
                  </span>
                  <div className="display" style={{ fontSize: 20, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.5 : 1, transition: 'all 200ms' }}>{d.q}</div>
                  <div className="decision-note" style={{ color: 'var(--ink-mute)', fontSize: 14 }}>{d.note}</div>
                </div>
              );
            })}
          </div>
          <style>{`.decision-row:hover { background: var(--paper-warm) !important; }`}</style>
        </div>
      </section>

      {/* Quick nav strip */}
      <section className="section" style={{ paddingBottom: 120 }}>
        <div className="container">
          <SectionHeader num="04" title="Where to next" lead="Jump in." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { tab: 'itinerary', t: 'Day-by-day', d: '10 days, mapped out, hour by hour.' },
              { tab: 'lodging', t: 'Lodging', d: 'Where we sleep across three cities.' },
              { tab: 'spots', t: 'The map', d: 'Every spot, plotted on an interactive map.' },
              { tab: 'spots', t: 'Restaurants & spots', d: 'The full curated list. Sortable by city.' },
              { tab: 'expenses', t: 'Expense tracker', d: 'Who paid, who owes who, in two currencies.' },
              { tab: 'flights', t: 'Flights', d: 'JFK · IST · BJV · IST · JFK.' },
              { tab: 'packing', t: 'Packing list', d: 'Beach, balloon, mosque-ready.' },
            ].map(x => (
              <button key={x.tab} onClick={() => onNav(x.tab)} className="quick-nav" style={{
                textAlign: 'left',
                padding: '24px',
                background: 'var(--cream)',
                border: '1px solid var(--rule)',
                transition: 'background 240ms, transform 240ms, border-color 240ms',
              }}>
                <div className="display" style={{ fontSize: 24, marginBottom: 8 }}>{x.t} <span style={{ fontStyle: 'italic', color: 'var(--terra)' }}>→</span></div>
                <div style={{ fontSize: 14, color: 'var(--ink-mute)' }}>{x.d}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .quick-nav:hover { background: var(--paper-warm); border-color: var(--terra); }
      `}</style>
    </div>
  );
}

function CityCard({ photo, city, sub, notes, onClick }) {
  return (
    <div onClick={onClick} style={{
      cursor: 'inherit',
      position: 'relative',
      aspectRatio: '4 / 5',
      overflow: 'hidden',
    }} className="city-card">
      <div className="photo" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        <img src={photo} alt={city} />
      </div>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, transparent 40%, oklch(15% 0.04 30 / 0.7) 100%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        left: 20, right: 20, bottom: 20,
        color: 'var(--cream)',
      }}>
        <div className="eyebrow" style={{ color: 'oklch(95% 0.01 75 / 0.85)', marginBottom: 4 }}>{sub}</div>
        <div className="display" style={{ fontSize: 'clamp(28px, 3vw, 40px)' }}>{city}</div>
        <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85, fontStyle: 'italic', fontFamily: 'var(--serif)' }}>{notes}</div>
      </div>
    </div>
  );
}

function SectionHeader({ num, title, lead }) {
  return (
    <div className="section-header">
      <div>
        <div className="eyebrow"><span className="section-num">§ {num}</span></div>
        <h2 className="display" style={{ fontSize: 'clamp(36px, 4.5vw, 64px)', marginTop: 12 }}>{title}</h2>
      </div>
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
}

window.Overview = Overview;
window.SectionHeader = SectionHeader;
