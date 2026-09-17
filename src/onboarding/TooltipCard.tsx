import React from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TooltipArrow } from './TooltipArrow';
import type { TooltipPosition, TooltipStep } from './types';

type TooltipCardProps = {
  step: TooltipStep;
  stepIndex: number;
  totalSteps: number;
  position: TooltipPosition;
  width: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
  disabled?: boolean;
  backgroundColor?: string;
};

export function TooltipCard({
  backgroundColor = '#FFFFFF',
  disabled,
  onClose,
  onLayout,
  onNext,
  onPrevious,
  position,
  step,
  stepIndex,
  totalSteps,
  width,
}: TooltipCardProps) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  return (
    <View
      accessibilityViewIsModal
      onLayout={onLayout}
      style={[styles.card, { backgroundColor, width }]}
      testID="tooltip-card"
    >
      <TooltipArrow
        arrowX={position.arrowX}
        arrowY={position.arrowY}
        color={backgroundColor}
        placement={position.placement}
      />
      <Pressable
        accessibilityLabel="Close walkthrough"
        accessibilityRole="button"
        hitSlop={12}
        onPress={onClose}
        style={styles.closeButton}
        testID="tooltip-close"
      >
        <Text style={styles.closeText}>×</Text>
      </Pressable>

      <Text accessibilityRole="header" style={styles.title}>
        {step.title}
      </Text>
      <Text style={styles.description}>{step.description}</Text>
      <Text style={styles.counter}>
        {stepIndex + 1} of {totalSteps}
      </Text>

      <View style={styles.actions}>
        {!isFirst ? (
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={onPrevious}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
            testID="tooltip-previous"
          >
            <Text style={styles.secondaryButtonText}>Previous</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onNext}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
          testID={isLast ? 'tooltip-finish' : 'tooltip-next'}
        >
          <Text style={styles.primaryButtonText}>
            {isLast ? 'Finish' : 'Next  →'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    elevation: 12,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  closeButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 10,
    width: 28,
    zIndex: 1,
  },
  closeText: {
    color: '#667085',
    fontSize: 26,
    lineHeight: 27,
  },
  title: {
    color: '#101828',
    fontSize: 20,
    fontWeight: '700',
    paddingRight: 24,
  },
  description: {
    color: '#475467',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  counter: {
    color: '#667085',
    fontSize: 13,
    marginTop: 16,
    textAlign: 'right',
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  secondaryButton: {
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#344054',
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#155EEF',
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
});
