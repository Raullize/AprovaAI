/**
 * Simulation domain types shared across services and components.
 * Single source of truth for SimulationMode — update here only.
 */

export type SimulationMode = 'PRACTICE' | 'EXAM';

export interface SimulationModeConfig {
  label: string;
  description: string;
}

export const SIMULATION_MODE_CONFIG: Record<SimulationMode, SimulationModeConfig> = {
  PRACTICE: {
    label: 'Treino',
    description: 'Feedback imediato após cada questão',
  },
  EXAM: {
    label: 'Exame',
    description: 'Tempo limitado, sem feedback durante a prova',
  },
};
