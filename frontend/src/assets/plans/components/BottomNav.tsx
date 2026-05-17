import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/plans', label: 'Inicio', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { path: '/plans/new', label: 'Crear', icon: () => (
    <div className="w-12 h-12 rounded-full flex items-center justify-center -mt-6 shadow-lg bg-blue-600">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </div>
  )},
  { path: '/perfil', label: 'Perfil', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )},
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-lg mx-auto flex items-end justify-around px-4 pb-2 pt-1">
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 min-w-[60px] transition-colors
                ${tab.label === 'Crear' ? 'pb-1' : 'py-1'}
                ${active && tab.label !== 'Crear' ? 'text-blue-600' : 'text-gray-400'}`}>
              {tab.icon(active)}
              {tab.label !== 'Crear' && <span className="text-[10px] font-medium">{tab.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
