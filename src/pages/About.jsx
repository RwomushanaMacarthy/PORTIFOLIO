import { Link } from 'react-router-dom';
import Icon from '../components/Icons.jsx';
import { Bar, Chips, PageHero, PhotoCard, Reveal, Section, SectionHead } from '../components/ui.jsx';
import { useSite } from '../context/ContentContext.jsx';

export default function About() {
  const { about = {}, profile = {}, skills = {} } = useSite();

  return (
    <>
      <PageHero eyebrow={about.eyebrow} title={about.title} lead={about.lead} />

      <Section>
        <div className="about-grid">
          <Reveal className="about-text">
            {(about.paragraphs || []).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {about.timeline?.length > 0 && (
              <div style={{ marginTop: '1.6rem' }}>
                <h3 style={{ fontSize: '1.05rem' }}>Quick history</h3>
                <ol className="timeline" style={{ marginTop: '.9rem' }}>
                  {(about.timeline || []).map((t) => (
                    <Reveal as="li" key={`${t.year}-${t.title}`} className="timeline-item">
                      <span className="timeline-dot" aria-hidden="true" />
                      <div className="card timeline-card" style={{ padding: '1.1rem' }}>
                        <div className="timeline-head">
                          <h3 style={{ fontSize: '.98rem', marginBottom: '.2rem' }}>{t.title}</h3>
                          <span className="timeline-period">{t.year}</span>
                        </div>
                        <p className="muted" style={{ margin: 0, fontSize: '.9rem' }}>
                          {t.text}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </ol>
              </div>
            )}
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <Reveal delay={80}>
              <PhotoCard src={profile.photo} name={profile.name} caption={profile.name} course={profile.role} />
            </Reveal>
            <Reveal delay={140} className="card about-facts">
              <dl>
                {(about.facts || []).map((f) => (
                  <div className="fact" key={f.k}>
                    <dt>{f.k}</dt>
                    <dd>{f.v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow={skills.eyebrow} title={skills.title} lead={skills.lead} />
        <div className="skills-grid">
          {(skills.groups || []).map((g, i) => (
            <Reveal key={g.group} delay={i * 80} className="card skill-card">
              <h3>
                <Icon name="code" size={18} />
                {g.group}
              </h3>
              <Chips items={g.items} />
            </Reveal>
          ))}
        </div>

        {skills.soft?.items?.length > 0 && (
          <div className="soft-bars">
            {(skills.soft.items || []).map((s, i) => (
              <Bar key={s.label} label={s.label} value={s.value} delay={i * 100} />
            ))}
          </div>
        )}

        <Reveal className="work-more">
          <Link className="btn btn-ghost" to="/experience">
            <Icon name="cap" size={18} /> See my education & experience
          </Link>
        </Reveal>
      </Section>
    </>
  );
}
