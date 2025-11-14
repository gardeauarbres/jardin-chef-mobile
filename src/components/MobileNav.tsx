import { NavLink } from './NavLink';
import { Home, Users, FileText, Wallet, MoreHorizontal } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';

const MobileNav = () => {
  return (
    <>
      {/* Barre de recherche mobile - visible uniquement sur mobile */}
      <div className="fixed bottom-[72px] left-0 right-0 px-4 pb-2 md:hidden z-40">
        <GlobalSearch />
      </div>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-lg">
        <div className="grid grid-cols-5 h-16 max-w-screen-xl mx-auto">
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
          to="/more"
          className="flex flex-col items-center justify-center text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-xs mt-1">Plus</span>
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
          to="/payments"
          className="flex flex-col items-center justify-center text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Wallet className="h-5 w-5" />
          <span className="text-xs mt-1">Paiements</span>
        </NavLink>
      </div>
    </nav>
    </>
  );
};

export default MobileNav;
