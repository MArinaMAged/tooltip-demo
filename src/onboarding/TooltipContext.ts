import { createContext, useContext } from 'react';

import type { TooltipContextValue, TooltipController } from './types';

export const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltip(): TooltipController {
  const context = useContext(TooltipContext);

  if (!context) {
    throw new Error('useTooltip must be used inside a TooltipProvider.');
  }

  return context;
}

export function useTooltipRegistry(): TooltipContextValue {
  const context = useContext(TooltipContext);

  if (!context) {
    throw new Error('TooltipTarget must be used inside a TooltipProvider.');
  }

  return context;
}
