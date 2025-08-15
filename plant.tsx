// src/data/plans.ts
export interface PlanOption {
  name: string;
  price: number;
  maxAgents: number;
  ticketLimit: number;
  aiFeatures: string;
  extras?: string[];
  popular?: boolean;
}

export const plans: PlanOption[] = [
  {
    name: "Freemium",
    price: 1,
    maxAgents: 3,
    ticketLimit: 200,
    aiFeatures: "IA basique",
  },
  {
    name: "Standard",
    price: 10,
    maxAgents: 5,
    ticketLimit: 500,
    aiFeatures: "IA complète",
    extras: ["Planification de rendez-vous +5€"],
    popular: true,
  },
  {
    name: "Pro",
    price: 20,
    maxAgents: 10,
    ticketLimit: 1000,
    aiFeatures: "Toutes fonctionnalités + vocal & multilingue",
    extras: ["SLA avancé + reporting +5€"],
  },
];
