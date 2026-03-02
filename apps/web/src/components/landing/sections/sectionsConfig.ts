import { AboutSection } from './AboutSection';
import { HowItWorksSection } from './HowItWorksSection';
import { NodeBasedSection } from './NodeBasedSection';
import { TemplatesSection } from './TemplatesSection';
import { ContributorsSection } from './ContributorsSection';

export interface SectionProps {
  onGetStarted?: () => void;
}

export const sectionsData = [
  {
    id: 'about',
    title: 'About',
    Component: AboutSection,
  },
  {
    id: 'how-it-works',
    title: 'How it works',
    Component: HowItWorksSection,
  },
  {
    id: 'node-based',
    title: 'Node Based',
    Component: NodeBasedSection,
  },
  {
    id: 'templates',
    title: 'Templates',
    Component: TemplatesSection,
  },
  {
    id: 'contributors',
    title: 'Contributors',
    Component: ContributorsSection,
  },
];
