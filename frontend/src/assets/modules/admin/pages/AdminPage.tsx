import { useEffect, useState } from 'react';
import type { CreatePlanPayload, Plan, TransportType } from '../../../plans/types/plan.types';

type AdminStats = {
  total: number;
  draft: number;
  future: number;
  past: number;
  uniqueUsers: number;
};

type RawPlan = {
  id: string;
  createdById?: string;
  title?: string;
  peopleCount?: number;
  budgetCents?: number;
  eventAt?: string;
  status?: 'DRAFT' | 'OPEN' | 'FINALIZED' | 'CANCELED' | 'BLOCKED';
  subplans?: Plan['subplans'];
  createdAt?: string;
};

type EditForm = CreatePlanPayload;

const api = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
};

const adaptPlan = (raw: RawPlan): Plan => {
  const scheduledAt = raw.eventAt ?? new Date().toISOString();
  const status: Plan['status'] =
    raw.status === 'DRAFT' ? 'DRAFT'
      : raw.status === 'OPEN' && new Date(scheduledAt) > new Date() ? 'FUTURE'
        : 'PAST';
  return {
    id: raw.id,
    userId: raw.createdById ?? '',
    name: raw.title ?? '',
    numberOfPeople: raw.peopleCount ?? 1,
    budget: raw.budgetCents != null ? raw.budgetCents / 100 : 0,
    transport: 'PUBLIC',
    scheduledAt,
    status,
    subplans: raw.subplans ?? [],
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  DRAFT:  { label: 'Borrador',  cls: 'bg-slate-100 text-slate-600 border-slate-200',      dot: 'bg-slate-400' },
  FUTURE: { label: 'Futuro',    cls: 'bg-blue-50 text-blue-700 border-blue-200',           dot: 'bg-blue-500' },
  PAST:   { label: 'Pasado',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',  dot: 'bg-emerald-500' },
};

const TRANSPORT_OPTIONS: { value: TransportType; label: string; icon: string }[] = [
  { value: 'WALKING',  label: 'A pie',              icon: '🚶' },
  { value: 'PUBLIC',   label: 'Transporte público', icon: '🚌' },
  { value: 'CAR',      label: 'Carro',              icon: '🚗' },
  { value: 'BICYCLE',  label: 'Bicicleta',          icon: '🚲' },
  { value: 'MIXED',    label: 'Mixto',              icon: '🔀' },
];

const STAT_ICONS: Record<string, string> = {
  Total: '📋', Borrador: '📝', Futuros: '📅', Pasados: '✅', Usuarios: '👥',
};

export default function AdminPage() {
  const [plans, setPlans]     = useState<Plan[]>([]);
  const [stats, setStats]     = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [editId, setEditId]   = useState<string | null>(null);
  const [editData, setEditData] = useState<EditForm>({
    name: '', numberOfPeople: 1, budget: 0, transport: 'PUBLIC', scheduledAt: '',
  });

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [p, s] = await Promise.all([
        api<RawPlan[]>('/admin/plans'),
        api<AdminStats>('/admin/plans/stats'),
      ]);
      setPlans(p.map(adaptPlan));
      setStats(s);
    } catch {
      setError('No se pudo cargar el panel admin. Revisa el backend en localhost:3000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminar "${name}"?`)) return;
    setSaving(true); setError('');
    try {
      await api<{ message: string }>(`/admin/plans/${id}`, { method: 'DELETE' });
      await load();
    } catch {
      setError('No se pudo eliminar el plan.');
    } finally { setSaving(false); }
  };

  const handleEditOpen = (plan: Plan) => {
    setEditId(plan.id);
    setEditData({
      name: plan.name,
      numberOfPeople: plan.numberOfPeople,
      budget: Number(plan.budget),
      transport: plan.transport,
      scheduledAt: plan.scheduledAt.slice(0, 16),
    });
  };

  const handleEditSave = async () => {
    if (!editId) return;
    setSaving(true); setError('');
    try {
      await api<RawPlan>(`/admin/plans/${editId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editData.name,
          peopleCount: editData.numberOfPeople,
          budgetCents: Math.round(Number(editData.budget) * 100),
          eventAt: new Date(editData.scheduledAt).toISOString(),
        }),
      });
      setEditId(null);
      await load();
    } catch {
      setError('No se pudo guardar la edición.');
    } finally { setSaving(false); }
  };

  const filtered = plans.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">Q</span>
            </div>
            <div>
              <p className="text-[10px] text-blue-600 uppercase tracking-widest font-bold leading-none">quePlan</p>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Panel administrador</h1>
            </div>
          </div>
          <a
            href="/plans"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600
                       bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Vista usuario
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700
                          rounded-xl p-4 text-sm">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            {error}
          </div>
        )}

        {/* ── Stats ── */}
        {stats && (
          <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total',    value: stats.total },
              { label: 'Borrador', value: stats.draft },
              { label: 'Futuros',  value: stats.future },
              { label: 'Pasados',  value: stats.past },
              { label: 'Usuarios', value: stats.uniqueUsers },
            ].map(s => (
              <div key={s.label}
                   className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm
                              hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{s.label}</p>
                  <span className="text-lg">{STAT_ICONS[s.label]}</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              </div>
            ))}
          </section>
        )}

        {/* ── Tabla ── */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

          {/* toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center
                          justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Planes registrados</h2>
              <p className="text-sm text-slate-400 mt-0.5">Gestiona y edita todos los planes desde aquí.</p>
            </div>
            <div className="relative w-full md:w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                   fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/>
              </svg>
              <input
                placeholder="Buscar por nombre..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5
                           text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all"
              />
            </div>
          </div>

          {/* body */}
          {loading ? (
            <div className="p-6 flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Plan', 'Usuario', 'Fecha', 'Personas', 'Presupuesto', 'Estado', 'Acciones'].map(h => (
                      <th key={h}
                          className="text-left px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(plan => {
                    const cfg = STATUS_CONFIG[plan.status];
                    return (
                      <tr key={plan.id}
                          className="hover:bg-slate-50/70 transition-colors duration-100 group">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-sm text-slate-900 group-hover:text-blue-600
                                        transition-colors">{plan.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {plan.subplans?.length ?? 0} lugar(es)
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-400 font-mono max-w-[130px] truncate
                                        bg-slate-100 px-2 py-1 rounded-lg">
                            {plan.userId || '—'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                          {new Date(plan.scheduledAt).toLocaleDateString('es-CO', { dateStyle: 'medium' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor"
                                 strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                            </svg>
                            <span className="text-sm text-slate-700 font-medium">{plan.numberOfPeople}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                          ${Number(plan.budget).toLocaleString('es-CO')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold
                                           px-3 py-1.5 rounded-full border ${cfg?.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg?.dot}`} />
                            {cfg?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              disabled={saving}
                              onClick={() => handleEditOpen(plan)}
                              className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100
                                         border border-blue-100 px-3 py-1.5 rounded-lg
                                         disabled:opacity-40 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              disabled={saving}
                              onClick={() => handleDelete(plan.id, plan.name)}
                              className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100
                                         border border-red-100 px-3 py-1.5 rounded-lg
                                         disabled:opacity-40 transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-slate-500 font-medium text-sm">No hay planes para mostrar.</p>
                  {search && (
                    <button onClick={() => setSearch('')}
                            className="mt-3 text-blue-600 text-sm font-semibold hover:underline">
                      Limpiar búsqueda
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ── Modal editar ── */}
      {editId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center
                        z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

            {/* modal header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Editar plan</h2>
              <button
                onClick={() => setEditId(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100
                           hover:bg-slate-200 transition-colors text-slate-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* modal body */}
            <div className="px-6 py-5 flex flex-col gap-4">

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                  Nombre del plan
                </label>
                <input
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent transition-all"
                  placeholder="Nombre del plan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                    Personas
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setEditData({ ...editData, numberOfPeople: Math.max(1, editData.numberOfPeople - 1) })}
                      className="px-3 py-2.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800
                                 text-lg font-bold transition-colors"
                    >−</button>
                    <span className="flex-1 text-center text-sm font-semibold text-slate-800">
                      {editData.numberOfPeople}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditData({ ...editData, numberOfPeople: editData.numberOfPeople + 1 })}
                      className="px-3 py-2.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800
                                 text-lg font-bold transition-colors"
                    >+</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                    Presupuesto
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
                    <input
                      type="number" min={0}
                      value={editData.budget}
                      onChange={e => setEditData({ ...editData, budget: Math.max(0, +e.target.value || 0) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2.5
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                                 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                  Fecha y hora
                </label>
                <input
                  type="datetime-local"
                  value={editData.scheduledAt}
                  onChange={e => setEditData({ ...editData, scheduledAt: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
                  Transporte
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TRANSPORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditData({ ...editData, transport: opt.value })}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold
                                  border-2 transition-all
                        ${editData.transport === opt.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                    >
                      <span>{opt.icon}</span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* modal footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setEditId(null)}
                disabled={saving}
                className="flex-1 border border-slate-200 text-slate-700 font-semibold py-3
                           rounded-xl hover:bg-slate-50 text-sm disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white font-semibold py-3
                           rounded-xl hover:bg-blue-700 text-sm disabled:opacity-50
                           transition-colors shadow-sm shadow-blue-200"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
