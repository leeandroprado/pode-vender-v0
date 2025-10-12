import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Componente que detecta convites na URL e redireciona para a página correta
 */
export function InviteRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verifica se há um hash na URL
    if (location.hash) {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const type = hashParams.get('type');
      
      // Se for um convite, redireciona para /set-password mantendo o hash
      if (type === 'invite') {
        navigate(`/set-password${location.hash}`, { replace: true });
      }
    }
  }, [location, navigate]);

  return null;
}
