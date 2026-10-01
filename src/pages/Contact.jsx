import { useCallback, useState } from 'react';
import Icon from '../components/Icons.jsx';
import { PageHero, Reveal, Section } from '../components/ui.jsx';
import { useSite } from '../context/ContentContext.jsx';

export default function Contact() {
  const { contact = {}, profile = {}, socials = [] } = useSite();
  const [status, setStatus] = useState('idle');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const onChange = useCallback((e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value })), []);

  /**
   * No backend mail service is wired up. Two easy options when you deploy:
   *   1. Point this at your own API route (e.g. POST /api/contact).
   *   2. Use a hosted form endpoint (Formspree, EmailJS, Getform) and fetch() it.
   */
  const onSubmit = useCallback((e) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    }, 800);
  }, []);

  return (
    <>
      <PageHero eyebrow={contact.eyebrow} title={contact.title} lead={contact.lead} />

      <Section>
        <div className="contact-grid">
          <Reveal className="card">
            <h3 style={{ fontSize: '1rem' }}>{contact.formTitle}</h3>
            <form className="contact-form" onSubmit={onSubmit}>
              <div className="field-row">
                <label className="field">
                  <span>Name</span>
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </label>
              </div>
              <label className="field">
                <span>Message</span>
                <textarea
                  required
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={onChange}
                  placeholder="Tell me about the role, the project or the opportunity…"
                />
              </label>

              <div className="form-foot">
                <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Message sent ✓' : contact.buttonLabel}
                </button>
                <span className="form-note" role="status" aria-live="polite">
                  {status === 'sent' ? contact.sentMessage : contact.formNote}
                </span>
              </div>
            </form>
          </Reveal>

          <div className="contact-side">
            <Reveal delay={80} className="card contact-block">
              <h3>{contact.directTitle || 'Direct'}</h3>
              <a className="contact-link" href={`mailto:${profile.email}`}>
                <Icon name="mail" size={18} />
                {profile.email}
              </a>
              {profile.phone && (
                <a className="contact-link" href={`tel:${String(profile.phone).replace(/\s+/g, '')}`}>
                  <Icon name="phone" size={18} />
                  {profile.phone}
                </a>
              )}
              <p className="contact-loc">
                <Icon name="location" size={16} />
                {profile.location}
              </p>
            </Reveal>

            <Reveal delay={140} className="card contact-block">
              <h3>{contact.elsewhereTitle || 'Elsewhere'}</h3>
              <div className="contact-socials">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} className="social" aria-label={s.label} title={s.label}>
                    <Icon name={s.icon} size={18} />
                  </a>
                ))}
              </div>
              <p className="muted">
                <Icon name="spark" size={14} /> {profile.availability}
              </p>
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}
