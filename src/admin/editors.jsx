/**
 * One editor component per part of the site.
 * Each writes into the shared draft through useContent().update(path, value),
 * and every change is previewable on the real pages before you publish.
 */
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Field, ItemListEditor, ListEditor, Toggle } from './Fields.jsx';
import Icon from '../components/Icons.jsx';
import { useContent } from '../context/ContentContext.jsx';
import { ICON_NAMES } from '../components/Icons.jsx';
import { PROFILE_PHOTO } from '../content/defaults.js';

/* ------------------------------------------------------------------ overview */

export function OverviewEditor() {
  const { content, draft, lastSaved, isAdmin, logout, save, discard, dirty, status } = useContent();
  const navigate = useNavigate();
  const goto = (id) => navigate(id === 'overview' ? '/admin' : `/admin/${id}`);
  const doc = draft || content || {};
  const counts = {
    projects: doc.projects?.items?.length || 0,
    skills: (doc.skills?.groups || []).reduce((n, g) => n + (g.items?.length || 0), 0),
    experience: doc.experience?.items?.length || 0,
  };

  return (
    <div className="admin-grid">
      <div className="span-2 dash-cards">
        <div className="dash-card">
          <strong>{counts.projects}</strong>
          <span>Projects on the site</span>
          <a onClick={() => goto('projects')} role="button">Edit projects →</a>
        </div>
        <div className="dash-card">
          <strong>{counts.skills}</strong>
          <span>Skills listed</span>
          <a onClick={() => goto('skills')} role="button">Edit skills →</a>
        </div>
        <div className="dash-card">
          <strong>{counts.experience}</strong>
          <span>Timeline entries</span>
          <a onClick={() => goto('experience')} role="button">Edit timeline →</a>
        </div>
        <div className="dash-card">
          <strong style={{ fontSize: '1rem' }}>
            {lastSaved ? new Date(lastSaved).toLocaleString() : 'never'}
          </strong>
          <span>Last published</span>
          <span className="ae-hint">{dirty ? 'You have unsaved changes.' : 'Everything is published.'}</span>
        </div>
      </div>

      <Card
        title="Publish"
        hint="Nothing visitors see changes until you press Save. Your draft is kept in the browser, so a refresh won't lose it."
        span
      >
        <div className="admin-actions">
          <button type="button" className="btn btn-primary" onClick={save} disabled={!dirty || status === 'saving'}>
            <Icon name="save" size={17} /> {status === 'saving' ? 'Saving…' : 'Save & publish'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={discard} disabled={!dirty}>
            <Icon name="refresh" size={17} /> Discard draft
          </button>
          <Link className="btn btn-ghost" to="/" target="_blank" rel="noreferrer">
            <Icon name="eye" size={17} /> View site
          </Link>
          {isAdmin && (
            <button type="button" className="btn btn-ghost" onClick={logout}>
              <Icon name="logout" size={17} /> Sign out
            </button>
          )}
        </div>
      </Card>

      <Card title="Jump to a page" hint="Every section of the public site has an editor." span>
        <div className="quick-links">
          {[
            ['profile', 'Name, role, photo, contact details', 'user'],
            ['home', 'Home page hero, stats, highlights', 'home'],
            ['about', 'About page, facts, history', 'spark'],
            ['skills', 'Skill groups and working skills', 'code'],
            ['projects', 'Projects and case studies', 'briefcase'],
            ['experience', 'Education & experience timeline', 'cap'],
            ['contact', 'Contact page wording', 'mail'],
            ['nav', 'Menu, footer and social links', 'dashboard'],
            ['media', 'Profile photo', 'image'],
            ['settings', 'Backup, restore, advanced', 'lock'],
          ].map(([id, text, icon]) => (
            <button key={id} type="button" className="quick-link" onClick={() => goto(id)}>
              <Icon name={icon} size={18} />
              <span>
                {text}
                <br />
                <span className="ae-hint">{id}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------- profile */

export function ProfileEditor() {
  const { draft, content, update } = useContent();
  const p = (draft || content).profile || {};

  return (
    <div className="admin-grid">
      <Card title="Identity" hint="Shown in the header, hero and footer.">
        <Field label="Full name" value={p.name} onChange={(v) => update(['profile', 'name'], v)} />
        <Field label="Short name (hero greeting)" value={p.shortName} onChange={(v) => update(['profile', 'shortName'], v)} />
        <Field label="Initials" value={p.initials} onChange={(v) => update(['profile', 'initials'], v)} hint="Used as a fallback if there is no photo." />
        <Field label="Role / title" value={p.role} onChange={(v) => update(['profile', 'role'], v)} hint="e.g. Business Computing Student" />
        <Field
          label="Summary"
          textarea
          rows={6}
          value={p.summary}
          onChange={(v) => update(['profile', 'summary'], v)}
          hint="Two or three sentences for the home page hero."
        />
      </Card>

      <Card title="Availability & contact">
        <Toggle
          label="Show the “available” pill"
          checked={p.available}
          onChange={(v) => update(['profile', 'available'], v)}
        />
        <Field label="Availability text" value={p.availability} onChange={(v) => update(['profile', 'availability'], v)} />
        <Field label="Location" value={p.location} onChange={(v) => update(['profile', 'location'], v)} />
        <Field label="Email" type="email" value={p.email} onChange={(v) => update(['profile', 'email'], v)} />
        <Field label="Phone (optional)" value={p.phone} onChange={(v) => update(['profile', 'phone'], v)} />
        <div className="ae-row">
          <Field label="CV link" value={p.resumeUrl} onChange={(v) => update(['profile', 'resumeUrl'], v)} hint="URL to your PDF CV." />
          <Field label="CV button label" value={p.resumeLabel} onChange={(v) => update(['profile', 'resumeLabel'], v)} />
        </div>
      </Card>

      <Card title="Typewriter lines" hint="These rotate in the hero. One per line." span>
        <ListEditor
          label="Taglines"
          path={['profile', 'taglines']}
          items={p.taglines || []}
          addLabel="Add tagline"
          placeholder="A short sentence about you"
          hint="Keep them under ~60 characters so they don’t wrap."
        />
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- home */

export function HomeEditor() {
  const { draft, content, update } = useContent();
  const h = (draft || content).home || {};

  return (
    <div className="admin-grid">
      <Card title="Hero">
        <Field label="Eyebrow (small text above the name)" value={h.eyebrow} onChange={(v) => update(['home', 'eyebrow'], v)} />
        <Field
          label="Hero title"
          value={h.heroTitle}
          onChange={(v) => update(['home', 'heroTitle'], v)}
          hint="Your name is appended automatically in blue."
        />
        <div className="ae-row">
          <Field
            label="Primary button label"
            value={h.primaryCta?.label}
            onChange={(v) => update(['home', 'primaryCta', 'label'], v)}
          />
          <Field
            label="Primary button link"
            value={h.primaryCta?.to}
            onChange={(v) => update(['home', 'primaryCta', 'to'], v)}
            hint="/projects, /contact…"
          />
        </div>
        <div className="ae-row">
          <Field
            label="Secondary button label"
            value={h.secondaryCta?.label}
            onChange={(v) => update(['home', 'secondaryCta', 'label'], v)}
          />
          <Field label="Secondary button link" value={h.secondaryCta?.to} onChange={(v) => update(['home', 'secondaryCta', 'to'], v)} />
        </div>
      </Card>

      <Card title="Code card" hint="The terminal-style card beside your photo. Plain text, shown exactly as typed.">
        <Field label="Window title" value={h.codeCardTitle} onChange={(v) => update(['home', 'codeCardTitle'], v)} />
        <Field
          label="Contents"
          textarea
          rows={8}
          value={h.codeCard}
          onChange={(v) => update(['home', 'codeCard'], v)}
        />
      </Card>

      <Card title="Stat tiles" span hint="The four little numbers under the code card.">
        <ItemListEditor
          path={['home', 'stats']}
          items={h.stats || []}
          titleKey="label"
          addLabel="Add stat"
          blank={{ value: '', label: '' }}
          numbered={false}
          fields={[
            { key: 'value', label: 'Value', placeholder: '6+' },
            { key: 'label', label: 'Label', placeholder: 'Projects built' },
          ]}
        />
      </Card>

      <Card title="“What I do” cards" span>
        <ItemListEditor
          path={['home', 'highlights']}
          items={h.highlights || []}
          addLabel="Add card"
          blank={{ title: '', text: '' }}
          fields={[
            { key: 'title', label: 'Title' },
            { key: 'text', label: 'Text', textarea: true, rows: 3 },
          ]}
        />
        <Field label="Quote under the cards" textarea rows={3} value={h.quote} onChange={(v) => update(['home', 'quote'], v)} />
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------- about */

export function AboutEditor() {
  const { draft, content, update } = useContent();
  const a = (draft || content).about || {};

  return (
    <div className="admin-grid">
      <Card title="Page heading">
        <Field label="Eyebrow" value={a.eyebrow} onChange={(v) => update(['about', 'eyebrow'], v)} />
        <Field label="Title" value={a.title} onChange={(v) => update(['about', 'title'], v)} />
        <Field label="Lead paragraph" textarea rows={3} value={a.lead} onChange={(v) => update(['about', 'lead'], v)} />
      </Card>

      <Card title="Story" hint="Each box is one paragraph.">
        <ListEditor label="Paragraphs" path={['about', 'paragraphs']} items={a.paragraphs || []} multiline addLabel="Add paragraph" />
      </Card>

      <Card title="Quick facts" span hint="The two-column list next to your photo (Course, Year, Based in…).">
        <ItemListEditor
          path={['about', 'facts']}
          items={a.facts || []}
          titleKey="k"
          addLabel="Add fact"
          blank={{ k: '', v: '' }}
          numbered={false}
          fields={[
            { key: 'k', label: 'Label' },
            { key: 'v', label: 'Value' },
          ]}
        />
      </Card>

      <Card title="Quick history timeline" span>
        <ItemListEditor
          path={['about', 'timeline']}
          items={a.timeline || []}
          titleKey="title"
          addLabel="Add entry"
          blank={{ year: '', title: '', text: '' }}
          fields={[
            { key: 'year', label: 'Year' },
            { key: 'title', label: 'Title' },
            { key: 'text', label: 'Text', textarea: true, rows: 3 },
          ]}
        />
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------- skills */

export function SkillsEditor() {
  const { draft, content, update } = useContent();
  const s = (draft || content).skills || {};

  return (
    <div className="admin-grid">
      <Card title="Section heading" span>
        <Field label="Eyebrow" value={s.eyebrow} onChange={(v) => update(['skills', 'eyebrow'], v)} />
        <Field label="Title" value={s.title} onChange={(v) => update(['skills', 'title'], v)} />
        <Field label="Lead" textarea rows={3} value={s.lead} onChange={(v) => update(['skills', 'lead'], v)} />
      </Card>

      <Card title="Skill groups" span hint="Each group is a card with a list of skills inside.">
        <ItemListEditor
          path={['skills', 'groups']}
          items={s.groups || []}
          titleKey="group"
          addLabel="Add skill group"
          blank={{ group: '', items: [] }}
          fields={[
            { key: 'group', label: 'Group name' },
            {
              key: 'items',
              label: 'Skills in this group',
              type: 'list',
              addLabel: 'Add skill',
              placeholder: 'e.g. React',
            },
          ]}
        />
      </Card>

      <Card title="Working skills (bars)" span hint="Rendered on the About page as progress bars. Value is 0–100.">
        <Field label="Title" value={s.soft?.title} onChange={(v) => update(['skills', 'soft', 'title'], v)} />
        <ItemListEditor
          path={['skills', 'soft', 'items']}
          items={s.soft?.items || []}
          titleKey="label"
          addLabel="Add skill bar"
          blank={{ label: '', value: 75 }}
          numbered={false}
          fields={[
            { key: 'label', label: 'Label' },
            { key: 'value', label: 'Value (0–100)', type: 'number' },
          ]}
        />
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ projects */

export function ProjectsEditor() {
  const { draft, content, update } = useContent();
  const p = (draft || content).projects || {};

  return (
    <div className="admin-grid">
      <Card title="Projects page copy">
        <Field label="Eyebrow" value={p.eyebrow} onChange={(v) => update(['projects', 'eyebrow'], v)} />
        <Field label="Title" value={p.title} onChange={(v) => update(['projects', 'title'], v)} />
        <Field label="Lead" textarea rows={3} value={p.lead} onChange={(v) => update(['projects', 'lead'], v)} />
        <Field label="“All” filter label" value={p.allLabel} onChange={(v) => update(['projects', 'allLabel'], v)} />
        <Field label="GitHub button label" value={p.githubCtaLabel} onChange={(v) => update(['projects', 'githubCtaLabel'], v)} />
      </Card>

      <Card title="Featured behaviour" hint="Featured projects also appear on the home page." span>
        <p className="ae-hint">
          Tick “Featured” inside a project to show it on the home page, untick to keep it only on the projects page.
        </p>
      </Card>

      <Card title="Project entries" span hint="Each project gets its own page at /#/projects/&lt;slug&gt;.">
        <ItemListEditor
          path={['projects', 'items']}
          items={p.items || []}
          addLabel="Add project"
          blank={{
            slug: 'new-project',
            title: '',
            blurb: '',
            year: '',
            role: '',
            client: '',
            tags: [],
            accent: '#2f6bff',
            featured: false,
            links: { demo: '', code: '' },
            details: [],
            body: '',
            image: '',
          }}
          fields={[
            { key: 'title', label: 'Title' },
            { key: 'slug', label: 'Slug (URL)', hint: 'Lower-case, hyphens. Must be unique.' },
            { key: 'blurb', label: 'Short description', textarea: true, rows: 3, hint: 'Shown on the cards.' },
            { key: 'body', label: 'Case study intro', textarea: true, rows: 4 },
            { key: 'year', label: 'Year' },
            { key: 'role', label: 'My role' },
            { key: 'client', label: 'Context / client' },
            { key: 'accent', label: 'Accent colour', hint: 'Any CSS colour — e.g. #2f6bff (blue) or #ffd23f (yellow).' },
            { key: 'tags', label: 'Tags', type: 'list', addLabel: 'Add tag' },
            { key: 'details', label: 'What I did (bullet points)', type: 'list', multiline: true, addLabel: 'Add point' },
            { key: 'links.demo', label: 'Live demo URL' },
            { key: 'links.code', label: 'Source code URL' },
          ]}
        />
        <p className="ae-hint">
          Featured flag: open a project and use the field below. (Tip: mark one or two as featured so the home page stays focused.)
        </p>
        <FeatureToggles />
      </Card>
    </div>
  );
}

/* Tiny helper so "featured" is a checkbox rather than free text. */
function FeatureToggles() {
  const { draft, content, update } = useContent();
  const items = ((draft || content).projects || {}).items || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
      {items.map((item, i) => (
        <label className="ae-toggle" key={`${item.slug}-${i}`}>
          <input
            type="checkbox"
            checked={Boolean(item.featured)}
            onChange={(e) => update(['projects', 'items', i, 'featured'], e.target.checked)}
          />
          Feature “{item.title || `project ${i + 1}`}” on the home page
        </label>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- experience */

export function ExperienceEditor() {
  const { draft, content, update } = useContent();
  const e = (draft || content).experience || {};

  return (
    <div className="admin-grid">
      <Card title="Page heading" span>
        <Field label="Eyebrow" value={e.eyebrow} onChange={(v) => update(['experience', 'eyebrow'], v)} />
        <Field label="Title" value={e.title} onChange={(v) => update(['experience', 'title'], v)} />
        <Field label="Lead" textarea rows={3} value={e.lead} onChange={(v) => update(['experience', 'lead'], v)} />
      </Card>

      <Card title="Timeline entries" span hint="Usually newest first.">
        <ItemListEditor
          path={['experience', 'items']}
          items={e.items || []}
          titleKey="role"
          addLabel="Add entry"
          blank={{ role: '', company: '', period: '', location: '', kind: 'work', points: [] }}
          fields={[
            { key: 'role', label: 'Role / programme' },
            { key: 'company', label: 'Organisation' },
            { key: 'period', label: 'Period', hint: 'e.g. 2024 — Present' },
            { key: 'location', label: 'Location' },
            { key: 'points', label: 'Bullet points', type: 'list', multiline: true, addLabel: 'Add bullet' },
          ]}
        />
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------- contact */

export function ContactEditor() {
  const { draft, content, update } = useContent();
  const c = (draft || content).contact || {};

  return (
    <div className="admin-grid">
      <Card title="Contact page copy">
        <Field label="Eyebrow" value={c.eyebrow} onChange={(v) => update(['contact', 'eyebrow'], v)} />
        <Field label="Title" value={c.title} onChange={(v) => update(['contact', 'title'], v)} />
        <Field label="Lead" textarea rows={3} value={c.lead} onChange={(v) => update(['contact', 'lead'], v)} />
        <Field label="Form heading" value={c.formTitle} onChange={(v) => update(['contact', 'formTitle'], v)} />
        <Field label="Send button label" value={c.buttonLabel} onChange={(v) => update(['contact', 'buttonLabel'], v)} />
        <Field label="Success message" value={c.sentMessage} onChange={(v) => update(['contact', 'sentMessage'], v)} />
        <Field
          label="Note under the button"
          value={c.formNote}
          onChange={(v) => update(['contact', 'formNote'], v)}
          hint="Change this once you connect a real form endpoint."
        />
      </Card>

      <Card title="Side panels">
        <Field label="“Direct” heading" value={c.directTitle} onChange={(v) => update(['contact', 'directTitle'], v)} />
        <Field label="“Elsewhere” heading" value={c.elsewhereTitle} onChange={(v) => update(['contact', 'elsewhereTitle'], v)} />
        <p className="ae-hint">
          Your email, phone and location come from the Profile editor. The social icons come from the Menu & footer
          editor.
        </p>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------- nav, footer, socials */

export function NavEditor() {
  const { draft, content, update } = useContent();
  const doc = draft || content;
  const nav = doc.nav || {};
  const footer = doc.footer || {};

  return (
    <div className="admin-grid">
      <Card title="Header">
        <Field label="Brand name" value={nav.brand} onChange={(v) => update(['nav', 'brand'], v)} />
        <div className="ae-row">
          <Field label="Header button label" value={nav.ctaLabel} onChange={(v) => update(['nav', 'ctaLabel'], v)} />
          <Field label="Header button link" value={nav.ctaTo} onChange={(v) => update(['nav', 'ctaTo'], v)} />
        </div>
      </Card>

      <Card title="Menu links" hint="Available pages: / · /about · /projects · /experience · /contact">
        <ItemListEditor
          path={['nav', 'links']}
          items={nav.links || []}
          titleKey="label"
          addLabel="Add menu link"
          blank={{ id: 'new', label: '', to: '/' }}
          numbered={false}
          fields={[
            { key: 'label', label: 'Label' },
            { key: 'to', label: 'Path', hint: 'e.g. /projects' },
          ]}
        />
      </Card>

      <Card title="Footer">
        <Field label="Tagline" value={footer.tagline} onChange={(v) => update(['footer', 'tagline'], v)} />
        <Field label="Note" value={footer.note} onChange={(v) => update(['footer', 'note'], v)} />
        <ItemListEditor
          path={['footer', 'links']}
          items={footer.links || []}
          titleKey="label"
          addLabel="Add footer link"
          blank={{ label: '', to: '/' }}
          numbered={false}
          fields={[
            { key: 'label', label: 'Label' },
            { key: 'to', label: 'Path' },
          ]}
        />
      </Card>

      <Card title="Social links" hint={`Icon names: ${ICON_NAMES.join(', ')}`}>
        <ItemListEditor
          path={['socials']}
          items={doc.socials || []}
          titleKey="label"
          addLabel="Add social link"
          blank={{ label: '', href: '', icon: 'github' }}
          numbered={false}
          fields={[
            { key: 'label', label: 'Label' },
            { key: 'href', label: 'URL' },
            { key: 'icon', label: 'Icon name' },
          ]}
        />
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------- media */

export function MediaEditor() {
  const { draft, content, update } = useContent();
  const photo = (draft || content).profile?.photo || '';
  const fileRef = useRef(null);

  const onFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2_500_000) {
      // eslint-disable-next-line no-alert
      alert('That image is larger than 2.5 MB. Please pick a smaller one (or resize it first).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update(['profile', 'photo'], String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="admin-grid">
      <Card title="Profile photo" hint="Used in the header avatar, hero card, About page and footer." span>
        <div className="photo-preview">
          {photo ? <img src={photo} alt="Current profile" /> : <div className="photo-preview-empty">No photo</div>}
          <div className="photo-controls">
            <div className="ae-field">
              <span>Image URL or data URI</span>
              <textarea
                rows={3}
                value={photo.startsWith('data:') ? '(uploaded image — base64 data)' : photo}
                onChange={(e) => update(['profile', 'photo'], e.target.value)}
                placeholder="https://example.com/me.jpg"
              />
              <span className="ae-hint">
                Paste any public image URL. A base64 upload is stored inside the content file — keep it under ~2 MB.
              </span>
            </div>
            <div className="admin-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
                <Icon name="upload" size={16} /> Upload an image
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => update(['profile', 'photo'], PROFILE_PHOTO)}>
                <Icon name="refresh" size={16} /> Restore illustrated portrait
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => update(['profile', 'photo'], '')}>
                <Icon name="trash" size={16} /> Remove photo
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ settings */

export function SettingsEditor() {
  const { draft, content, importContent, resetToDefaults, lastSaved, isAdmin, logout } = useContent();
  const doc = draft || content;
  const [importText, setImportText] = useState('');

  const onImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (importContent(parsed)) setImportText('');
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(`That is not valid JSON: ${err.message}`);
    }
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-content.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-grid">
      <Card title="Backup & restore" hint="Copy this JSON somewhere safe, or paste a previous export to restore it." span>
        <textarea className="code-box" readOnly value={JSON.stringify(doc, null, 2)} />
        <div className="admin-actions" style={{ marginTop: '.8rem' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => navigator.clipboard?.writeText(JSON.stringify(doc, null, 2))}
          >
            <Icon name="save" size={16} /> Copy JSON
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={download}>
            <Icon name="upload" size={16} /> Download JSON
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => {
              // eslint-disable-next-line no-alert
              if (window.confirm('Reset every page back to the shipped defaults? This publishes immediately.')) {
                resetToDefaults();
              }
            }}
          >
            <Icon name="refresh" size={16} /> Reset everything to defaults
          </button>
        </div>
        <div className="ae-field" style={{ marginTop: '1rem' }}>
          <span>Paste JSON to import (it loads as a draft — press Save to publish)</span>
          <textarea
            rows={5}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{ "profile": { ... } }'
          />
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onImport} disabled={!importText.trim()}>
          Import JSON into draft
        </button>
      </Card>

      <Card title="Session">
        <p className="ae-hint">
          Signed in as admin. Last published: {lastSaved ? new Date(lastSaved).toLocaleString() : 'never'}.
        </p>
        <p className="ae-hint">
          The dashboard password is set on the server with the <code>ADMIN_PASSWORD</code> environment variable
          (default <code>admin123</code> — change it before you deploy).
        </p>
        {isAdmin ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            <Icon name="logout" size={16} /> Sign out
          </button>
        ) : (
          <Link className="btn btn-primary btn-sm" to="/admin">
            Sign in
          </Link>
        )}
      </Card>
    </div>
  );
}
