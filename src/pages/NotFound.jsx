import { Link } from 'react-router-dom';
import Icon from '../components/Icons.jsx';
import { PageHero, Reveal, Section } from '../components/ui.jsx';

export default function NotFound() {
  return (
    <>
      <PageHero eyebrow="404" title="Page not found" lead="The link is broken or the page moved somewhere else." />
      <Section>
        <Reveal>
          <div style={{ display: 'flex', gap: '.7rem', flexWrap: 'wrap' }}>
            <Link className="btn btn-primary" to="/">
              <Icon name="home" size={18} /> Back home
            </Link>
            <Link className="btn btn-ghost" to="/projects">
              Browse projects
            </Link>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
