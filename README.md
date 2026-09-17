This is a React Native application with a reusable, multi-step onboarding
tooltip system.

# Onboarding tooltips

The implementation lives in `src/onboarding`:

```text
src/onboarding/
├── TooltipProvider.tsx  # registry, controller, measuring, scrolling, transitions
├── TooltipContext.ts    # useTooltip controller hook
├── TooltipTarget.tsx    # testID/ref registration and ScrollView support
├── TooltipOverlay.tsx   # four-panel dimmer with a target cutout
├── TooltipCard.tsx      # content, counter, navigation, and close controls
├── TooltipArrow.tsx     # four-way dynamic pointer
├── positioning.ts       # pure safe-area-aware placement algorithm
├── types.ts             # public TypeScript contracts
└── index.ts             # public exports
```

`src/screens/HomeScreen.tsx` is a working example with left-aligned,
right-aligned, and vertically separated targets. `App.tsx` defines the steps
and installs the provider.

## Basic API

Define steps by `testID`, put one provider above the screen, and wrap each
target. The string is the lookup key; the implementation does not query the
native UI tree.

```tsx
const steps: TooltipStep[] = [
  {
    targetTestID: 'home-profile-card',
    title: 'Profile',
    description: 'Access your profile here.',
  },
  {
    targetTestID: 'home-balance-card',
    title: 'Balance',
    description: 'Check your current balance.',
  },
];

<TooltipProvider steps={steps}>
  <HomeScreen />
</TooltipProvider>;

// Inside HomeScreen:
const tooltip = useTooltip();

<TooltipTarget testID="home-profile-card">
  <ProfileCard />
</TooltipTarget>;

<Button title="Show me around" onPress={() => tooltip.start()} />;
```

`TooltipTarget` keeps a non-collapsible native `View` ref in the provider's
registry under its `testID`. For every step, the provider resolves that entry
and calls `measureInWindow`; no screen coordinate is stored in configuration.

The controller returned by `useTooltip()` exposes `start(startIndex?)`,
`next()`, `previous()`, `stop()`, and the current walkthrough state. The card
also provides Previous, Next, Finish, and Close controls.

## Scrolling

For any target inside a `ScrollView`, pass the shared ref:

```tsx
const scrollRef = useRef<ScrollViewInstance>(null);
const scrollContentRef = useRef<HostInstance>(null);

<ScrollView ref={scrollRef} innerViewRef={scrollContentRef}>
  <Section>
    <TooltipTarget
      testID="home-offers"
      scrollViewRef={scrollRef}
      scrollContentRef={scrollContentRef}
      scrollOffset={24}
    >
      <OfferCard />
    </TooltipTarget>
  </Section>
</ScrollView>;
```

If the first measurement is outside the safe viewport, `TooltipTarget`
measures itself relative to the scroll content, calls animated `scrollTo`,
waits for stable on-screen measurements, and only then shows the new card.
This works when the target is nested in sections because the offset is measured
relative to the native content ancestor.

For a mounted `FlatList` item, pass an `ensureVisible` callback that calls
`scrollToIndex`. For a virtualized item that may not be mounted yet, initiate
the scroll with the step's `beforeMeasure`; the provider then waits for the
item's `TooltipTarget` to register:

```tsx
const steps: TooltipStep[] = [
  {
    targetTestID: 'transaction-42',
    title: 'Transaction details',
    description: 'Tap a transaction to inspect it.',
    beforeMeasure: () =>
      listRef.current?.scrollToIndex({ index: 42, animated: true }),
  },
];

const renderItem = ({ item, index }: ListRenderItemInfo<Transaction>) => (
  <TooltipTarget
    testID={`transaction-${index}`}
    ensureVisible={() =>
      listRef.current?.scrollToIndex({ index, animated: true })
    }
  >
    <TransactionRow transaction={item} />
  </TooltipTarget>
);
```

As with normal `FlatList.scrollToIndex` usage, distant items should use
`getItemLayout` or an `onScrollToIndexFailed` recovery strategy.

## Positioning and arrow behavior

`calculateTooltipPosition` receives only the measured target rectangle,
measured tooltip size, safe viewport, spacing, and requested placement. In
`auto` mode it:

1. Calculates available top, bottom, left, and right space.
2. Prefers the opposite side when the target is near a screen edge.
3. Otherwise chooses the fitting side with the most available space.
4. Clamps the card inside the safe viewport.
5. Projects the target center onto the card edge and clamps the arrow away
   from rounded corners.

The tooltip height is captured with `onLayout`, so longer localized text is
repositioned without fixed dimensions. Position and scale use native-driver
spring animations, while step changes cross-fade around scrolling and
measurement.

Provider defaults (`cardWidth`, `spacing`, `highlightPadding`, `overlayColor`)
can be configured globally. `placement`, `tooltipWidth`, `spacing`, and
`highlightPadding` can be overridden per step.

## Why no walkthrough library?

`react-native-walkthrough-tooltip` is useful for a tooltip locally owned by a
known component. This feature needs a global `testID → ref` registry,
coordination with `ScrollView` and virtualized `FlatList` targets, a four-way
safe-area-aware algorithm, an independently positioned arrow, and a single
multi-step controller. Building those layers around the library would retain
little of its positioning behavior and create two competing overlay
lifecycles, so the implementation uses React Native primitives instead.

The pure positioning behavior is covered in
`__tests__/positioning.test.ts`, including all four sides, viewport clamping,
and arrow bounds.

This project was bootstrapped using
[`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
