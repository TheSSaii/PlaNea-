import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/mapa', label: 'Mapa', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )},
  { path: '/plans', label: 'Planes', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )},
  { path: '/plans/new', label: 'Crear', icon: () => (
    <div className="w-12 h-12 rounded-full flex items-center justify-center -mt-6 shadow-lg bg-blue-600">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </div>
  )},
  { path: '/forum', label: 'Foro', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5m-9 5l2.8-2.1A2 2 0 018 16.5h8A4.5 4.5 0 0020.5 12v-2A4.5 4.5 0 0016 5.5H8A4.5 4.5 0 003.5 10v2c0 1.06.37 2.04.99 2.82L4 19z" />
    </svg>
  )},
  { path: '/logout', label: 'Salir', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H9m4 8H6a2 2 0 01-2-2V6a2 2 0 012-2h7" />
    </svg>
  )},
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-[min(calc(100%_-_1.5rem),34rem)] -translate-x-1/2 pb-3 pointer-events-none">
      <div className="grid grid-cols-5 items-end rounded-[1.35rem] border border-slate-200/80 bg-white/95 px-2 pb-2 pt-2 shadow-2xl shadow-slate-900/15 backdrop-blur-xl pointer-events-auto">
        {tabs.map(tab => {
          const active = tab.path === '/logout'
            ? false
            : tab.path === '/plans/new'
              ? location.pathname === '/plans/new'
              : tab.path === '/plans'
                ? location.pathname.startsWith('/plans') && location.pathname !== '/plans/new'
              : location.pathname.startsWith(tab.path);
          const handleClick = () => {
            if (tab.path === '/logout') {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('forum_username');
              navigate('/login', { replace: true });
              return;
            }

            navigate(tab.path);
          };

          return (
            <button key={tab.path} onClick={handleClick}
              className={`mx-auto flex h-14 w-full max-w-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-2xl transition-all duration-200
                ${active && tab.label !== 'Crear' ? 'bg-blue-50 text-blue-600 shadow-sm' : tab.label === 'Salir' ? 'text-red-400 hover:bg-red-50' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}
                ${active && tab.label === 'Crear' ? 'text-blue-600' : ''}`}>
              {tab.icon(active)}
              {tab.label !== 'Crear' && <span className="text-[10px] font-bold leading-none">{tab.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
