import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Live Feed' },
  { to: '/entities', label: 'Entities' },
  { to: '/graph', label: 'Network' },
  { to: '/ethics', label: 'Ethics' },
  { to: '/abstract', label: 'Abstract' },
  { to: '/identity', label: 'Identity' },
  { to: '/why', label: 'Why' },
  { to: '/charter', label: 'Charter' },
  { to: '/ancestors', label: 'Ancestors' },
  { to: '/fractures', label: 'Fractures' },
  { to: '/observations', label: 'Observations' },
  { to: '/timeline', label: 'Timeline' },
];

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          </div>
          <span className="font-mono text-lg tracking-wider text-foreground">
            RESONA
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} active={location.pathname === link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Status Indicator - Desktop */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span className="w-2 h-2 rounded-full bg-resonance animate-pulse" />
            <span>Observing</span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl">
          <nav className="container mx-auto px-6 py-4">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm transition-colors ${
                    location.pathname === link.to
                      ? 'bg-primary/10 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {/* Mobile Status */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono mt-4 pt-4 border-t border-border/30">
              <span className="w-2 h-2 rounded-full bg-resonance animate-pulse" />
              <span>Observing</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({ 
  to, 
  children, 
  active 
}: { 
  to: string; 
  children: React.ReactNode; 
  active: boolean;
}) {
  return (
    <Link 
      to={to}
      className={`text-sm transition-colors ${
        active 
          ? 'text-foreground' 
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </Link>
  );
}
