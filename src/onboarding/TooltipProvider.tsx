import React, {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { LayoutChangeEvent } from 'react-native';
import {
  Animated,
  type HostInstance,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { calculateTooltipPosition } from './positioning';
import { TooltipCard } from './TooltipCard';
import { TooltipContext } from './TooltipContext';
import { TooltipOverlay } from './TooltipOverlay';
import type {
  RegisteredTarget,
  Size,
  TargetMeasurement,
  TooltipContextValue,
  TooltipStep,
  Viewport,
} from './types';

type TooltipProviderProps = PropsWithChildren<{
  steps: TooltipStep[];
  cardWidth?: number;
  spacing?: number;
  highlightPadding?: number;
  overlayColor?: string;
  onFinish?: () => void;
  onClose?: () => void;
}>;

const DEFAULT_CARD_HEIGHT = 210;
const MAX_MEASURE_ATTEMPTS = 40;

const waitForNextFrame = () =>
  new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

const settleLayout = async () => {
  await waitForNextFrame();
  await waitForNextFrame();
};

function measureView(
  target: RegisteredTarget,
  rootOrigin: { x: number; y: number },
): Promise<TargetMeasurement> {
  return new Promise((resolve, reject) => {
    const view = target.ref.current;

    if (!view) {
      reject(new Error('Target is not mounted.'));
      return;
    }

    view.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) {
        reject(new Error('Target has no measurable dimensions.'));
        return;
      }

      resolve({
        x: x - rootOrigin.x,
        y: y - rootOrigin.y,
        width,
        height,
      });
    });
  });
}

const isFullyVisible = (target: TargetMeasurement, viewport: Viewport) =>
  target.x >= viewport.x &&
  target.y >= viewport.y &&
  target.x + target.width <= viewport.x + viewport.width &&
  target.y + target.height <= viewport.y + viewport.height;

export function TooltipProvider({
  cardWidth = 320,
  children,
  highlightPadding = 8,
  onClose,
  onFinish,
  overlayColor = 'rgba(15, 23, 42, 0.68)',
  spacing = 14,
  steps,
}: TooltipProviderProps) {
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const rootRef = useRef<HostInstance>(null);
  const registryRef = useRef(new Map<string, RegisteredTarget>());
  const stepsRef = useRef(steps);
  const sequenceRef = useRef(0);
  const hasPresentedTargetRef = useRef(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.97)).current;
  const cardPosition = useRef(new Animated.ValueXY()).current;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [target, setTarget] = useState<TargetMeasurement | null>(null);
  const [rootOrigin, setRootOrigin] = useState({ x: 0, y: 0 });
  const [rootSize, setRootSize] = useState({
    width: window.width,
    height: window.height,
  });
  const [tooltipSize, setTooltipSize] = useState<Size>({
    width: Math.min(cardWidth, window.width - 24),
    height: DEFAULT_CARD_HEIGHT,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentStep = activeIndex === null ? null : steps[activeIndex] ?? null;

  const viewport = useMemo<Viewport>(() => {
    const x = Math.max(0, insets.left - rootOrigin.x);
    const y = Math.max(0, insets.top - rootOrigin.y);
    const right = Math.min(
      rootSize.width,
      window.width - insets.right - rootOrigin.x,
    );
    const bottom = Math.min(
      rootSize.height,
      window.height - insets.bottom - rootOrigin.y,
    );

    return {
      x,
      y,
      width: Math.max(0, right - x),
      height: Math.max(0, bottom - y),
    };
  }, [insets, rootOrigin, rootSize, window.height, window.width]);

  const actualCardWidth = Math.min(
    currentStep?.tooltipWidth ?? cardWidth,
    Math.max(1, viewport.width - 24),
  );
  stepsRef.current = steps;
  const transitionConfigRef = useRef({
    actualCardWidth,
    insets,
    spacing,
    tooltipSize,
    window,
  });
  transitionConfigRef.current = {
    actualCardWidth,
    insets,
    spacing,
    tooltipSize,
    window,
  };

  const position = useMemo(
    () =>
      target && currentStep
        ? calculateTooltipPosition({
            target,
            tooltip: { ...tooltipSize, width: actualCardWidth },
            viewport,
            placement: currentStep.placement,
            spacing: currentStep.spacing ?? spacing,
          })
        : null,
    [actualCardWidth, currentStep, spacing, target, tooltipSize, viewport],
  );

  const measureRoot = useCallback(() => {
    rootRef.current?.measureInWindow((x, y, width, height) => {
      setRootOrigin({ x, y });
      setRootSize({ width, height });
    });
  }, []);

  const registerTarget = useCallback(
    (testID: string, registeredTarget: RegisteredTarget) => {
      registryRef.current.set(testID, registeredTarget);

      return () => {
        if (registryRef.current.get(testID) === registeredTarget) {
          registryRef.current.delete(testID);
        }
      };
    },
    [],
  );

  const stop = useCallback(() => {
    sequenceRef.current += 1;
    Animated.timing(opacity, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      hasPresentedTargetRef.current = false;
      setActiveIndex(null);
      setTarget(null);
      setIsTransitioning(false);
    });
  }, [opacity]);

  const start = useCallback(
    (startIndex = 0) => {
      if (!steps.length) {
        return;
      }

      hasPresentedTargetRef.current = false;
      setActiveIndex(Math.min(Math.max(startIndex, 0), steps.length - 1));
    },
    [steps.length],
  );

  const previous = useCallback(() => {
    setActiveIndex(index => (index === null ? null : Math.max(0, index - 1)));
  }, []);

  const next = useCallback(() => {
    if (activeIndex === null) {
      return;
    }

    if (activeIndex >= steps.length - 1) {
      onFinish?.();
      stop();
      return;
    }

    setActiveIndex(activeIndex + 1);
  }, [activeIndex, onFinish, steps.length, stop]);

  const close = useCallback(() => {
    onClose?.();
    stop();
  }, [onClose, stop]);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const step = stepsRef.current[activeIndex];
    if (!step) {
      return;
    }

    const sequence = ++sequenceRef.current;
    setIsTransitioning(true);
    measureRoot();

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    const resolveTarget = async () => {
      await step.beforeMeasure?.();
      await settleLayout();

      const transitionConfig = transitionConfigRef.current;

      const measuredRoot = await new Promise<{
        origin: { x: number; y: number };
        size: Size;
      }>((resolve, reject) => {
        const root = rootRef.current;
        if (!root) {
          reject(new Error('TooltipProvider root is not mounted.'));
          return;
        }
        root.measureInWindow((x, y, width, height) =>
          resolve({ origin: { x, y }, size: { width, height } }),
        );
      });
      const localViewport: Viewport = {
        x: Math.max(0, transitionConfig.insets.left - measuredRoot.origin.x),
        y: Math.max(0, transitionConfig.insets.top - measuredRoot.origin.y),
        width: Math.max(
          0,
          Math.min(
            measuredRoot.size.width,
            transitionConfig.window.width -
              transitionConfig.insets.right -
              measuredRoot.origin.x,
          ) - Math.max(0, transitionConfig.insets.left - measuredRoot.origin.x),
        ),
        height: Math.max(
          0,
          Math.min(
            measuredRoot.size.height,
            transitionConfig.window.height -
              transitionConfig.insets.bottom -
              measuredRoot.origin.y,
          ) - Math.max(0, transitionConfig.insets.top - measuredRoot.origin.y),
        ),
      };
      setRootOrigin(measuredRoot.origin);
      setRootSize(measuredRoot.size);

      let registeredTarget: RegisteredTarget | undefined;

      for (let attempt = 0; attempt < MAX_MEASURE_ATTEMPTS; attempt += 1) {
        if (sequence !== sequenceRef.current) {
          return;
        }

        registeredTarget = registryRef.current.get(step.targetTestID);
        if (registeredTarget?.ref.current) {
          break;
        }
        await waitForNextFrame();
      }

      if (!registeredTarget) {
        if (__DEV__) {
          console.warn(
            `[TooltipProvider] No TooltipTarget registered for testID "${step.targetTestID}".`,
          );
        }
        opacity.setValue(0);
        setActiveIndex(null);
        setTarget(null);
        setIsTransitioning(false);
        return;
      }

      let measurement = await measureView(
        registeredTarget,
        measuredRoot.origin,
      );

      if (
        !isFullyVisible(measurement, localViewport) &&
        registeredTarget.ensureVisible
      ) {
        await registeredTarget.ensureVisible();
        await settleLayout();

        let prior: TargetMeasurement | null = null;
        for (let attempt = 0; attempt < MAX_MEASURE_ATTEMPTS; attempt += 1) {
          measurement = await measureView(
            registeredTarget,
            measuredRoot.origin,
          );
          const stable =
            prior &&
            Math.abs(prior.x - measurement.x) < 1 &&
            Math.abs(prior.y - measurement.y) < 1;

          if (isFullyVisible(measurement, localViewport) && stable) {
            break;
          }

          prior = measurement;
          await waitForNextFrame();
        }
      }

      if (sequence !== sequenceRef.current) {
        return;
      }

      const initialPosition = calculateTooltipPosition({
        target: measurement,
        tooltip: {
          ...transitionConfig.tooltipSize,
          width: transitionConfig.actualCardWidth,
        },
        viewport: localViewport,
        placement: step.placement,
        spacing: step.spacing ?? transitionConfig.spacing,
      });
      if (!hasPresentedTargetRef.current) {
        cardPosition.setValue({ x: initialPosition.x, y: initialPosition.y });
      }
      hasPresentedTargetRef.current = true;
      setTarget(measurement);
      setIsTransitioning(false);
      scale.setValue(0.97);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 18,
          stiffness: 220,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    };

    resolveTarget().catch(error => {
      if (__DEV__) {
        console.warn('[TooltipProvider] Could not show tooltip target.', error);
      }
      if (sequence === sequenceRef.current) {
        opacity.setValue(0);
        setActiveIndex(null);
        setTarget(null);
        setIsTransitioning(false);
      }
    });
  }, [
    activeIndex,
    cardPosition,
    measureRoot,
    opacity,
    rootSize.height,
    rootSize.width,
    scale,
  ]);

  useEffect(() => {
    if (!position) {
      return;
    }

    Animated.spring(cardPosition, {
      toValue: { x: position.x, y: position.y },
      damping: 22,
      stiffness: 240,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [cardPosition, position]);

  const onRootLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setRootSize({ width, height });
      requestAnimationFrame(measureRoot);
    },
    [measureRoot],
  );

  const onCardLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setTooltipSize(previousSize =>
      previousSize.width === width && previousSize.height === height
        ? previousSize
        : { width, height },
    );
  }, []);

  const contextValue = useMemo<TooltipContextValue>(
    () => ({
      currentStep,
      currentStepIndex: activeIndex ?? -1,
      isActive: activeIndex !== null,
      isTransitioning,
      next,
      previous,
      registerTarget,
      start,
      stop,
      totalSteps: steps.length,
    }),
    [
      activeIndex,
      currentStep,
      isTransitioning,
      next,
      previous,
      registerTarget,
      start,
      steps.length,
      stop,
    ],
  );

  return (
    <TooltipContext.Provider value={contextValue}>
      <View ref={rootRef} onLayout={onRootLayout} style={styles.root}>
        {children}
        {activeIndex !== null && target && currentStep && position ? (
          <Animated.View
            pointerEvents="box-none"
            style={[StyleSheet.absoluteFill, { opacity }]}
            testID="tooltip-walkthrough"
          >
            <TooltipOverlay
              color={overlayColor}
              containerHeight={rootSize.height}
              containerWidth={rootSize.width}
              padding={currentStep.highlightPadding ?? highlightPadding}
              target={target}
            />
            <Animated.View
              style={[
                styles.cardPosition,
                {
                  transform: [
                    { translateX: cardPosition.x },
                    { translateY: cardPosition.y },
                    { scale },
                  ],
                },
              ]}
            >
              <TooltipCard
                disabled={isTransitioning}
                onClose={close}
                onLayout={onCardLayout}
                onNext={next}
                onPrevious={previous}
                position={position}
                step={currentStep}
                stepIndex={activeIndex}
                totalSteps={steps.length}
                width={actualCardWidth}
              />
            </Animated.View>
          </Animated.View>
        ) : null}
      </View>
    </TooltipContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  cardPosition: {
    left: 0,
    position: 'absolute',
    top: 0,
  },
});
