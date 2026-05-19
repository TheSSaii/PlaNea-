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
  const totalBudget = active.reduce((sum, plan) => sum + Number(plan.budget || 0), 0);
  const nextPlan = active
    .filter(plan => plan.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  return (
    <div className="page-shell bg-[radial-gradient(circle_at_top,#e0f2fe_0,#f8fafc_34rem)]">
      <div className="page-header">
        <div className="page-header-inner flex-col items-stretch">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-sky-700 font-bold uppercase tracking-widest">quePlan</p>
              <h1 className="text-3xl font-black text-slate-950 tracking-tight">Mis planes</h1>
              <p className="mt-1 text-sm text-slate-500">Tus salidas organizadas sin perder el ritmo.</p>
            </div>
            <button
              onClick={() => navigate('/plans/new')}
              className="shrink-0 bg-sky-600 text-white text-sm font-black px-4 py-2.5 rounded-2xl
                         hover:bg-sky-700 active:scale-95 transition shadow-lg shadow-sky-600/20"
            >
              Nuevo
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-sky-500">Activos</p>
              <p className="mt-1 text-lg font-black text-sky-700">{active.length}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-emerald-500">Completados</p>
              <p className="mt-1 text-lg font-black text-emerald-700">{past.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Presupuesto</p>
              <p className="mt-1 truncate text-lg font-black text-slate-800">${totalBudget.toLocaleString('es-CO')}</p>
            </div>
          </div>

          {nextPlan && (
            <button
              onClick={() => navigate(`/plans/${nextPlan.id}`)}
              className="mt-3 flex w-full items-center justify-between gap-3 rounded-3xl border border-sky-100 bg-white px-4 py-3 text-left shadow-sm shadow-sky-900/5 transition hover:border-sky-200 hover:shadow-lg hover:shadow-sky-900/10 active:scale-[0.99]"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-500">Proximo plan</p>
                <p className="truncate text-sm font-black text-slate-950">{nextPlan.name}</p>
              </div>
              <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                {new Date(nextPlan.scheduledAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
              </span>
            </button>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => setTab('active')}
              className={`px-4 py-2.5 rounded-xl text-sm font-black transition
                ${tab === 'active'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'}`}
            >
              Mis planes {active.length > 0 && `(${active.length})`}
            </button>
            <button
              onClick={() => setTab('past')}
              className={`px-4 py-2.5 rounded-xl text-sm font-black transition
                ${tab === 'past'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'}`}
            >
              Completados {past.length > 0 && `(${past.length})`}
            </button>
          </div>
        </div>
      </div>

      <main className="page-content">
        {error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm font-semibold">
            {error}
          </div>
        ) : loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl h-36 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="section-card overflow-hidden text-center">
            <div className="bg-gradient-to-br from-slate-950 to-sky-700 px-6 py-12 text-white">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black">
                +
              </div>
              <p className="text-lg font-black">
              {tab === 'active'
                ? 'No tienes planes activos'
                : 'Aun no tienes planes completados'}
              </p>
              <p className="mt-2 text-sm text-sky-100">
                {tab === 'active'
                  ? 'Crea uno y empieza a escoger lugares para tu ruta.'
                  : 'Cuando completes un plan, aparecera aqui.'}
              </p>
            {tab === 'active' && (
              <button
                onClick={() => navigate('/plans/new')}
                className="mt-6 bg-white text-sky-700 text-sm font-black px-6 py-3
                           rounded-2xl hover:bg-sky-50 transition shadow-lg shadow-slate-950/20"
              >
                Crear mi primer plan
              </button>
            )}
            </div>
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
