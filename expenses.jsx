// Expenses tab — Firebase-backed (falls back to localStorage)

const { useState: useStateE, useEffect: useEffectE } = React;

const STORAGE_KEY = 'turkey26_expenses_v3';
const RATES = { USD: 1, TRY: 39.5 }; // approx Aug 2026 estimate

function loadExpensesLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return seedExpenses();
}

function seedExpenses() {
  return [
    { id: 1, date: '2026-04-15', payer: 'Andie', desc: 'Bodrum Airbnb deposit', amount: 1252.20, currency: 'USD', category: 'Lodging', splitWith: ['Jonah','Ryan','Soren','Vicky','Sam','Andie'], link: 'https://www.airbnb.com/', notes: 'First half of stay (4 nights)' },
    { id: 3, date: '2026-08-22', payer: 'Andie',  desc: 'Scorpios Bodrum table', amount: 600.00, currency: 'USD', category: 'Activity', splitWith: ['Jonah','Ryan','Soren','Vicky','Sam','Andie'], link: 'https://maps.google.com/?q=Scorpios+Bodrum', notes: 'Sunset DJ ritual · table reservation' },
  ];
}

function Expenses() {
  const [items, setItems] = useStateE([]);
  const [currency, setCurrency] = useStateE('USD');

  useEffectE(() => {
    if (window.db) {
      const ref = window.db.ref('turkey26/expenses');
      let seeded = false;
      ref.on('value', snap => {
        const val = snap.val();
        if (!val && !seeded) {
          seeded = true;
          seedExpenses().forEach(e => ref.push(e));
        } else if (val) {
          setItems(Object.entries(val).map(([_key, item]) => ({ ...item, _key })));
        }
      });
      return () => ref.off();
    } else {
      const local = loadExpensesLocal();
      setItems(local);
    }
  }, []);

  useEffectE(() => {
    if (!window.db) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (expense) => {
    const item = { ...expense, id: Date.now() };
    if (window.db) {
      window.db.ref('turkey26/expenses').push(item);
    } else {
      setItems(prev => [...prev, item]);
    }
  };

  const deleteItem = (item) => {
    if (window.db) {
      window.db.ref('turkey26/expenses/' + item._key).remove();
    } else {
      setItems(prev => prev.filter(x => x.id !== item.id));
    }
  };

  const total = items.reduce((sum, i) => sum + toCurrency(i.amount, i.currency, currency), 0);
  const balances = computeBalances(items, currency);
  const settlements = computeSettlements(balances);

  return (
    <div className="page">
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container">
          <SectionHeader num="V" title="The split tab" lead="Who paid for what. Who owes who. Updated as you go." />

          {/* Inline add expense — at the top */}
          <InlineAddExpense onAdd={addItem} />

          <div className="expense-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 48, marginTop: 48 }}>
            <Stat label="Spent so far" value={fmt(total, currency)} sub={`${items.length} transactions`} />
            <Stat label="Per person" value={fmt(total / window.TRIP.crew.length, currency)} sub="6 travelers, even split" />
            <Stat label="Currency" value={currency} sub={
              <button onClick={() => setCurrency(currency === 'USD' ? 'TRY' : 'USD')} className="btn" style={{ marginTop: 4, padding: '6px 12px' }}>
                Switch to {currency === 'USD' ? 'TRY' : 'USD'}
              </button>
            } />
          </div>

          {/* Balances */}
          <div style={{ marginBottom: 56 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Running Balances</div>
            <div className="balances-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)' }}>
              {window.TRIP.crew.map(p => {
                const bal = balances[p.name] || 0;
                const positive = bal > 0.01;
                const negative = bal < -0.01;
                return (
                  <div key={p.name} style={{ background: 'var(--cream)', padding: '20px 18px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: p.color, color: 'var(--cream)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14,
                      }}>{p.initial}</div>
                      <div className="display" style={{ fontSize: 18 }}>{p.name}</div>
                    </div>
                    <div className="display" style={{
                      fontSize: 24,
                      color: positive ? 'oklch(45% 0.12 145)' : negative ? 'var(--terra)' : 'var(--ink-mute)',
                    }}>
                      {positive ? '+' : ''}{fmt(bal, currency)}
                    </div>
                    <div className="eyebrow" style={{ marginTop: 4, fontSize: 9 }}>
                      {positive ? 'Owed back' : negative ? 'Owes group' : 'Even'}
                    </div>
                  </div>
                );
              })}
            </div>

            {settlements.length > 0 && (
              <div style={{ marginTop: 24, padding: 24, background: 'var(--paper-warm)', border: '1px solid var(--rule)' }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>To settle up</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {settlements.map((s, i) => (
                    <div key={i} style={{ fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic' }}>
                      <strong style={{ fontStyle: 'normal', fontWeight: 500 }}>{s.from}</strong> → <strong style={{ fontStyle: 'normal', fontWeight: 500 }}>{s.to}</strong>{' '}
                      <span style={{ color: 'var(--terra)' }}>{fmt(s.amount, currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Transactions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 0 }}>
            <div className="eyebrow">Transactions ({items.length})</div>
          </div>

          <div style={{ display: 'grid', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)' }}>
            <div className="expense-header-row" style={{
              display: 'grid',
              gridTemplateColumns: '110px 1fr 130px 130px 1fr 60px',
              gap: 16,
              padding: '14px 20px',
              background: 'var(--paper-warm)',
              fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-mute)',
            }}>
              <div>Date</div>
              <div>Description</div>
              <div>Payer</div>
              <div>Amount</div>
              <div>Split with</div>
              <div></div>
            </div>
            {items.map(i => (
              <ExpenseRow key={i._key || i.id} item={i} currency={currency} onDelete={() => deleteItem(i)} />
            ))}
            {items.length === 0 && (
              <div style={{ background: 'var(--cream)', padding: 40, textAlign: 'center', color: 'var(--ink-mute)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
                No expenses yet. Add the first one.
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

function InlineAddExpense({ onAdd }) {
  const today = new Date().toISOString().slice(0,10);
  const blank = {
    date: today, desc: '', payer: 'Jonah', amount: '', currency: 'USD',
    category: 'Food', splitWith: window.TRIP.crew.map(c => c.name), notes: '',
  };
  const [form, setForm] = useStateE(blank);
  const [flash, setFlash] = useStateE(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.desc || !form.amount) return;
    onAdd({ ...form, amount: parseFloat(form.amount), link: '' });
    setForm({ ...blank, payer: form.payer });
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
  };

  const toggleSplit = (name) => {
    setForm({
      ...form,
      splitWith: form.splitWith.includes(name) ? form.splitWith.filter(n => n !== name) : [...form.splitWith, name],
    });
  };

  const allOn = form.splitWith.length === window.TRIP.crew.length;
  const setAll = (on) => setForm({ ...form, splitWith: on ? window.TRIP.crew.map(c => c.name) : [] });

  return (
    <form onSubmit={submit} style={{
      background: 'var(--cream)',
      border: '1px solid var(--rule)',
      padding: 24,
      display: 'grid',
      gap: 16,
      transition: 'background 320ms',
      backgroundColor: flash ? 'oklch(95% 0.06 145)' : 'var(--cream)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div className="display" style={{ fontSize: 24 }}><em>Log</em> an expense</div>
        <div className="eyebrow" style={{ color: 'var(--ink-mute)' }}>Saved locally on your device</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)', gap: 12 }} className="iax-row">
        <div>
          <span className="label">What</span>
          <input className="input" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="Macakizi lunch" required />
        </div>
        <div>
          <span className="label">Amount</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="input" type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" required />
            <select className="select" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} style={{ width: 80 }}>
              <option>USD</option>
              <option>TRY</option>
            </select>
          </div>
        </div>
        <div>
          <span className="label">Category</span>
          <select className="select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            {['Food','Lodging','Transport','Activity','Drinks','Shopping','Other'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr)', gap: 12 }} className="iax-row">
        <div>
          <span className="label">Paid by</span>
          <select className="select" value={form.payer} onChange={e => setForm({...form, payer: e.target.value})}>
            {window.TRIP.crew.map(c => <option key={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <span className="label">Date</span>
          <input className="input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
        </div>
        <div>
          <span className="label">Notes (optional)</span>
          <input className="input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="anything to remember" />
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="label" style={{ marginBottom: 0 }}>Split with</span>
          <button type="button" onClick={() => setAll(!allOn)} style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--terra)' }}>
            {allOn ? 'Clear all' : 'Select all'}
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {window.TRIP.crew.map(c => {
            const on = form.splitWith.includes(c.name);
            return (
              <label key={c.name} onClick={(e) => { e.preventDefault(); toggleSplit(c.name); }} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 14px',
                background: on ? 'var(--ink)' : 'transparent',
                color: on ? 'var(--cream)' : 'var(--ink)',
                border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
                fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
                cursor: 'pointer', userSelect: 'none',
                transition: 'all 180ms',
              }}>
                <span style={{
                  width: 14, height: 14, border: '1.5px solid ' + (on ? 'var(--cream)' : 'var(--rule)'),
                  background: on ? 'var(--cream)' : 'transparent',
                  color: 'var(--ink)', fontSize: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{on ? '✓' : ''}</span>
                {c.name}
              </label>
            );
          })}
        </div>
        {form.splitWith.length > 0 && (
          <div style={{ marginTop: 8, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--ink-mute)' }}>
            split {form.splitWith.length} ways · {form.amount && form.splitWith.length ? fmt(parseFloat(form.amount) / form.splitWith.length, form.currency) : '—'} each
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
        {flash && <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'oklch(45% 0.12 145)' }}>Added ✓</span>}
        <button type="button" className="btn" onClick={() => setForm(blank)}>Reset</button>
        <button type="submit" className="btn solid" disabled={!form.desc || !form.amount || form.splitWith.length === 0}>Add expense</button>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .iax-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </form>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div style={{ padding: 28, background: 'var(--cream)', border: '1px solid var(--rule)' }}>
      <div className="eyebrow">{label}</div>
      <div className="display" style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontStyle: 'italic', marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function ExpenseRow({ item, currency, onDelete }) {
  const display = toCurrency(item.amount, item.currency, currency);
  return (
    <div className="expense-row" style={{
      display: 'grid',
      gridTemplateColumns: '110px 1fr 130px 130px 1fr 60px',
      gap: 16,
      padding: '16px 20px',
      background: 'var(--cream)',
      alignItems: 'center',
    }}>
      <div className="expense-row-date" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)' }}>{item.date}</div>
      <div>
        <div className="display" style={{ fontSize: 17 }}>{item.desc}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>
          <span className="tag" style={{ padding: '1px 8px', fontSize: 9 }}>{item.category}</span>
          {item.notes && <span style={{ marginLeft: 8 }}>· {item.notes}</span>}
          {item.link && <a href={item.link} target="_blank" rel="noreferrer" style={{ marginLeft: 8, color: 'var(--terra)' }}>↗ link</a>}
        </div>
      </div>
      <div className="expense-row-payer" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16 }}>{item.payer}</div>
      <div className="expense-row-amount" style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{fmt(display, currency)}</div>
      <div className="expense-row-split" style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{item.splitWith.join(' · ')}</div>
      <button onClick={onDelete} style={{ color: 'var(--ink-mute)', fontSize: 18 }}>×</button>
    </div>
  );
}

function AddExpense({ onClose, onAdd }) {
  const today = new Date().toISOString().slice(0,10);
  const [form, setForm] = useStateE({
    date: today, desc: '', payer: 'Jonah', amount: '', currency: 'USD',
    category: 'Food', splitWith: window.TRIP.crew.map(c => c.name), link: '', notes: ''
  });
  const submit = (e) => {
    e.preventDefault();
    if (!form.desc || !form.amount) return;
    onAdd({ ...form, amount: parseFloat(form.amount) });
  };
  const toggleSplit = (name) => {
    setForm({
      ...form,
      splitWith: form.splitWith.includes(name) ? form.splitWith.filter(n => n !== name) : [...form.splitWith, name],
    });
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'oklch(15% 0.03 40 / 0.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'fadeIn 240ms ease',
    }}>
      <form onClick={e => e.stopPropagation()} onSubmit={submit} style={{
        background: 'var(--paper)', maxWidth: 720, width: '100%',
        padding: 40, boxShadow: 'var(--shadow-deep)',
        animation: 'slideUp 320ms cubic-bezier(.2,.7,.2,1)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h3 className="display" style={{ fontSize: 36 }}><em>Add</em> an expense</h3>
          <button type="button" onClick={onClose} style={{ fontSize: 28, color: 'var(--ink-mute)' }}>×</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Date"><input className="input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></Field>
          <Field label="Category">
            <select className="select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {['Food','Lodging','Transport','Activity','Drinks','Shopping','Other'].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Description" full><input className="input" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="Macakizi lunch" /></Field>
          <Field label="Paid by">
            <select className="select" value={form.payer} onChange={e => setForm({...form, payer: e.target.value})}>
              {window.TRIP.crew.map(c => <option key={c.name}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Amount">
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" />
              <select className="select" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} style={{ width: 90 }}>
                <option>USD</option>
                <option>TRY</option>
              </select>
            </div>
          </Field>
          <Field label="Link (optional)" full><input className="input" value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder="Receipt or booking URL" /></Field>
          <Field label="Notes (optional)" full><input className="input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="anything to remember" /></Field>
          <Field label="Split with" full>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {window.TRIP.crew.map(c => {
                const on = form.splitWith.includes(c.name);
                return (
                  <button key={c.name} type="button" onClick={() => toggleSplit(c.name)} className="btn" style={{
                    padding: '8px 14px',
                    background: on ? 'var(--ink)' : 'transparent',
                    color: on ? 'var(--cream)' : 'var(--ink)',
                    borderColor: on ? 'var(--ink)' : 'var(--rule)',
                  }}>{c.name}</button>
                );
              })}
            </div>
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'flex-end' }}>
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn solid">Save</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, full, children }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <span className="label">{label}</span>
      {children}
    </div>
  );
}

function toCurrency(amount, from, to) {
  if (from === to) return amount;
  const usd = amount / RATES[from];
  return usd * RATES[to];
}

function fmt(n, currency) {
  const sym = currency === 'USD' ? '$' : '₺';
  const abs = Math.abs(n);
  return (n < 0 ? '-' : '') + sym + abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function computeBalances(items, currency) {
  const bal = {};
  window.TRIP.crew.forEach(c => bal[c.name] = 0);
  items.forEach(i => {
    const amt = toCurrency(i.amount, i.currency, currency);
    const share = amt / (i.splitWith.length || 1);
    if (bal[i.payer] !== undefined) bal[i.payer] += amt;
    i.splitWith.forEach(n => {
      if (bal[n] !== undefined) bal[n] -= share;
    });
  });
  return bal;
}

function computeSettlements(balances) {
  const debtors = [];
  const creditors = [];
  Object.entries(balances).forEach(([name, val]) => {
    if (val < -0.01) debtors.push({ name, val: -val });
    else if (val > 0.01) creditors.push({ name, val });
  });
  debtors.sort((a, b) => b.val - a.val);
  creditors.sort((a, b) => b.val - a.val);
  const out = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].val, creditors[j].val);
    out.push({ from: debtors[i].name, to: creditors[j].name, amount: pay });
    debtors[i].val -= pay;
    creditors[j].val -= pay;
    if (debtors[i].val < 0.01) i++;
    if (creditors[j].val < 0.01) j++;
  }
  return out;
}

window.Expenses = Expenses;
