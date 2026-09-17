import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { TooltipOverlay } from '../src/onboarding/TooltipOverlay';

test('allows touches through the highlighted target cutout', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <TooltipOverlay
        color="rgba(0, 0, 0, 0.5)"
        containerHeight={800}
        containerWidth={390}
        padding={8}
        target={{ x: 20, y: 100, width: 100, height: 60 }}
      />,
    );
  });

  const overlay = renderer!.root.findByProps({ testID: 'tooltip-overlay' });
  expect(overlay.props.pointerEvents).toBe('box-none');
});
