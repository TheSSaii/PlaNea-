import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Plan } from '../types/plan.types';
import { planService } from '../services/planService';

const STATUS_CONFIG = {
  DRAFT:  { label: 'Pendiente',  cls: 'bg-slate-100 text-slate-600 border-slate-200',     dot: 'bg-slate-400' },
  FUTURE: { label: 'Programado', cls: 'bg-blue-50 text-blue-700 border-blue-200',          dot: 'bg-blue-500' },
  PAST:   { label: 'Completado', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
};

const TRANSPORT_ICON: Record<string, string> = {
  WALKING: '🚶', PUBLIC: '🚌', CAR: '🚗', BICYCLE: '🚲', MIXED: '🔀',
};
const TRANSPORT_LABEL: Record<string, string> = {
  WALKING: 'A pie', PUBLIC: 'Público', CAR: 'Carro', BICYCLE: 'Bicicleta', MIXED: 'Mixto',
};

interface Props {
  plan: Plan;
  onUpdate: () => void;
}

export default function PlanCard({ plan, onUpdate }: Props) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const { label, cls, dot } = STATUS_CONFIG[plan.status];

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Eliminar "${plan.name}"?`)) return;
    setBusy(true);
    try { await planService.remove(plan.id); onUpdate(); }
    finally { setBusy(false); }
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Marcar "${plan.name}" como completado?`)) return;
    setBusy(true);
    try { await planService.update(plan.id, { status: 'PAST' }); onUpdate(); }
    finally { setBusy(false); }
  };

  return (
    <article
      onClick={() => navigate(`/plans/${plan.id}`)}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm cursor-pointer
                 hover:border-blue-200 hover:shadow-md active:scale-[0.99]
                 transition-all duration-200 group"
    >
      {/* ── Top row ── */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900 truncate text-base
                         group-hover:text-blue-600 transition-colors">
            {plan.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {new Date(plan.scheduledAt).toLocaleDateString('es-CO', {
              weekday: 'short', day: 'numeric', month: 'short',
            })}
          </p>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold
                          px-2.5 py-1.5 rounded-full border ${cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dot}`}/>
          {label}
        </span>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wide mb-1">Personas</p>
          <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
            </svg>
            {plan.numberOfPeople}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wide mb-1">Presupuesto</p>
          <p className="text-sm font-bold text-slate-700">${Number(plan.budget).toLocaleString('es-CO')}</p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wide mb-1">Transporte</p>
          <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
            <span>{TRANSPORT_ICON[plan.transport]}</span>
            <span className="truncate">{TRANSPORT_LABEL[plan.transport]}</span>
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        className="flex items-center justify-between gap-3 pt-3.5 border-t border-slate-100"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"/>
            <circle cx="12" cy="11" r="3"/>
          </svg>
          {plan.subplans.length} lugar(es) en ruta
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={e => { e.stopPropagation(); navigate(`/plans/${plan.id}/edit`); }}
            className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100
                       border border-blue-100 px-3 py-1.5 rounded-lg disabled:opacity-40
                       transition-colors"
          >
            Editar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleDelete}
            className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100
                       border border-red-100 px-3 py-1.5 rounded-lg disabled:opacity-40
                       transition-colors"
          >
            Eliminar
          </button>
          {plan.status !== 'PAST' && (
            <button
              type="button"
              disabled={busy}
              onClick={handleComplete}
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100
                         border border-emerald-100 px-3 py-1.5 rounded-lg disabled:opacity-40
                         transition-colors"
            >
              Completar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
