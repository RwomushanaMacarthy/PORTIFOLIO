import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons.jsx';
import { Chips, PageHero, Reveal, Section } from '../components/ui.jsx';
import { useSite } from '../context/ContentContext.jsx';

function ProjectCard({ project, index }) {
  return (
    <Reveal delay={index * 80} className="card project-card">
      <div className="project-top">
        <span className="project-badge" style={{ '--accent': project.accent }}>
          <Icon name="code" size={16} />
        </span>
        <div className="project-links">
          {project.links?.code && (
            <a href={project.links.code} aria-label={`${project.title} source code`} title="Source code">
              <Icon name="github" size={18} />
            </a>
          )}
          {project.links?.demo && (
            <a href={project.links.demo} aria-label={`${project.title} live demo`} title="Live demo">
              <Icon name="external" size={18} />
            </a>
          )}
        </div>
      </div>

      <h3 className="project-title">
        <Link to={`/projects/${project.slug}`}>{project.title}</Link>
      </h3>
      <p className="project-blurb">{project.blurb}</p>
      <Chips items={project.tags} small />
      <Link className="link-inline" to={`/projects/${project.slug}`}>
        Case study →
      </Link>
    </Reveal>
  );
}

export default function Projects() {
  const { projects = {}, socials = [] } = useSite();
  const items = projects.items || [];
  const [filter, setFilter] = useState(projects.allLabel || 'All');

  const tags = useMemo(() => {
    const set = new Set();
    items.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return [projects.allLabel || 'All', ...Array.from(set).slice(0, 7)];
  }, [items, projects.allLabel]);

  const allLabel = projects.allLabel || 'All';
  const visible = filter === allLabel ? items : items.filter((p) => (p.tags || []).includes(filter));

  return (
    <>
      <PageHero eyebrow={projects.eyebrow} title={projects.title} lead={projects.lead} />

      <Section>
        <div className="filters" role="tablist" aria-label="Filter projects by technology">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              role="tab"
              aria-selected={filter === tag}
              className={`filter ${filter === tag ? 'is-active' : ''}`}
              onClick={() => setFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="projects-grid">
          {visible.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>

        {!visible.length && <p className="muted">No projects tagged “{filter}” yet.</p>}

        <Reveal className="work-more">
          <a className="btn btn-ghost" href={socials[0]?.href || '#'} target="_blank" rel="noreferrer">
            <Icon name="github" size={18} /> {projects.githubCtaLabel || 'More code on GitHub'}
          </a>
        </Reveal>
      </Section>
    </>
  );
}
