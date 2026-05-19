import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreatePlanPayload, TransportType } from '../types/plan.types';
import { planService } from '../services/planService';
import BottomNav from '../components/BottomNav';
import { BackButton, Button, FormCard, Input, PageContent, PageHeader, PageShell } from '../../../shared/ui';

const TRANSPORT_OPTIONS: { value: TransportType; label: string; icon: string }[] = [
  { value: 'WALKING',  label: 'A pie',              icon: 'A' },
  { value: 'CAR',      label: 'Carro',              icon: 'C' },
  { value: 'PUBLIC',   label: 'Transp. Publico',    icon: 'P' },
  { value: 'BICYCLE',  label: 'Bicicleta',          icon: 'B' },
  { value: 'MIXED',    label: 'Mixto',              icon: 'M' },
];

export default function CreatePlanPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreatePlanPayload>({
    name: '', numberOfPeople: 1, budget: 0, transport: 'PUBLIC', scheduledAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = <K extends keyof CreatePlanPayload>(field: K, value: CreatePlanPayload[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim())    { setError('El nombre del plan es obligatorio'); return; }
    if (!form.scheduledAt)    { setError('La fecha y hora son obligatorias');  return; }
    if (form.budget < 0)      { setError('El presupuesto no puede ser negativo'); return; }
    if (form.numberOfPeople < 1) { setError('Debe haber al menos 1 persona'); return; }
    setLoading(true); setError('');
    try {
      const plan = await planService.create({
        ...form,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
      });
      navigate(`/plans/${plan.id}`);
    } catch {
      setError('No se pudo crear el plan. Revisa que el backend esté activo.');
      setLoading(false);
    }
  };

  const statusLabel = !form.scheduledAt
    ? null
    : new Date(form.scheduledAt) > new Date() ? 'Futuro' : 'Pasado';

  return (
    <PageShell>

      <PageHeader>
        <div className="page-header-row">
          <BackButton onClick={() => navigate(-1)} />
          <div className="page-title-copy">
            <p className="page-eyebrow">QuePlan</p>
            <h1 className="page-title text-xl">Crear plan</h1>
          </div>
        </div>
      </PageHeader>

      <PageContent>

        {/* Nombre */}
        <FormCard label="Nombre del plan">
          <Input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ej: Noche con amigos"
          />
        </FormCard>

        {/* Personas + Presupuesto */}
        <div className="grid grid-cols-2 gap-3">
          <div className="form-card">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-3">
              Número de personas
            </label>
            <div className="flex items-center justify-between border border-slate-200 rounded-xl
                            overflow-hidden bg-slate-50">
              <button
                type="button"
                onClick={() => set('numberOfPeople', Math.max(1, form.numberOfPeople - 1))}
                className="w-10 h-10 flex items-center justify-center text-slate-500
                           hover:bg-slate-200 hover:text-slate-800 font-bold text-lg transition-colors"
              >−</button>
              <span className="font-bold text-slate-800 text-base">{form.numberOfPeople}</span>
              <button
                type="button"
                onClick={() => set('numberOfPeople', form.numberOfPeople + 1)}
                className="w-10 h-10 flex items-center justify-center text-slate-500
                           hover:bg-slate-200 hover:text-slate-800 font-bold text-lg transition-colors"
              >+</button>
            </div>
          </div>

          <div className="form-card">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-3">
              Presupuesto total
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
              <input
                type="number" min={0}
                value={form.budget || ''}
                onChange={e => set('budget', Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2.5
                           text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent placeholder:text-slate-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Transporte */}
        <div className="form-card">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-3">
            Transporte
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TRANSPORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('transport', opt.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                            border-2 transition-all active:scale-95
                  ${form.transport === opt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                <span className="inline-icon">{opt.label[0]}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="form-card">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
            Fecha y Hora
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                   fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <input
                type="date"
                value={form.scheduledAt ? form.scheduledAt.slice(0, 10) : ''}
                onChange={e => {
                  const time = form.scheduledAt ? form.scheduledAt.slice(11, 16) : '00:00';
                  set('scheduledAt', `${e.target.value}T${time}`);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-3
                           text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent text-slate-700 transition-all"
              />
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                   fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <input
                type="time"
                value={form.scheduledAt ? form.scheduledAt.slice(11, 16) : ''}
                onChange={e => {
                  const date = form.scheduledAt ? form.scheduledAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
                  set('scheduledAt', `${date}T${e.target.value}`);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-3
                           text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent text-slate-700 transition-all"
              />
            </div>
          </div>
          {statusLabel && (
            <div className={`mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5
                            rounded-full border ${statusLabel === 'Futuro'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusLabel === 'Futuro' ? 'bg-blue-500' : 'bg-emerald-500'}`}/>
              Estado del plan: {statusLabel}
            </div>
          )}
        </div>

        {/* Estado del plan label (cuando no hay fecha) */}
        {!statusLabel && (
          <div className="form-card">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
              Estado del plan
            </p>
            <p className="text-sm text-slate-400">Borrador</p>
          </div>
        )}

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

        {/* Botón crear */}
        <Button variant="primary" size="lg" fullWidth onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creando plan...' : 'Crear plan'}
        </Button>
      </PageContent>

      <BottomNav />
    </PageShell>
  );
}
