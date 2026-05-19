export type TransportType = 'WALKING' | 'PUBLIC' | 'CAR' | 'BICYCLE' | 'MIXED';
export type PlanStatus = 'DRAFT' | 'FUTURE' | 'PAST';

export interface Subplan {
  id: string;
  planId: string;
  placeName: string;
  placeId?: string;
  order: number;
  notes?: string;
}

export interface Plan {
  id: string;
  userId: string;
  name: string;
  numberOfPeople: number;
  budget: number;
  transport: TransportType;
  scheduledAt: string;
  status: PlanStatus;
  subplans: Subplan[];
  createdAt: string;
}

export type CreatePlanPayload = {
  name: string;
  numberOfPeople: number;
  budget: number;
  transport: TransportType;
  scheduledAt: string;
};