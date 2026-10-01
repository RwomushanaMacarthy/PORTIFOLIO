/**
 * Reusable dashboard field components.
 * Every one of them writes straight into the content draft via update(path, value),
 * where path is an array like ['profile','name'] or ['projects','items',0,'title'].
 */
import { useState } from 'react';
import { useContent } from '../context/ContentContext.jsx';

/* --------------------------------------------------------------- primitives */

export function Field({ label, value = '', onChange, hint, textarea = false, rows = 4, type = 'text', placeholder = '' }) {
  return (
    <label className="ae-field">
      <span>{label}</span>
      {textarea ? (
        <textarea rows={rows} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <span className="ae-hint">{hint}</span>}
    </label>
  );
}

export function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="ae-field">
      <span className="ae-toggle">
        <input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
        {label}
      </span>
      {hint && <span className="ae-hint">{hint}</span>}
    </label>
  );
}

export function Card({ title, hint, span, children }) {
  return (
    <section className={`admin-card ${span ? 'span-2' : ''}`}>
      {title && <h2>{title}</h2>}
      {hint && <p className="hint">{hint}</p>}
      {children}
    </section>
  );
}

/* ------------------------------------------------------ list of plain strings */

export function ListEditor({ label, path, items = [], hint, multiline = false, addLabel = 'Add item', placeholder = '' }) {
  const { update } = useContent();

  const setItems = (next) => update(path, next);
  const move = (from, to) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setItems(next);
  };

  return (
    <div className="ae-field">
      <span>{label}</span>
      <div className="ae-list">
        {items.map((item, i) => (
          <div className="ae-list-row" key={`${label}-${i}`}>
            {multiline ? (
              <textarea
                rows={3}
                value={item}
                placeholder={placeholder}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  setItems(next);
                }}
              />
            ) : (
              <input
                value={item}
                placeholder={placeholder}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  setItems(next);
                }}
              />
            )}
            <div className="ae-list-row-actions">
              <button type="button" className="mini-btn" onClick={() => move(i, i - 1)} disabled={i === 0} title="Move up">
                ↑
              </button>
              <button
                type="button"
                className="mini-btn"
                onClick={() => move(i, i + 1)}
                disabled={i === items.length - 1}
                title="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className="mini-btn danger"
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setItems([...items, ''])}>
        + {addLabel}
      </button>
      {hint && <span className="ae-hint">{hint}</span>}
    </div>
  );
}

/* ------------------------------------------------- array of objects (records) */

function Accordion({ title, index, total, onMove, onRemove, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="acc">
      <div className="acc-head">
        <button type="button" className="acc-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <strong>{title || '(untitled)'}</strong>
        </button>
        <div className="acc-order">
          <button type="button" className="mini-btn" onClick={() => onMove(index, index - 1)} disabled={index === 0} title="Move up">
            ↑
          </button>
          <button
            type="button"
            className="mini-btn"
            onClick={() => onMove(index, index + 1)}
            disabled={index === total - 1}
            title="Move down"
          >
            ↓
          </button>
          <button type="button" className="mini-btn danger" onClick={() => onRemove(index)} title="Delete">
            ✕
          </button>
        </div>
      </div>
      {open && <div className="acc-body">{children}</div>}
    </div>
  );
}

/**
 * Generic repeatable-record editor.
 *   fields: [{ key, label, textarea?, rows?, type?: 'list'|'number'|'text', hint?, placeholder? }]
 *   key may be a dotted path into the record, e.g. 'links.code'
 */
export function ItemListEditor({
  path,
  items = [],
  fields = [],
  blank = {},
  titleKey = 'title',
  addLabel = 'Add item',
  hint,
  numbered = true,
}) {
  const { update } = useContent();

  const setItems = (next) => update(path, next);
  const patch = (index, key, value) => {
    const segs = key.split('.');
    update([...path, index, ...segs], value);
  };
  const move = (from, to) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setItems(next);
  };
  const remove = (index) => setItems(items.filter((_, i) => i !== index));
  const add = () => setItems([...items, structuredClone(blank)]);

  return (
    <div>
      {hint && <p className="hint">{hint}</p>}
      {items.map((item, i) => (
        <Accordion
          key={`${titleKey}-${i}-${typeof item[titleKey] === 'string' ? item[titleKey] : ''}`}
          title={`${numbered ? `${i + 1}. ` : ''}${item[titleKey] || ''}`}
          index={i}
          total={items.length}
          onMove={move}
          onRemove={remove}
        >
          {fields.map((f) =>
            f.type === 'list' ? (
              <ListEditor
                key={f.key}
                label={f.label}
                path={[...path, i, f.key]}
                items={item[f.key] || []}
                multiline={f.multiline}
                placeholder={f.placeholder}
                addLabel={f.addLabel || 'Add item'}
                hint={f.hint}
              />
            ) : f.type === 'number' ? (
              <Field
                key={f.key}
                label={f.label}
                type="number"
                value={getValue(item, f.key)}
                hint={f.hint}
                onChange={(v) => patch(i, f.key, Number(v))}
              />
            ) : (
              <Field
                key={f.key}
                label={f.label}
                value={getValue(item, f.key)}
                hint={f.hint}
                textarea={f.textarea}
                rows={f.rows}
                placeholder={f.placeholder}
                onChange={(v) => patch(i, f.key, v)}
              />
            )
          )}
        </Accordion>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={add}>
        + {addLabel}
      </button>
    </div>
  );
}

function getValue(record, key) {
  return key.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), record);
}
