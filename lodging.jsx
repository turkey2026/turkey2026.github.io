// Lodging tab

function Lodging() {
  // Group options by city, preserving order
  const cities = [];
  const byCity = {};
  window.LODGING.forEach(l => {
    if (!byCity[l.city]) { byCity[l.city] = []; cities.push(l.city); }
    byCity[l.city].push(l);
  });

  return (
    <div className="page">
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container">
          <SectionHeader num="III" title="Where we sleep" />

          <div style={{ display: 'grid', gap: 80 }}>
            {cities.map((city, ci) => {
              const options = byCity[city];
              return options.length > 1
                ? <LodgingGroup key={city} city={city} options={options} />
                : <LodgingArticle key={city} lodging={options[0]} flip={ci % 2 === 1} />;
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

// Side-by-side card layout for cities with multiple options
function LodgingGroup({ city, options }) {
  return (
    <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 48 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28 }} className="lodging-compare-grid">
        {options.map(l => <LodgingCard key={l.name} lodging={l} />)}
      </div>
    </div>
  );
}

function LodgingCard({ lodging: l }) {
  const statusMeta = l.status === 'decided'
    ? { label: '✓ Booked', cls: '' }
    : l.status === 'alternate'
    ? { label: '◇ Alternate', cls: 'terra' }
    : { label: '○ Deciding', cls: 'terra' };

  return (
    <div style={{
      background: 'var(--cream)',
      border: '1px solid var(--rule)',
      opacity: l.status === 'alternate' ? 0.78 : 1,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div className="photo" style={{ aspectRatio: '16/9', flexShrink: 0 }}>
        <img src={l.photo} alt={l.city} />
      </div>
      <div style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <span className="eyebrow">{l.city} · {l.dates} · {l.nights} nights</span>
          <span className={`tag ${statusMeta.cls}`}>{statusMeta.label}</span>
          {l.freeCancel && (
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'oklch(45% 0.14 145)', border: '1px solid oklch(45% 0.14 145)',
              padding: '3px 8px',
            }}>{l.freeCancel}</span>
          )}
        </div>
        <h3 className="display" style={{ fontSize: 'clamp(26px, 3vw, 36px)', lineHeight: 1.1, marginBottom: 20 }}>{l.name}</h3>
        <div className="rule" style={{ margin: '0 0 20px' }} />
        <div style={{ display: 'grid', gap: 12, flex: 1 }}>
          <Row label="Price" value={l.pricing} />
          <Row label="Notes" value={l.notes} />
        </div>
        <a href={l.link} target="_blank" rel="noreferrer" className="btn" style={{ marginTop: 24, display: 'inline-flex' }}>
          Open booking ↗
        </a>
      </div>
    </div>
  );
}

// Full-width alternating layout for solo city entries
function LodgingArticle({ lodging: l, flip }) {
  const statusMeta = l.status === 'decided'
    ? { label: '✓ Booked', cls: '' }
    : l.status === 'alternate'
    ? { label: '◇ Alternate', cls: 'terra' }
    : { label: '○ Deciding', cls: 'terra' };

  return (
    <article className="lodging-article" style={{
      display: 'grid',
      gridTemplateColumns: flip ? '1fr 1.2fr' : '1.2fr 1fr',
      gap: 48,
      alignItems: 'center',
      borderTop: '1px solid var(--rule)',
      paddingTop: 48,
      opacity: l.status === 'alternate' ? 0.78 : 1,
    }}>
      <div className="photo" style={{ aspectRatio: '4/3', order: flip ? 2 : 1 }}>
        <img src={l.photo} alt={l.city} />
      </div>
      <div className="lodging-text" style={{ order: flip ? 1 : 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <span className="eyebrow">{l.city} · {l.dates} · {l.nights} nights</span>
          <span className={`tag ${statusMeta.cls}`}>{statusMeta.label}</span>
          {l.freeCancel && (
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'oklch(45% 0.14 145)', border: '1px solid oklch(45% 0.14 145)',
              padding: '3px 8px',
            }}>{l.freeCancel}</span>
          )}
        </div>
        <h3 className="display" style={{ fontSize: 'clamp(34px, 4.4vw, 56px)', lineHeight: 1.05 }}>{l.name}</h3>
        <div className="rule" style={{ margin: '24px 0' }} />
        <div style={{ display: 'grid', gap: 16 }}>
          <Row label="Price" value={l.pricing} />
          <Row label="Notes" value={l.notes} />
        </div>
        <a href={l.link} target="_blank" rel="noreferrer" className="btn" style={{ marginTop: 24, display: 'inline-flex' }}>
          Open booking ↗
        </a>
      </div>
    </article>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 24, paddingBottom: 16, borderBottom: '1px solid var(--rule-soft)' }}>
      <div className="eyebrow">{label}</div>
      <div style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}

window.Lodging = Lodging;
