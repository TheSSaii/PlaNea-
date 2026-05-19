import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';

const tabs = [
  {
    path: '/mapa',
    label: 'Mapa',
    icon: (active: boolean) => (
      <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    path: '/plans',
    label: 'Planes',
    icon: (active: boolean) => (
      <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    path: '/plans/new',
    label: 'Crear',
    fab: true,
    icon: (_active: boolean) => (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    path: '/forum',
    label: 'Foro',
    icon: (active: boolean) => (
      <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5m-9 5l2.8-2.1A2 2 0 018 16.5h8A4.5 4.5 0 0020.5 12v-2A4.5 4.5 0 0016 5.5H8A4.5 4.5 0 003.5 10v2c0 1.06.37 2.04.99 2.82L4 19z" />
      </svg>
    ),
  },
  {
    path: '/logout',
    label: 'Salir',
    danger: true,
    icon: (active: boolean) => (
      <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H9m4 8H6a2 2 0 01-2-2V6a2 2 0 012-2h7" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="bottom-nav-wrap">
      <nav className="bottom-nav" aria-label="Navegación principal">
        {tabs.map((tab) => {
          const active =
            tab.path === '/logout'
              ? false
              : tab.path === '/plans/new'
                ? location.pathname === '/plans/new'
                : tab.path === '/plans'
                  ? location.pathname.startsWith('/plans') && location.pathname !== '/plans/new'
                  : location.pathname.startsWith(tab.path);

          const handleClick = () => {
            if (tab.path === '/logout') {
              logout();
              navigate('/login', { replace: true });
              return;
            }
            navigate(tab.path);
          };

          if (tab.fab) {
            return (
              <button
                key={tab.path}
                type="button"
                onClick={handleClick}
                className="bottom-nav-item"
                aria-label="Crear plan"
              >
                <span className="bottom-nav-fab">{tab.icon(active)}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.path}
              type="button"
              onClick={handleClick}
              className={[
                'bottom-nav-item',
                active ? 'bottom-nav-item--active' : '',
                tab.danger ? 'bottom-nav-item--danger' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {tab.icon(active)}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
