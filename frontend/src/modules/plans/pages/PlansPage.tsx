import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Plan } from '../types/plan.types';
import { planService } from '../services/planService';
import PlanCard from '../components/PlanCard';
import BottomNav from '../components/BottomNav';
import {
  Button,
  EmptyState,
  PageContent,
  PageHeader,
  PageShell,
  PageTitleBlock,
  StatGrid,
  TabSwitch,
} from '../../../shared/ui';

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
      setActive(all.filter((p) => p.status === 'FUTURE' || p.status === 'DRAFT'));
      setPast(all.filter((p) => p.status === 'PAST'));
    } catch {
      setError('No se pudieron cargar los planes. Revisa que el backend esté activo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const shown = tab === 'active' ? active : past;
  const totalBudget = active.reduce((sum, plan) => sum + Number(plan.budget || 0), 0);
  const nextPlan = active
    .filter((plan) => plan.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  return (
    <PageShell>
      <PageHeader>
        <PageTitleBlock
          eyebrow="QuePlan"
          title="Mis planes"
          subtitle="Tus salidas organizadas sin perder el ritmo."
          action={
            <Button variant="primary" size="sm" onClick={() => navigate('/plans/new')}>
              Nuevo
            </Button>
          }
        />

        <StatGrid
          items={[
            { label: 'Activos', value: active.length, tone: 'brand' },
            { label: 'Completados', value: past.length, tone: 'success' },
            { label: 'Presupuesto', value: `$${totalBudget.toLocaleString('es-CO')}`, tone: 'neutral' },
          ]}
        />

        {nextPlan && (
          <button
            type="button"
            onClick={() => navigate(`/plans/${nextPlan.id}`)}
            className="surface-card flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:border-sky-200"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Próximo plan</p>
              <p className="truncate text-sm font-semibold text-slate-950">{nextPlan.name}</p>
            </div>
            <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              {new Date(nextPlan.scheduledAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
            </span>
          </button>
        )}

        <TabSwitch
          tabs={[
            { id: 'active', label: 'Mis planes', count: active.length },
            { id: 'past', label: 'Completados', count: past.length },
          ]}
          activeId={tab}
          onChange={(id) => setTab(id as 'active' | 'past')}
        />
      </PageHeader>

      <PageContent>
        {error ? (
          <p className="auth-error">{error}</p>
        ) : loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-card h-36 animate-pulse" aria-hidden />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            tone="slate"
            title={tab === 'active' ? 'No tienes planes activos' : 'Aún no tienes planes completados'}
            description={
              tab === 'active'
                ? 'Crea uno y empieza a escoger lugares para tu ruta.'
                : 'Cuando completes un plan, aparecerá aquí.'
            }
            actionLabel={tab === 'active' ? 'Crear mi primer plan' : undefined}
            onAction={tab === 'active' ? () => navigate('/plans/new') : undefined}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {shown.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onUpdate={load} />
            ))}
          </div>
        )}
      </PageContent>

      <BottomNav />
    </PageShell>
  );
}
