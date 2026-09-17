import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { TargetMeasurement } from './types';

type TooltipOverlayProps = {
  target: TargetMeasurement;
  containerWidth: number;
  containerHeight: number;
  color: string;
  padding: number;
  borderRadius?: number;
};

export function TooltipOverlay({
  borderRadius = 14,
  color,
  containerHeight,
  containerWidth,
  padding,
  target,
}: TooltipOverlayProps) {
  const left = Math.max(0, target.x - padding);
  const top = Math.max(0, target.y - padding);
  const right = Math.min(containerWidth, target.x + target.width + padding);
  const bottom = Math.min(containerHeight, target.y + target.height + padding);

  return (
    <View
      pointerEvents="box-none"
      style={StyleSheet.absoluteFill}
      testID="tooltip-overlay"
    >
      <View style={[styles.overlay, { backgroundColor: color, height: top }]} />
      <View
        style={[
          styles.overlay,
          styles.leftOverlay,
          {
            backgroundColor: color,
            top,
            width: left,
            bottom: containerHeight - bottom,
          },
        ]}
      />
      <View
        style={[
          styles.overlay,
          styles.rightOverlay,
          {
            backgroundColor: color,
            left: right,
            top,
            bottom: containerHeight - bottom,
          },
        ]}
      />
      <View
        style={[
          styles.overlay,
          styles.bottomOverlay,
          { backgroundColor: color, top: bottom },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.highlight,
          {
            borderRadius,
            left,
            top,
            width: right - left,
            height: bottom - top,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  leftOverlay: {
    left: 0,
  },
  rightOverlay: {
    right: 0,
  },
  bottomOverlay: {
    bottom: 0,
    right: 0,
  },
  highlight: {
    position: 'absolute',
    borderColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 2,
  },
});
