import { Link } from 'react-router-dom';
import Icon from '../components/Icons.jsx';
import { Chips, PhotoCard, Reveal, Section, SectionHead, Typewriter } from '../components/ui.jsx';
import { useSite } from '../context/ContentContext.jsx';

/**
 * Renders the hero headline, colouring the highlighted part (your first name)
 * in blue. Whatever you type in the dashboard's "Hero title" field is shown
 * exactly — with the short name picked out in the accent gradient.
 */
function HeroTitle({ text, highlight }) {
  const title = text || `Hi, I\u2019m ${highlight}.`;
  if (!highlight || !title.includes(highlight)) return <h1>{title}</h1>;
  const [before, ...after] = title.split(highlight);
  return (
    <h1>
      {before}
      <span className="grad">{highlight}</span>
      {after.join(highlight)}
    </h1>
  );
}

function Hero() {
  const content = useSite();
  const { profile = {}, home = {}, socials = [] } = content;

  return (
    <section className="hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-inner">
        <Reveal className="hero-copy">
          {home.eyebrow && <span className="eyebrow">{home.eyebrow}</span>}
          <HeroTitle text={home.heroTitle} highlight={profile.shortName || profile.name} />
          <p className="hero-tagline">
            <Typewriter words={profile.taglines || []} />
          </p>
          <p className="hero-summary">{profile.summary}</p>

          {profile.available && (
            <span className="pill">
              <span className="dot" />
              {profile.availability}
            </span>
          )}

          <div className="hero-actions">
            <Link className="btn btn-primary" to={home.primaryCta?.to || '/projects'}>
              {home.primaryCta?.label || 'View my projects'} <Icon name="arrow" size={18} />
            </Link>
            <Link className="btn btn-ghost" to={home.secondaryCta?.to || '/contact'}>
              {home.secondaryCta?.label || 'Get in touch'}
            </Link>
            {profile.resumeUrl && (
              <a className="link-inline" href={profile.resumeUrl} download>
                {profile.resumeLabel || 'Download CV'}
              </a>
            )}
          </div>

          <div className="socials">
            {socials.map((s) => (
              <a key={s.label} href={s.href} className="social" aria-label={s.label} title={s.label}>
                <Icon name={s.icon} size={18} />
              </a>
            ))}
            <span className="social-note">
              <Icon name="location" size={16} />
              {profile.location}
            </span>
          </div>
        </Reveal>

        <Reveal delay={120} className="hero-card-wrap">
          <PhotoCard
            src={profile.photo}
            name={profile.name}
            caption={profile.name}
            course={profile.role}
          />

          <div className="code-card" aria-hidden="true">
            <div className="code-card-bar">
              <span className="dot-red" />
              <span className="dot-yellow" />
              <span className="dot-green" />
              <span className="code-card-title">{home.codeCardTitle || 'profile.ts'}</span>
            </div>
            <pre className="code-card-body">{home.codeCard}</pre>
          </div>

          <div className="stats">
            {(home.stats || []).map((s) => (
              <div className="stat" key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Highlights() {
  const { home = {} } = useSite();
  return (
    <Section>
      <SectionHead
        eyebrow="What I do"
        title="Three things I keep coming back to"
        lead="Everything I build sits somewhere between a business problem and a technical solution."
      />
      <div className="skills-grid">
        {(home.highlights || []).map((h, i) => (
          <Reveal key={h.title} delay={i * 80} className="card skill-card">
            <h3>
              <Icon name="spark" size={18} />
              {h.title}
            </h3>
            <p className="muted" style={{ margin: 0, fontSize: '.92rem' }}>
              {h.text}
            </p>
          </Reveal>
        ))}
      </div>
      {home.quote && (
        <Reveal delay={160}>
          <p className="quote">{home.quote}</p>
        </Reveal>
      )}
    </Section>
  );
}

function FeaturedProjects() {
  const { projects = {}, projectsTitleOverride } = useSite();
  const featured = (projects.items || []).filter((p) => p.featured).slice(0, 2);
  if (!featured.length) return null;

  return (
    <Section>
      <SectionHead
        eyebrow="Selected work"
        title={projectsTitleOverride || 'A couple of favourites'}
        lead={projects.lead}
      />
      <div className="projects-grid">
        {featured.map((p, i) => (
          <Reveal key={p.slug} delay={i * 90} className="card project-card">
            <div className="project-top">
              <span className="project-badge" style={{ '--accent': p.accent }}>
                <Icon name="code" size={16} />
              </span>
              <div className="project-links">
                {p.links?.code && (
                  <a href={p.links.code} aria-label={`${p.title} source code`} title="Source code">
                    <Icon name="github" size={18} />
                  </a>
                )}
                {p.links?.demo && (
                  <a href={p.links.demo} aria-label={`${p.title} live demo`} title="Live demo">
                    <Icon name="external" size={18} />
                  </a>
                )}
              </div>
            </div>
            <h3 className="project-title">
              <Link to={`/projects/${p.slug}`}>{p.title}</Link>
            </h3>
            <p className="project-blurb">{p.blurb}</p>
            <Chips items={p.tags} small />
            <Link className="link-inline" to={`/projects/${p.slug}`}>
              Read the case study →
            </Link>
          </Reveal>
        ))}
      </div>
      <Reveal className="work-more">
        <Link className="btn btn-ghost" to="/projects">
          All projects <Icon name="arrow" size={18} />
        </Link>
      </Reveal>
    </Section>
  );
}

function SkillsPreview() {
  const { skills = {} } = useSite();
  const groups = (skills.groups || []).slice(0, 3);
  return (
    <Section>
      <SectionHead eyebrow={skills.eyebrow} title={skills.title} lead={skills.lead} />
      <div className="skills-grid">
        {groups.map((g, i) => (
          <Reveal key={g.group} delay={i * 80} className="card skill-card">
            <h3>
              <Icon name="code" size={18} />
              {g.group}
            </h3>
            <Chips items={g.items} />
          </Reveal>
        ))}
      </div>
      <Reveal className="work-more">
        <Link className="btn btn-ghost" to="/about">
          More about me <Icon name="arrow" size={18} />
        </Link>
      </Reveal>
    </Section>
  );
}

function CtaBand() {
  const { contact = {}, profile = {} } = useSite();
  return (
    <Section>
      <Reveal className="card" style={{ textAlign: 'center', padding: '2.4rem 1.5rem' }}>
        <span className="eyebrow">{contact.eyebrow}</span>
        <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)' }}>{contact.title}</h2>
        <p className="muted" style={{ maxWidth: '60ch', margin: '0 auto 1.4rem' }}>
          {contact.lead}
        </p>
        <div style={{ display: 'flex', gap: '.7rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to="/contact">
            Contact me <Icon name="arrow" size={18} />
          </Link>
          <a className="btn btn-ghost" href={`mailto:${profile.email}`}>
            <Icon name="mail" size={18} /> {profile.email}
          </a>
        </div>
      </Reveal>
    </Section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Highlights />
      <FeaturedProjects />
      <SkillsPreview />
      <CtaBand />
    </>
  );
}
