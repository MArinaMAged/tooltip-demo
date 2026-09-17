import type React from 'react';
import type { HostInstance } from 'react-native';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export type TargetMeasurement = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Viewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TooltipStep = {
  targetTestID: string;
  title: string;
  description: string;
  placement?: TooltipPlacement;
  /** Useful for virtualized FlatList items that are not mounted yet. */
  beforeMeasure?: () => void | Promise<void>;
  highlightPadding?: number;
  tooltipWidth?: number;
  spacing?: number;
};

export type TooltipPosition = {
  x: number;
  y: number;
  placement: Exclude<TooltipPlacement, 'auto'>;
  /** Arrow center on the card's local x-axis for top/bottom placements. */
  arrowX: number;
  /** Arrow center on the card's local y-axis for left/right placements. */
  arrowY: number;
};

export type RegisteredTarget = {
  ref: React.RefObject<HostInstance | null>;
  ensureVisible?: () => void | Promise<void>;
};

export type TooltipController = {
  isActive: boolean;
  isTransitioning: boolean;
  currentStep: TooltipStep | null;
  currentStepIndex: number;
  totalSteps: number;
  start: (startIndex?: number) => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
};

export type TooltipRegistry = {
  registerTarget: (testID: string, target: RegisteredTarget) => () => void;
};

export type TooltipContextValue = TooltipController & TooltipRegistry;
