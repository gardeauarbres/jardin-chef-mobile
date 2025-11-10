import { NavLink } from './NavLink';
import { Home, Users, FileText, Hammer, Wallet, Clock } from 'lucide-react';

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="grid grid-cols-6 h-16">
        <NavLink
          to="/"
          className="flex flex-col items-center justify-center text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Accueil</span>
        </NavLink>
        
        <NavLink
          to="/clients"
          className="flex flex-col items-center justify-center text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">Clients</span>
        </NavLink>
        
        <NavLink
          to="/quotes"
          className="flex flex-col items-center justify-center text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs mt-1">Devis</span>
        </NavLink>
        
        <NavLink
          to="/sites"
          className="flex flex-col items-center justify-center text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Hammer className="h-5 w-5" />
          <span className="text-xs mt-1">Chantiers</span>
        </NavLink>
        
        <NavLink
          to="/employees"
          className="flex flex-col items-center justify-center text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Clock className="h-5 w-5" />
          <span className="text-xs mt-1">Employés</span>
        </NavLink>
        
        <NavLink
          to="/payments"
          className="flex flex-col items-center justify-center text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Wallet className="h-5 w-5" />
          <span className="text-xs mt-1">Paiements</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileNav;
