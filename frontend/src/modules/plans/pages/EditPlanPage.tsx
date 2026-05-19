import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { CreatePlanPayload, TransportType } from '../types/plan.types';
import { planService } from '../services/planService';
import BottomNav from '../components/BottomNav';

const TRANSPORT_OPTIONS: { value: TransportType; icon: string; label: string }[] = [
  { value: 'WALKING',  icon: 'A', label: 'A pie'           },
  { value: 'CAR',      icon: 'C', label: 'Carro'           },
  { value: 'PUBLIC',   icon: 'P', label: 'Transp. Publico' },
  { value: 'BICYCLE',  icon: 'B', label: 'Bicicleta'       },
  { value: 'MIXED',    icon: 'M', label: 'Mixto'           },
];

export default function EditPlanPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm]       = useState<CreatePlanPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    planService.getOne(id).then(plan => {
      setForm({
        name:           plan.name,
        numberOfPeople: plan.numberOfPeople,
        budget:         Number(plan.budget),
        transport:      plan.transport,
        scheduledAt:    plan.scheduledAt.slice(0, 16),
      });
      setLoading(false);
    });
  }, [id]);

  const set = <K extends keyof CreatePlanPayload>(field: K, value: CreatePlanPayload[K]) =>
    setForm(prev => prev ? ({ ...prev, [field]: value }) : prev);

  const handleSave = async () => {
    if (!form || !id) return;
    if (!form.name.trim())       { setError('El nombre es obligatorio'); return; }
    if (form.budget < 0)         { setError('El presupuesto no puede ser negativo'); return; }
    if (form.numberOfPeople < 1) { setError('Debe haber al menos 1 persona'); return; }
    setSaving(true); setError('');
    try {
      await planService.update(id, {
        ...form,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
      });
      navigate(`/plans/${id}`);
    } catch {
      setError('Error al actualizar.');
      setSaving(false);
    }
  };

  if (loading || !form) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-28">

      {/* ── Header ── */}
      <header className="bg-white px-4 pt-12 pb-4 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100
                         hover:bg-slate-200 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor"
                   strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest leading-none">
                quePlan
              </p>
              <h1 className="text-xl font-bold text-slate-900">Editar plan</h1>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-bold text-blue-600 hover:text-blue-700
                       disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-4">

        {/* Nombre */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
            Nombre
          </label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3
                       text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-transparent transition-all"
          />
        </div>

        {/* Personas + Presupuesto */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-3">
              Personas
            </label>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <button
                type="button"
                onClick={() => set('numberOfPeople', Math.max(1, form.numberOfPeople - 1))}
                className="w-10 h-10 flex items-center justify-center text-slate-500
                           hover:bg-slate-200 hover:text-slate-800 font-bold text-lg transition-colors"
              >−</button>
              <span className="flex-1 text-center font-bold text-slate-800">{form.numberOfPeople}</span>
              <button
                type="button"
                onClick={() => set('numberOfPeople', form.numberOfPeople + 1)}
                className="w-10 h-10 flex items-center justify-center text-slate-500
                           hover:bg-slate-200 hover:text-slate-800 font-bold text-lg transition-colors"
              >+</button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-3">
              Presupuesto (COP)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
              <input
                type="number" min={0}
                value={form.budget}
                onChange={e => set('budget', Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2.5
                           text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Transporte */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-3">
            Transporte
          </label>
          <div className="flex gap-2 flex-wrap">
            {TRANSPORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('transport', opt.value)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold
                            border-2 transition-all active:scale-95
                  ${form.transport === opt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
              >
                <span className="inline-icon">{opt.label[0]}</span><span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
            Fecha y Hora
          </label>
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={e => set('scheduledAt', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3
                       text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-transparent text-slate-700 transition-all"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 text-sm text-red-700 bg-red-50
                          border border-red-200 rounded-xl py-3 px-4">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            {error}
          </div>
        )}

        {/* Guardar */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl
                     hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60
                     transition-all shadow-lg shadow-blue-200 text-sm"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Guardando...
            </span>
          ) : 'Guardar cambios'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
