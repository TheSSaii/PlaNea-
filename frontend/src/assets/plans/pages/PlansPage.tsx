import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Plan } from '../types/plan.types';
import { planService } from '../services/planService';
import PlanCard from '../components/PlanCard';
import BottomNav from '../components/BottomNav';

export default function PlansPage() {
  const [active, setActive] = useState<Plan[]>([]);
  const [past, setPast] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const all = await planService.getAll();
      setActive(all.filter(p => p.status === 'FUTURE' || p.status === 'DRAFT'));
      setPast(all.filter(p => p.status === 'PAST'));
    } catch {
      setError('No se pudieron cargar los planes. Revisa que el backend este activo en localhost:3000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const shown = tab === 'active' ? active : past;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white px-4 pt-10 pb-4 sticky top-0 z-10 border-b border-slate-200">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-sky-700 font-bold uppercase tracking-widest">quePlan</p>
              <h1 className="text-2xl font-bold text-slate-950">Mis planes</h1>
            </div>
            <button
              onClick={() => navigate('/plans/new')}
              className="bg-sky-600 text-white text-sm font-semibold px-4 py-2 rounded-xl
                         hover:bg-sky-700 active:scale-95 transition"
            >
              + Nuevo
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTab('active')}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition
                ${tab === 'active'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Mis planes {active.length > 0 && `(${active.length})`}
            </button>
            <button
              onClick={() => setTab('past')}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition
                ${tab === 'past'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Completados {past.length > 0 && `(${past.length})`}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 pt-4">
        {error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-sm">
            {error}
          </div>
        ) : loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl h-32 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl text-center py-14 px-6">
            <p className="text-slate-500 font-medium">
              {tab === 'active'
                ? 'No tienes planes activos'
                : 'Aun no tienes planes completados'}
            </p>
            {tab === 'active' && (
              <button
                onClick={() => navigate('/plans/new')}
                className="mt-6 bg-sky-600 text-white text-sm font-semibold px-6 py-3
                           rounded-xl hover:bg-sky-700 transition"
              >
                Crear mi primer plan
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shown.map(plan => (
              <PlanCard key={plan.id} plan={plan} onUpdate={load} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}