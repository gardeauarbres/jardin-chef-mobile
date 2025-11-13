import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const KeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si on est dans un input, textarea ou select
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + chiffres pour navigation rapide
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            navigate('/');
            break;
          case '2':
            e.preventDefault();
            navigate('/clients');
            break;
          case '3':
            e.preventDefault();
            navigate('/quotes');
            break;
          case '4':
            e.preventDefault();
            navigate('/sites');
            break;
          case '5':
            e.preventDefault();
            navigate('/payments');
            break;
          case '6':
            e.preventDefault();
            navigate('/employees');
            break;
        }
      }

      // Ctrl/Cmd + N pour créer nouveau (selon la page)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.shiftKey) {
        const path = window.location.pathname;
        e.preventDefault();
        
        if (path.startsWith('/clients')) {
          navigate('/clients/new');
        } else if (path.startsWith('/quotes')) {
          navigate('/quotes/new');
        } else if (path.startsWith('/sites')) {
          navigate('/sites/new');
        } else if (path.startsWith('/payments')) {
          navigate('/payments/new');
        }
      }

      // Échap pour retourner en arrière
      if (e.key === 'Escape' && window.location.pathname !== '/') {
        const path = window.location.pathname;
        if (path.includes('/new') || path.match(/\/[^/]+\/[^/]+$/)) {
          // Si on est sur une page de création/édition, retourner à la liste
          const basePath = path.split('/').slice(0, 2).join('/');
          navigate(basePath || '/');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, user]);

  return null;
};

