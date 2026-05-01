// Itinerary — overview list + detail panel

const { useState: useStateI } = React;

function Itinerary() {
  const [openDay, setOpenDay] = useStateI(null);
  const days = window.ITINERARY;

  return (
    <div className="page">
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container">
          <SectionHeader num="II" title="The itinerary" lead="Ten days, two cities. Click any day for the hour-by-hour." />

          {/* Timeline strip */}
          <div className="timeline-strip" style={{
            display: 'flex',
            gap: 0,
            marginBottom: 56,
            border: '1px solid var(--rule)',
            background: 'var(--cream)',
            overflow: 'hidden',
          }}>
            {days.map((d, i) => (
              <div key={d.day} className="timeline-cell" onClick={() => setOpenDay(d)} style={{
                flex: 1,
                padding: '14px 8px',
                borderLeft: i === 0 ? 'none' : '1px solid var(--rule)',
                textAlign: 'center',
                background: i < 5 ? 'oklch(94% 0.04 60)' : 'oklch(93% 0.03 220)',
                cursor: 'pointer',
                transition: 'background 180ms',
              }}>
                <div className="eyebrow" style={{ fontSize: 9 }}>{d.label}</div>
                <div className="timeline-arc" style={{ fontFamily: 'var(--serif)', fontSize: 16, fontStyle: 'italic', marginTop: 4 }}>{d.arc}</div>
              </div>
            ))}
          </div>

          {/* Day cards */}
          <div style={{ display: 'grid', gap: 0, borderTop: '1px solid var(--rule)' }}>
            {days.map((d, i) => (
              <DayCard key={d.day} day={d} index={i} onOpen={() => setOpenDay(d)} />
            ))}
          </div>
        </div>
      </section>

      {openDay && <DayDetail day={openDay} onClose={() => setOpenDay(null)} onLink={(filter) => {
        setOpenDay(null);
        window.dispatchEvent(new CustomEvent('trip:gotoSpots', { detail: filter }));
      }} />}
    </div>
  );
}

function DayCard({ day, index, onOpen }) {
  const [hover, setHover] = useStateI(false);
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="day-card"
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 200px 1fr 240px 80px',
        gap: 32,
        padding: '32px 24px',
        borderBottom: '1px solid var(--rule)',
        alignItems: 'center',
        background: hover ? 'var(--paper-warm)' : 'transparent',
        transition: 'background 240ms, padding 240ms',
        paddingLeft: hover ? 36 : 24,
      }}
    >
      <div>
        <div className="eyebrow">{day.label}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, marginTop: 6, color: 'var(--ink-mute)' }}>{day.date}</div>
      </div>
      <div className="display day-card-city" style={{ fontSize: 26, fontStyle: 'italic', fontWeight: 300 }}>{day.city}</div>
      <div className="display" style={{ fontSize: 22, lineHeight: 1.25, fontWeight: 300, fontVariationSettings: '"opsz" 80' }}>
        {day.headline}
      </div>
      <div className="photo day-card-photo" style={{ aspectRatio: '16/9', width: '100%' }}>
        <img src={day.photo} alt={day.city} />
      </div>
      <div style={{ textAlign: 'right', fontFamily: 'var(--serif)', fontSize: 22, fontStyle: 'italic', color: hover ? 'var(--terra)' : 'var(--ink-mute)', transition: 'color 240ms, transform 240ms', transform: hover ? 'translateX(8px)' : 'none' }}>
          →
      </div>
    </div>
  );
}

function DayDetail({ day, onClose, onLink }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'oklch(15% 0.03 40 / 0.55)',
      backdropFilter: 'blur(6px)',
      animation: 'fadeIn 320ms ease',
      overflowY: 'auto',
    }}
    onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} className="day-detail-inner" style={{
        maxWidth: 980,
        margin: '60px auto',
        background: 'var(--paper)',
        animation: 'slideUp 420ms cubic-bezier(.2,.7,.2,1)',
        boxShadow: 'var(--shadow-deep)',
      }}>
        {/* Cover */}
        <div style={{ position: 'relative', aspectRatio: '16/9' }}>
          <div className="photo" style={{ position: 'absolute', inset: 0 }}>
            <img src={day.photo} alt={day.city} />
          </div>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 50%, oklch(15% 0.04 30 / 0.7))',
          }} />
          <button onClick={onClose} style={{
            position: 'absolute',
            top: 20, right: 20,
            width: 40, height: 40,
            border: '1px solid var(--cream)',
            background: 'oklch(20% 0.04 40 / 0.4)',
            color: 'var(--cream)',
            backdropFilter: 'blur(8px)',
            fontSize: 18,
          }}>×</button>
          <div style={{
            position: 'absolute', left: 36, right: 36, bottom: 28,
            color: 'var(--cream)',
          }}>
            <div className="eyebrow" style={{ color: 'oklch(95% 0.01 75 / 0.85)' }}>{day.label} · {day.date}</div>
            <div className="display" style={{ fontSize: 'clamp(36px, 5vw, 56px)', marginTop: 8 }}>{day.headline}</div>
          </div>
        </div>

        <div style={{ padding: 48 }}>
          <div className="day-detail-body" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 48 }}>
            <div>
              <div className="eyebrow">Arc</div>
              <div className="display" style={{ fontSize: 32, fontStyle: 'italic', marginTop: 8 }}>{day.arc}</div>
              <div className="rule" style={{ margin: '24px 0' }} />
              <div className="eyebrow">In Brief</div>
              <p style={{ marginTop: 12, fontSize: 16, lineHeight: 1.6, color: 'var(--ink-soft)' }}>{day.summary}</p>
            </div>

            <div>
              <div className="eyebrow" style={{ marginBottom: 20 }}>The Schedule</div>
              <div style={{ display: 'grid', gap: 0 }}>
                {day.blocks.map((b, i) => <Block key={i} block={b} onLink={onLink} />)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

function Block({ block, onLink }) {
  const kindColor = {
    travel: 'var(--sea)',
    food: 'var(--terra)',
    activity: 'var(--ochre-deep)',
    stay: 'var(--olive)',
  }[block.kind] || 'var(--ink-mute)';

  const clickable = !!block.linkTo;

  return (
    <div
      onClick={(e) => { if (clickable) { e.stopPropagation(); onLink && onLink(block.linkTo); } }}
      style={{
        display: 'grid',
        gridTemplateColumns: '110px 1fr',
        gap: 20,
        padding: '18px 0',
        borderBottom: '1px solid var(--rule-soft)',
        cursor: clickable ? 'inherit' : 'default',
      }}
      className={clickable ? 'block-link' : ''}
    >
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: kindColor,
        paddingTop: 4,
      }}>{block.time}</div>
      <div>
        <div className="display" style={{ fontSize: 20, lineHeight: 1.2, display: 'flex', alignItems: 'baseline', gap: 10 }}>
          {block.title}
          {clickable && <span style={{ fontSize: 14, color: 'var(--terra)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>see options →</span>}
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink-mute)', marginTop: 4 }}>{block.note}</div>
      </div>
    </div>
  );
}

const _itineraryStyles = `
  .timeline-cell:hover { filter: brightness(0.95); }
  @media (max-width: 820px) {
    .timeline-arc { font-size: 11px !important; line-height: 1.3; word-break: break-word; }
    .timeline-cell { padding: 10px 6px !important; }
  }
  @media (max-width: 820px) {
    .block-link:hover { background: var(--paper-warm); }
  }
`;
if (!document.getElementById('itinerary-styles')) {
  const s = document.createElement('style');
  s.id = 'itinerary-styles';
  s.textContent = _itineraryStyles;
  document.head.appendChild(s);
}

window.Itinerary = Itinerary;
