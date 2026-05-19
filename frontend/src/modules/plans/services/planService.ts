import { apiClient } from '../../../lib/axios';
import type { Plan, CreatePlanPayload, Subplan } from '../types/plan.types';

type BackendPlanStatus = 'DRAFT' | 'OPEN' | 'FINALIZED' | 'CANCELED' | 'BLOCKED';

type RawSubplan = {
  id: string;
  planId: string;
  placeName: string;
  placeId?: string;
  order: number;
  notes?: string;
};

type RawPlan = {
  id: string;
  createdById?: string;
  userId?: string;
  title?: string;
  name?: string;
  peopleCount?: number;
  numberOfPeople?: number;
  budgetCents?: number;
  budget?: number;
  transport?: Plan['transport'];
  eventAt?: string;
  scheduledAt?: string;
  status?: BackendPlanStatus;
  subplans?: RawSubplan[];
  createdAt?: string;
};

type PlanPayload = Partial<CreatePlanPayload> & {
  createdById?: string;
  status?: Plan['status'];
};

function mapStatus(raw: RawPlan): Plan['status'] {
  const status = raw.status ?? 'DRAFT';

  if (status === 'DRAFT') return 'DRAFT';
  if (status === 'FINALIZED' || status === 'CANCELED' || status === 'BLOCKED') return 'PAST';

  const date = raw.eventAt ? new Date(raw.eventAt) : null;
  if (!date) return 'FUTURE';
  return date > new Date() ? 'FUTURE' : 'PAST';
}

function adaptPlan(raw: RawPlan): Plan {
  return {
    id: raw.id,
    userId: raw.createdById ?? raw.userId ?? '',
    name: raw.title ?? raw.name ?? '',
    numberOfPeople: raw.peopleCount ?? raw.numberOfPeople ?? 1,
    budget: raw.budgetCents != null ? raw.budgetCents / 100 : (raw.budget ?? 0),
    transport: raw.transport ?? 'PUBLIC',
    scheduledAt: raw.eventAt ?? raw.scheduledAt ?? new Date().toISOString(),
    status: mapStatus(raw),
    subplans: (raw.subplans ?? []).map(adaptSubplan),
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

function adaptSubplan(raw: RawSubplan): Subplan {
  return {
    id: raw.id,
    planId: raw.planId,
    placeName: raw.placeName,
    placeId: raw.placeId,
    order: raw.order,
    notes: raw.notes,
  };
}

function adaptPayload(payload: PlanPayload, createdById?: string) {
  const body: {
    title?: string;
    peopleCount?: number;
    eventAt?: string;
    budgetCents?: number;
    createdById?: string;
    status?: BackendPlanStatus;
  } = {};

  if (payload.name != null) body.title = payload.name;
  if (payload.numberOfPeople != null) body.peopleCount = payload.numberOfPeople;
  if (payload.scheduledAt != null) body.eventAt = new Date(payload.scheduledAt).toISOString();
  if (payload.budget != null) body.budgetCents = Math.round(Number(payload.budget) * 100);

  if (payload.status === 'DRAFT') body.status = 'DRAFT';
  if (payload.status === 'FUTURE') body.status = 'OPEN';
  if (payload.status === 'PAST') body.status = 'FINALIZED';
  if (createdById) body.createdById = createdById;

  return body;
}

export const planService = {
  getAll: (userId?: string, status?: string) => {
    const queryParams: Record<string, string> = {};
    if (userId) queryParams.userId = userId;
    if (status) queryParams.status = status;

    return apiClient
      .get<RawPlan[]>('/plans', { params: queryParams })
      .then(r => r.data.map(adaptPlan));
  },
  
  getOne: (id: string) =>
    apiClient.get<RawPlan>(`/plans/${id}`)
      .then(r => adaptPlan(r.data)),

  create: (payload: CreatePlanPayload & { createdById?: string }) => {
    const createdById =
      payload.createdById ??
      (() => {
        try {
          const raw = localStorage.getItem('user');
          return raw ? JSON.parse(raw).id : undefined;
        } catch {
          return undefined;
        }
      })();

    return apiClient
      .post<RawPlan>('/plans', adaptPayload(payload, createdById))
      .then(r => adaptPlan(r.data));
  },

  update: (id: string, payload: PlanPayload) =>
    apiClient.patch<RawPlan>(`/plans/${id}`, adaptPayload(payload))
      .then(r => adaptPlan(r.data)),

  remove: (id: string) =>
    apiClient.delete(`/plans/${id}`),

  addSubplan: (planId: string, data: Omit<Subplan, 'id' | 'planId'>) =>
    apiClient.post<RawSubplan>(`/plans/${planId}/subplans`, data)
      .then(r => adaptSubplan(r.data)),

  reorderSubplans: (planId: string, orderedIds: string[]) =>
    apiClient.patch(`/plans/${planId}/subplans/reorder`, { orderedIds })
      .then(r => r.data),

  removeSubplan: (planId: string, subplanId: string) =>
    apiClient.delete(`/plans/${planId}/subplans/${subplanId}`),
};
