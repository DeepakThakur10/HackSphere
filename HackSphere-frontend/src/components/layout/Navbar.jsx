import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Button from '../ui/Button';
import PageContainer from '../common/PageContainer';
import { primaryNavigation } from '../../constants/navigation';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <PageContainer>
        <div className="flex h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 font-semibold text-text-primary">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-sm font-bold text-white shadow-soft">
              HS
            </span>
            <span className="text-lg tracking-tight">HackSphere</span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {primaryNavigation.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-text-secondary hover:bg-surfaceMuted hover:text-text-primary'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button as={Link} to="/login" variant="ghost" size="md">
              Sign in
            </Button>
            <Button as={Link} to="/signup" size="md">
              Get started
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-text-primary shadow-soft md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-border pb-4 md:hidden">
            <nav className="flex flex-col gap-2 py-4">
              {primaryNavigation.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-medium ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-text-secondary hover:bg-surfaceMuted hover:text-text-primary'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex gap-3">
              <Button as={Link} to="/login" variant="secondary" size="md" className="flex-1" onClick={() => setOpen(false)}>
                Sign in
              </Button>
              <Button as={Link} to="/signup" size="md" className="flex-1" onClick={() => setOpen(false)}>
                Get started
              </Button>
            </div>
          </div>
        ) : null}
      </PageContainer>
    </header>
  );
}
