import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { TooltipPosition } from './types';

type TooltipArrowProps = {
  color: string;
  placement: TooltipPosition['placement'];
  arrowX: number;
  arrowY: number;
  size?: number;
};

export function TooltipArrow({
  arrowX,
  arrowY,
  color,
  placement,
  size = 10,
}: TooltipArrowProps) {
  const common = {
    position: 'absolute' as const,
    width: 0,
    height: 0,
  };

  if (placement === 'top') {
    return (
      <View
        pointerEvents="none"
        style={[
          common,
          styles.vertical,
          {
            bottom: -size,
            left: arrowX - size,
            borderTopColor: color,
            borderTopWidth: size,
          },
        ]}
      />
    );
  }

  if (placement === 'bottom') {
    return (
      <View
        pointerEvents="none"
        style={[
          common,
          styles.vertical,
          {
            top: -size,
            left: arrowX - size,
            borderBottomColor: color,
            borderBottomWidth: size,
          },
        ]}
      />
    );
  }

  if (placement === 'left') {
    return (
      <View
        pointerEvents="none"
        style={[
          common,
          styles.horizontal,
          {
            right: -size,
            top: arrowY - size,
            borderLeftColor: color,
            borderLeftWidth: size,
          },
        ]}
      />
    );
  }

  return (
    <View
      pointerEvents="none"
      style={[
        common,
        styles.horizontal,
        {
          left: -size,
          top: arrowY - size,
          borderRightColor: color,
          borderRightWidth: size,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  vertical: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 10,
    borderRightColor: 'transparent',
    borderRightWidth: 10,
  },
  horizontal: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 10,
    borderTopColor: 'transparent',
    borderTopWidth: 10,
  },
});
