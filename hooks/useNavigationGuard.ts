import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNavigationGuard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Surveiller les tentatives de navigation non-SPA
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.tagName === 'A') {
        const anchor = target as HTMLAnchorElement;
        const href = anchor.href;
        
        // ✅ Détecter les liens internes qui devraient utiliser React Router
        if (href.includes(window.location.hostname) && !anchor.target) {
          const path = new URL(href).pathname;
          
          // ✅ Intercepter et utiliser React Router
          if (path !== window.location.pathname) {
            console.log('🔀 Navigation interceptée:', path);
            e.preventDefault();
            navigate(path);
          }
        }
      }
    };

    // ✅ Surveiller les changements d'URL
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      console.log('📍 PushState:', args[2]);
      return originalPushState.apply(this, args);
    };

    history.replaceState = function(...args) {
      console.log('📍 ReplaceState:', args[2]);
      return originalReplaceState.apply(this, args);
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [navigate]);
};