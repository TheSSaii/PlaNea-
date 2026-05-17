import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Plan, Subplan } from '../types/plan.types';
import { planService } from '../services/planService';
import BottomNav from '../components/BottomNav';

const TRANSPORT_LABEL: Record<string, string> = {
  WALKING: 'A pie', PUBLIC: 'Transp. Público',
  CAR: 'Carro', BICYCLE: 'Bicicleta', MIXED: 'Mixto',
};
const TRANSPORT_ICON: Record<string, string> = {
  WALKING: '🚶', PUBLIC: '🚌', CAR: '🚗', BICYCLE: '🚲', MIXED: '🔀',
};

export default function PlanDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan]         = useState<Plan | null>(null);
  const [loading, setLoading]   = useState(true);
  const [newPlace, setNewPlace] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [showAdd, setShowAdd]   = useState(false);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const data = await planService.getOne(id);
    setPlan(data);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleAddSubplan = async () => {
    if (!newPlace.trim() || !plan) return;
    setSaving(true);
    await planService.addSubplan(plan.id, {
      placeName: newPlace.trim(),
      notes:     newNotes.trim() || undefined,
      order:     plan.subplans.length,
    });
    setNewPlace(''); setNewNotes(''); setShowAdd(false); setSaving(false);
    load();
  };

  const handleRemove = async (subplanId: string) => {
    if (!plan) return;
    await planService.removeSubplan(plan.id, subplanId);
    load();
  };

  const handleMove = async (subplans: Subplan[], index: number, dir: -1 | 1) => {
    if (!plan) return;
    const next = index + dir;
    if (next < 0 || next >= subplans.length) return;
    const reordered = [...subplans];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    await planService.reorderSubplans(plan.id, reordered.map(s => s.id));
    load();
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!plan) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500 font-medium">Plan no encontrado</p>
    </div>
  );

  const sorted = [...plan.subplans].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">

      {/* ── Header ── */}
      <header className="bg-white px-4 pt-12 pb-4 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/plans')}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100
                         hover:bg-slate-200 transition-colors shrink-0"
            >
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor"
                   strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="text-lg font-bold text-slate-900 truncate">{plan.name}</h1>
          </div>
          <button
            onClick={() => navigate(`/plans/${plan.id}/edit`)}
            className="shrink-0 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors ml-3"
          >
            Guardar
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 flex flex-col gap-4">

        {/* ── Plan summary ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
            Editar Plan
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Fecha',       value: new Date(plan.scheduledAt).toLocaleDateString('es-CO', { dateStyle: 'medium' }) },
              { label: 'Personas',    value: `${plan.numberOfPeople} personas` },
              { label: 'Presupuesto', value: `$${Number(plan.budget).toLocaleString('es-CO')}` },
              { label: 'Transporte',  value: `${TRANSPORT_ICON[plan.transport]} ${TRANSPORT_LABEL[plan.transport]}` },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">{item.label}</p>
                <p className="font-semibold text-slate-700 text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Lugares ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Lugares en la ruta</h2>

          {/* Search / Add input */}
          {!showAdd ? (
            <div className="flex flex-col gap-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                     fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  placeholder="Buscar lugares para agregar"
                  onClick={() => setShowAdd(true)}
                  readOnly
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5
                             text-sm text-slate-400 cursor-pointer focus:outline-none
                             hover:border-slate-300 transition-colors"
                />
              </div>
              <button
                onClick={() => setShowAdd(true)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white
                           text-sm font-bold py-3 rounded-xl hover:bg-blue-700
                           active:scale-[0.98] transition-all shadow-sm shadow-blue-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                Añadir lugar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                     fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
                  <circle cx="12" cy="11" r="3"/>
                </svg>
                <input
                  placeholder="Nombre del lugar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent transition-all"
                  value={newPlace}
                  onChange={e => setNewPlace(e.target.value)}
                  autoFocus
                />
              </div>
              <input
                placeholder="Notas (opcional)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5
                           text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent transition-all"
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAdd(false); setNewPlace(''); setNewNotes(''); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold
                             text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddSubplan}
                  disabled={saving || !newPlace.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold
                             hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  {saving ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Lista de subplanes ── */}
        {sorted.length > 0 && (
          <div className="flex flex-col gap-2">
            {sorted.map((sub, index) => (
              <div key={sub.id}
                   className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm
                              flex items-center gap-3 hover:border-slate-300 transition-colors">

                {/* Número */}
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center
                                justify-center text-sm font-bold shrink-0 shadow-sm shadow-blue-200">
                  {index + 1}
                </div>

                {/* Placeholder imagen */}
                <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0 overflow-hidden flex items-center
                                justify-center text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 18h16.5M3.75 4.5h16.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V5.25a.75.75 0 01.75-.75z"/>
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{sub.placeName}</p>
                  {sub.notes && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">{sub.notes}</p>
                  )}
                </div>

                {/* Controles subir/bajar */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMove(sorted, index, -1)}
                    disabled={index === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-lg
                               hover:bg-slate-100 disabled:opacity-25 transition-all text-slate-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMove(sorted, index, 1)}
                    disabled={index === sorted.length - 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg
                               hover:bg-slate-100 disabled:opacity-25 transition-all text-slate-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                </div>

                {/* Eliminar */}
                <button
                  onClick={() => handleRemove(sub.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl
                             text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {sorted.length === 0 && !showAdd && (
          <div className="bg-white border border-slate-200 rounded-2xl text-center py-12 px-6 shadow-sm">
            <p className="text-4xl mb-3">📍</p>
            <p className="font-semibold text-slate-500 text-sm">Agrega lugares a tu ruta</p>
            <p className="text-xs text-slate-400 mt-1">Los lugares aparecerán aquí en orden</p>
          </div>
        )}

        {/* Botones inferiores */}
        {sorted.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate(`/plans/${plan.id}/edit`)}
              className="flex items-center justify-center gap-2 border border-slate-200
                         bg-white text-slate-700 font-semibold text-sm py-3.5 rounded-2xl
                         hover:bg-slate-50 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Editar Plan
            </button>
            <button
              className="flex items-center justify-center gap-2 border border-slate-200
                         bg-white text-slate-700 font-semibold text-sm py-3.5 rounded-2xl
                         hover:bg-slate-50 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              Ver en mapa
            </button>
          </div>
        )}

        {sorted.length > 0 && (
          <button
            onClick={() => navigate('/plans')}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl
                       hover:bg-blue-700 active:scale-[0.98] transition-all
                       shadow-lg shadow-blue-200 text-sm"
          >
            Guardar cambios
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
