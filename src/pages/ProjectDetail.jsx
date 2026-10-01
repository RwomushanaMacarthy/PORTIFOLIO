import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icons.jsx';
import { Chips, PageHero, Reveal, Section } from '../components/ui.jsx';
import { useSite } from '../context/ContentContext.jsx';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { projects = {} } = useSite();
  const items = projects.items || [];
  const index = items.findIndex((p) => p.slug === slug);
  const project = index >= 0 ? items[index] : null;

  if (!project) {
    return (
      <>
        <PageHero eyebrow="Projects" title="Project not found" lead="That case study doesn’t exist (any more)." />
        <Section>
          <Link className="btn btn-ghost" to="/projects">
            <Icon name="arrowLeft" size={18} /> Back to all projects
          </Link>
        </Section>
      </>
    );
  }

  const prev = items[(index - 1 + items.length) % items.length];
  const next = items[(index + 1) % items.length];

  return (
    <>
      <PageHero eyebrow={project.tags?.[0] || 'Project'} title={project.title} lead={project.blurb} />

      <Section>
        <Reveal>
          <div className="breadcrumbs">
            <Link to="/">Home</Link> / <Link to="/projects">Projects</Link> / {project.title}
          </div>
        </Reveal>

        <div className="about-grid">
          <Reveal className="prose">
            {project.body && <p>{project.body}</p>}
            {project.details?.length > 0 && (
              <ul className="detail-list">
                {project.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </Reveal>

          <Reveal delay={90} className="card">
            <div className="project-badge" style={{ '--accent': project.accent, marginBottom: '.9rem' }}>
              <Icon name="code" size={18} />
            </div>
            <Chips items={project.tags} />
            <dl className="project-meta">
              {project.year && (
                <div>
                  <dt>Year</dt>
                  <dd>{project.year}</dd>
                </div>
              )}
              {project.role && (
                <div>
                  <dt>My role</dt>
                  <dd>{project.role}</dd>
                </div>
              )}
              {project.client && (
                <div>
                  <dt>Context</dt>
                  <dd>{project.client}</dd>
                </div>
              )}
            </dl>
            <div style={{ display: 'flex', gap: '.6rem', marginTop: '1.3rem', flexWrap: 'wrap' }}>
              {project.links?.demo && (
                <a className="btn btn-primary btn-sm" href={project.links.demo}>
                  <Icon name="external" size={16} /> Live demo
                </a>
              )}
              {project.links?.code && (
                <a className="btn btn-ghost btn-sm" href={project.links.code}>
                  <Icon name="github" size={16} /> Source code
                </a>
              )}
            </div>
          </Reveal>
        </div>

        <div className="prev-next">
          <Link className="btn btn-ghost" to={`/projects/${prev.slug}`}>
            <Icon name="arrowLeft" size={18} /> {prev.title}
          </Link>
          <Link className="btn btn-ghost" to={`/projects/${next.slug}`}>
            {next.title} <Icon name="arrow" size={18} />
          </Link>
        </div>
      </Section>
    </>
  );
}
