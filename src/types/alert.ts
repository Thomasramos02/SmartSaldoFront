export const AlertType = {
  GOAL_EXCEED: 'GOAL_EXCEED',
  PATTERN_DETECTED: 'PATTERN_DETECTED',
  EXCESSED_SPENDING: 'excessed_spending',
  IA_GENERATED: 'ia_generated',
} as const;

export type AlertType = typeof AlertType[keyof typeof AlertType];


export interface Alert {
  id: number;
  message: string;
  type: AlertType;
  isRead: boolean;
  createdAt: string; // normalmente vem como string no JSON
}
