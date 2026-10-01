import { Link } from 'react-router-dom';
import Icon from '../components/Icons.jsx';
import { PageHero, Reveal, Section } from '../components/ui.jsx';
import { useSite } from '../context/ContentContext.jsx';

const KIND_ICON = { education: 'cap', work: 'briefcase', activity: 'spark' };

export default function Experience() {
  const { experience = {}, profile = {} } = useSite();
  const items = experience.items || [];

  return (
    <>
      <PageHero eyebrow={experience.eyebrow} title={experience.title} lead={experience.lead} />

      <Section>
        <div className="about-grid">
          <div>
            <ol className="timeline">
              {items.map((job, i) => (
                <Reveal as="li" key={`${job.company}-${job.period}-${i}`} delay={i * 80} className="timeline-item">
                  <span className="timeline-dot" aria-hidden="true" />
                  <div className="card timeline-card">
                    <div className="timeline-head">
                      <div>
                        <h3>{job.role}</h3>
                        <p className="timeline-company">
                          {job.company} · <span className="muted">{job.location}</span>
                          {job.kind && <span className="kind-tag">{job.kind}</span>}
                        </p>
                      </div>
                      <span className="timeline-period">{job.period}</span>
                    </div>
                    <ul className="bullets">
                      {(job.points || []).map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>

          <Reveal delay={120} className="card" style={{ position: 'sticky', top: '88px' }}>
            <h3 style={{ fontSize: '1rem' }}>
              <Icon name="briefcase" size={17} /> Right now
            </h3>
            <p className="muted" style={{ fontSize: '.92rem' }}>
              {profile.availability} — based in {profile.location}.
            </p>
            <ul className="bullets" style={{ marginBottom: '1.1rem' }}>
              <li>Available for internships, attachments and junior roles.</li>
              <li>Open to remote or on-site work in Kampala.</li>
              <li>CV available on request.</li>
            </ul>
            <Link className="btn btn-primary btn-block" to="/contact">
              Contact me <Icon name="arrow" size={18} />
            </Link>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
