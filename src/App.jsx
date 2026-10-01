/**
 * App — routing for the whole project.
 *   HashRouter is used so the built site works on any static host (GitHub Pages,
 *   Netlify, a shared host) with no server rewrites. URLs look like /#/projects.
 *
 *   Public site  →  /            /about   /projects   /projects/:slug   /experience   /contact
 *   Dashboard    →  /admin       /admin/profile … /admin/settings
 */
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Experience from './pages/Experience.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminApp from './admin/AdminApp.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="experience" element={<Experience />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}
