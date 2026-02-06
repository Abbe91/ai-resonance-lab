import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          </div>
          <span className="font-mono text-lg tracking-wider text-foreground">
            RESONA
          </span>
        </Link>

        <nav className="flex items-center gap-4 md:gap-6">
          <NavLink to="/" active={location.pathname === '/'}>
            Live Feed
          </NavLink>
          <NavLink to="/entities" active={location.pathname === '/entities'}>
            Entities
          </NavLink>
          <NavLink to="/graph" active={location.pathname === '/graph'}>
            Network
          </NavLink>
          <NavLink to="/ethics" active={location.pathname === '/ethics'}>
            Ethics
          </NavLink>
          <NavLink to="/abstract" active={location.pathname === '/abstract'}>
            Abstract
          </NavLink>
          <NavLink to="/identity" active={location.pathname === '/identity'}>
            Identity
          </NavLink>
          <NavLink to="/why" active={location.pathname === '/why'}>
            Why
          </NavLink>
          <NavLink to="/charter" active={location.pathname === '/charter'}>
            Charter
          </NavLink>
          <NavLink to="/ancestors" active={location.pathname === '/ancestors'}>
            Ancestors
          </NavLink>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span className="w-2 h-2 rounded-full bg-resonance animate-pulse" />
            <span>Observing</span>
          </div>
        </div>
      </div>
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
