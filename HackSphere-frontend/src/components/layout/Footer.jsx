import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageContainer from '../common/PageContainer';
import Logo from '../common/Logo';
import { footerNavigation } from '../../constants/navigation';

const socialLinks = [
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Twitter, href: 'https://x.com', label: 'X / Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:hello@hacksphere.dev', label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white/70">
      <PageContainer className="py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 font-semibold text-text-primary">
              <Logo className="h-9 w-auto text-brand-600 drop-shadow-sm" />
              <span className="text-lg tracking-tight font-bold">HackSphere</span>
            </Link>
            <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary">
              A polished hackathon platform for teams, judges, and organizers who want a calmer, faster way to run serious events.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-text-secondary transition hover:border-brand-200 hover:text-brand-700"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {footerNavigation.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-text-primary">{group.title}</h3>
                <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.href} className="transition hover:text-brand-700">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 HackSphere. All rights reserved.</p>
          <p>Built for modern hackathon operations.</p>
        </div>
      </PageContainer>
    </footer>
  );
}
