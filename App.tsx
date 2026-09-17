import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TooltipProvider, type TooltipStep } from './src/onboarding';
import { HomeScreen } from './src/screens/HomeScreen';

const homeTooltipSteps: TooltipStep[] = [
  {
    targetTestID: 'home-profile-card',
    title: 'Your profile',
    description: 'Manage your personal details and account preferences here.',
  },
  {
    targetTestID: 'home-balance-card',
    title: 'Your balance',
    description: 'See your available balance and recent account activity.',
  },
  {
    targetTestID: 'home-payment-button',
    title: 'Make a payment',
    description: 'Pay bills or send money in just a few taps.',
  },
  {
    targetTestID: 'home-transfer-button',
    title: 'Transfer money',
    description:
      'Move money securely between your accounts or to someone else.',
  },
  {
    targetTestID: 'home-topup-button',
    title: 'Top up',
    description: 'Add money to your account whenever you need it.',
  },
  {
    targetTestID: 'home-offers',
    title: 'Offers for you',
    description: 'Browse rewards selected for your account.',
  },
  {
    targetTestID: 'home-more',
    title: 'There is more',
    description: 'Find statements, support, security, and other account tools.',
  },
];

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        <TooltipProvider steps={homeTooltipSteps}>
          <HomeScreen />
        </TooltipProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F7FB',
    flex: 1,
  },
});

export default App;
