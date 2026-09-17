import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import type { PropsWithChildren, RefObject } from 'react';
import {
  type HostInstance,
  type ScrollViewInstance,
  type StyleProp,
  type ViewStyle,
  View,
} from 'react-native';

import { useTooltipRegistry } from './TooltipContext';

export type TooltipTargetProps = PropsWithChildren<{
  testID: string;
  style?: StyleProp<ViewStyle>;
  /**
   * When supplied, an off-screen target is measured relative to the ScrollView's
   * content container and smoothly scrolled into view without fixed coordinates.
   */
  scrollViewRef?: RefObject<ScrollViewInstance | null>;
  /** Pass the same ref to ScrollView.innerViewRef on React Native 0.87+. */
  scrollContentRef?: RefObject<HostInstance | null>;
  scrollOffset?: number;
  /** Use this for FlatList.scrollToIndex or a custom/nested scrolling strategy. */
  ensureVisible?: () => void | Promise<void>;
}>;

export const TooltipTarget = forwardRef<HostInstance, TooltipTargetProps>(
  function TooltipTargetComponent(
    {
      children,
      ensureVisible,
      scrollContentRef,
      scrollOffset = 24,
      scrollViewRef,
      style,
      testID,
    },
    forwardedRef,
  ) {
    const targetRef = useRef<HostInstance>(null);
    const { registerTarget } = useTooltipRegistry();

    useImperativeHandle(forwardedRef, () => targetRef.current as HostInstance);

    const scrollIntoView = useCallback(async () => {
      if (ensureVisible) {
        await ensureVisible();
        return;
      }

      const scrollView = scrollViewRef?.current;
      const target = targetRef.current;

      if (!scrollView || !target) {
        return;
      }

      const innerView =
        scrollContentRef?.current ?? scrollView.getInnerViewRef();

      if (!innerView) {
        return;
      }

      await new Promise<void>((resolve, reject) => {
        target.measureLayout(
          innerView,
          (_x, y) => {
            scrollView.scrollTo({
              y: Math.max(0, y - scrollOffset),
              animated: true,
            });
            resolve();
          },
          () => reject(new Error('Unable to measure target in ScrollView.')),
        );
      });
    }, [ensureVisible, scrollContentRef, scrollOffset, scrollViewRef]);

    useEffect(
      () =>
        registerTarget(testID, {
          ref: targetRef,
          ensureVisible:
            ensureVisible || scrollViewRef ? scrollIntoView : undefined,
        }),
      [ensureVisible, registerTarget, scrollIntoView, scrollViewRef, testID],
    );

    return (
      <View ref={targetRef} testID={testID} collapsable={false} style={style}>
        {children}
      </View>
    );
  },
);
