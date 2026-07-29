import { Menu, X, ChevronDown, LayoutDashboard, User, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import PageContainer from '../common/PageContainer';
import { useAuth } from '../../context/authContext';

function getInitials(user) {
  const first = user?.firstName?.charAt(0) || '';
  const last = user?.lastName?.charAt(0) || '';

  return `${first}${last}`.toUpperCase() || 'HS';
}

function capitalize(value) {
  if (!value) {
    return '';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    setOpen(false);
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-text-secondary hover:bg-surfaceMuted hover:text-text-primary'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `rounded-2xl px-4 py-3 text-sm font-medium ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-text-secondary hover:bg-surfaceMuted hover:text-text-primary'
    }`;

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
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/hackathons" className={navLinkClass}>
              Hackathons
            </NavLink>
            {isAuthenticated ? (
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
            ) : null}
          </nav>

          {isAuthenticated ? (
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex items-center gap-3 rounded-full border border-border bg-white py-1.5 pl-1.5 pr-4 shadow-soft transition hover:border-brand-200"
                aria-label="Open account menu"
                aria-expanded={menuOpen}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                  {getInitials(user)}
                </span>
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold text-text-primary">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-xs text-text-secondary">{capitalize(user?.role)}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-text-secondary" />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-border bg-white p-2 shadow-soft">
                  <p className="truncate px-3 py-2 text-sm font-medium text-text-primary">{user?.email}</p>
                  <div className="my-1 border-t border-border" />
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surfaceMuted hover:text-text-primary"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surfaceMuted hover:text-text-primary"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Button as={Link} to="/login" variant="ghost" size="md">
                Sign in
              </Button>
              <Button as={Link} to="/signup" size="md">
                Get started
              </Button>
            </div>
          )}

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
              <NavLink to="/" onClick={() => setOpen(false)} className={mobileNavLinkClass}>
                Home
              </NavLink>
              <NavLink to="/hackathons" onClick={() => setOpen(false)} className={mobileNavLinkClass}>
                Hackathons
              </NavLink>
              {isAuthenticated ? (
                <NavLink to="/dashboard" onClick={() => setOpen(false)} className={mobileNavLinkClass}>
                  Dashboard
                </NavLink>
              ) : null}
              {isAuthenticated ? (
                <NavLink to="/profile" onClick={() => setOpen(false)} className={mobileNavLinkClass}>
                  Profile
                </NavLink>
              ) : null}
            </nav>

            {isAuthenticated ? (
              <Button variant="secondary" size="md" className="w-full" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button as={Link} to="/login" variant="secondary" size="md" className="flex-1" onClick={() => setOpen(false)}>
                  Sign in
                </Button>
                <Button as={Link} to="/signup" size="md" className="flex-1" onClick={() => setOpen(false)}>
                  Get started
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </PageContainer>
    </header>
  );
}