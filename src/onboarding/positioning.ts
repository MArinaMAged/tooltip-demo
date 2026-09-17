import type {
  Size,
  TargetMeasurement,
  TooltipPlacement,
  TooltipPosition,
  Viewport,
} from './types';

export type CalculateTooltipPositionOptions = {
  target: TargetMeasurement;
  tooltip: Size;
  viewport: Viewport;
  placement?: TooltipPlacement;
  spacing?: number;
  edgePadding?: number;
  arrowSize?: number;
  cornerRadius?: number;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), Math.max(minimum, maximum));

export function calculateTooltipPosition({
  target,
  tooltip,
  viewport,
  placement = 'auto',
  spacing = 12,
  edgePadding = 12,
  arrowSize = 10,
  cornerRadius = 16,
}: CalculateTooltipPositionOptions): TooltipPosition {
  const viewportRight = viewport.x + viewport.width;
  const viewportBottom = viewport.y + viewport.height;
  const targetRight = target.x + target.width;
  const targetBottom = target.y + target.height;
  const targetCenterX = target.x + target.width / 2;
  const targetCenterY = target.y + target.height / 2;

  const available: Record<Exclude<TooltipPlacement, 'auto'>, number> = {
    top: target.y - viewport.y - spacing - edgePadding,
    bottom: viewportBottom - targetBottom - spacing - edgePadding,
    left: target.x - viewport.x - spacing - edgePadding,
    right: viewportRight - targetRight - spacing - edgePadding,
  };

  const required: Record<Exclude<TooltipPlacement, 'auto'>, number> = {
    top: tooltip.height,
    bottom: tooltip.height,
    left: tooltip.width,
    right: tooltip.width,
  };

  let resolvedPlacement: Exclude<TooltipPlacement, 'auto'>;

  if (placement !== 'auto') {
    resolvedPlacement = placement;
  } else {
    const placements: Array<Exclude<TooltipPlacement, 'auto'>> = [
      'top',
      'bottom',
      'left',
      'right',
    ];
    placements.sort((a, b) => available[b] - available[a]);
    const fittingPlacements = placements.filter(
      candidate => available[candidate] >= required[candidate],
    );
    const edgePreferences = [
      {
        placement: 'right' as const,
        distance: targetCenterX - viewport.x,
        threshold: viewport.width * 0.25,
      },
      {
        placement: 'left' as const,
        distance: viewportRight - targetCenterX,
        threshold: viewport.width * 0.25,
      },
      {
        placement: 'bottom' as const,
        distance: targetCenterY - viewport.y,
        threshold: viewport.height * 0.25,
      },
      {
        placement: 'top' as const,
        distance: viewportBottom - targetCenterY,
        threshold: viewport.height * 0.25,
      },
    ]
      .filter(
        preference =>
          preference.distance <= preference.threshold &&
          fittingPlacements.includes(preference.placement),
      )
      .sort((a, b) => a.distance / a.threshold - b.distance / b.threshold);

    resolvedPlacement =
      edgePreferences[0]?.placement ?? fittingPlacements[0] ?? placements[0];
  }

  const minimumX = viewport.x + edgePadding;
  const maximumX = viewportRight - edgePadding - tooltip.width;
  const minimumY = viewport.y + edgePadding;
  const maximumY = viewportBottom - edgePadding - tooltip.height;

  let x = targetCenterX - tooltip.width / 2;
  let y = targetCenterY - tooltip.height / 2;

  switch (resolvedPlacement) {
    case 'top':
      y = target.y - spacing - tooltip.height;
      break;
    case 'bottom':
      y = targetBottom + spacing;
      break;
    case 'left':
      x = target.x - spacing - tooltip.width;
      break;
    case 'right':
      x = targetRight + spacing;
      break;
  }

  x = clamp(x, minimumX, maximumX);
  y = clamp(y, minimumY, maximumY);

  const arrowInset = cornerRadius + arrowSize;
  const arrowX = clamp(
    targetCenterX - x,
    arrowInset,
    tooltip.width - arrowInset,
  );
  const arrowY = clamp(
    targetCenterY - y,
    arrowInset,
    tooltip.height - arrowInset,
  );

  return { x, y, placement: resolvedPlacement, arrowX, arrowY };
}
