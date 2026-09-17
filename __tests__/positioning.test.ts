import { calculateTooltipPosition } from '../src/onboarding';

const viewport = { x: 0, y: 20, width: 390, height: 800 };
const tooltip = { width: 220, height: 150 };

describe('calculateTooltipPosition', () => {
  it('places the tooltip below a target near the top', () => {
    const result = calculateTooltipPosition({
      target: { x: 150, y: 34, width: 60, height: 44 },
      tooltip,
      viewport,
    });

    expect(result.placement).toBe('bottom');
    expect(result.y).toBe(90);
  });

  it('places the tooltip above a target near the bottom', () => {
    const result = calculateTooltipPosition({
      target: { x: 150, y: 750, width: 60, height: 44 },
      tooltip,
      viewport,
    });

    expect(result.placement).toBe('top');
    expect(result.y).toBe(588);
  });

  it('uses the right side for a target near the left edge', () => {
    const result = calculateTooltipPosition({
      target: { x: 12, y: 335, width: 44, height: 44 },
      tooltip,
      viewport,
    });

    expect(result.placement).toBe('right');
    expect(result.x).toBe(68);
  });

  it('uses the left side for a target near the right edge', () => {
    const result = calculateTooltipPosition({
      target: { x: 334, y: 335, width: 44, height: 44 },
      tooltip,
      viewport,
    });

    expect(result.placement).toBe('left');
    expect(result.x).toBe(102);
  });

  it('clamps a forced placement inside the safe viewport', () => {
    const result = calculateTooltipPosition({
      target: { x: 2, y: 40, width: 20, height: 20 },
      tooltip,
      viewport,
      placement: 'top',
      edgePadding: 12,
    });

    expect(result.x).toBe(12);
    expect(result.y).toBe(32);
    expect(result.x + tooltip.width).toBeLessThanOrEqual(378);
    expect(result.y + tooltip.height).toBeLessThanOrEqual(808);
  });

  it('moves and clamps the arrow toward the target center', () => {
    const result = calculateTooltipPosition({
      target: { x: 0, y: 100, width: 20, height: 30 },
      tooltip,
      viewport,
      placement: 'bottom',
    });

    expect(result.arrowX).toBe(26);
    expect(result.arrowY).toBeGreaterThanOrEqual(26);
    expect(result.arrowY).toBeLessThanOrEqual(124);
  });
});
