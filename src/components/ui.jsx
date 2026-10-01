/** Small presentational primitives shared by every page. */
import { useEffect, useRef, useState } from 'react';

/* Fade + lift an element into view once it enters the viewport. */
export function useReveal(options = {}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px', ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shown, options]);

  return [ref, shown];
}

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, shown] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* Rotating headline text. */
export function Typewriter({ words = [], speed = 55, pause = 1600 }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!words.length) return undefined;
    const current = words[index % words.length];
    let timer;

    if (!deleting && text === current) {
      timer = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === '') {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
    } else {
      timer = setTimeout(
        () => setText(deleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1)),
        deleting ? speed / 2 : speed
      );
    }
    return () => clearTimeout(timer);
  }, [text, deleting, index, words, speed, pause]);

  return (
    <span className="typewriter">
      {text}
      <span className="caret" aria-hidden="true" />
    </span>
  );
}

/* Page/section heading block, driven entirely by content. */
export function SectionHead({ eyebrow, title, lead }) {
  return (
    <Reveal className="section-head">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      {title && <h2>{title}</h2>}
      {lead && <p className="section-lead">{lead}</p>}
    </Reveal>
  );
}

export function PageHero({ eyebrow, title, lead, children }) {
  return (
    <div className="page-hero">
      <div className="container">
        <Reveal>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {lead && <p className="section-lead" style={{ maxWidth: '62ch' }}>{lead}</p>}
          {children}
        </Reveal>
      </div>
    </div>
  );
}

export function Section({ children, className = '' }) {
  return (
    <section className={`section ${className}`}>
      <div className="container">{children}</div>
    </section>
  );
}

/* Chips list. */
export function Chips({ items = [], small = false }) {
  return (
    <ul className={`chips ${small ? 'chips-sm' : ''}`}>
      {items.map((item) => (
        <li key={item} className="chip">
          {item}
        </li>
      ))}
    </ul>
  );
}

/* Animated skill bar. */
export function Bar({ label, value = 0, delay = 0 }) {
  const [ref, shown] = useReveal({ threshold: 0.4 });
  return (
    <div ref={ref}>
      <div className="bar-label">
        <span>{label}</span>
        <span className="muted">{shown ? `${value}%` : ''}</span>
      </div>
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{ width: shown ? `${Math.max(0, Math.min(100, value))}%` : 0, transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

/* Photo block used on the home page and about page. */
export function PhotoCard({ src, name, caption, course }) {
  if (!src) return null;
  return (
    <div className="photo-card">
      <img src={src} alt={`Portrait of ${name}`} />
      {caption && (
        <div className="photo-badge">
          <span className="photo-badge-dot" />
          <span>
            <strong>{caption}</strong>
            {course && <em>{course}</em>}
          </span>
        </div>
      )}
    </div>
  );
}
