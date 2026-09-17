import React, { useRef } from 'react';
import {
  Alert,
  type HostInstance,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TooltipTarget, useTooltip } from '../onboarding';

export function HomeScreen() {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const scrollContentRef = useRef<HostInstance>(null);
  const tooltip = useTooltip();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        ref={scrollRef}
        innerViewRef={scrollContentRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>GOOD MORNING</Text>
            <Text style={styles.heading}>Welcome back</Text>
          </View>
          <TooltipTarget
            scrollContentRef={scrollContentRef}
            scrollViewRef={scrollRef}
            style={styles.profileTarget}
            testID="home-profile-card"
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>MA</Text>
            </View>
          </TooltipTarget>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => tooltip.start()}
          style={styles.tourButton}
          testID="start-home-tour"
        >
          <Text style={styles.tourButtonText}>Show me around</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>OVERVIEW</Text>
        <TooltipTarget
          scrollContentRef={scrollContentRef}
          scrollViewRef={scrollRef}
          style={styles.balanceTarget}
          testID="home-balance-card"
        >
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available balance</Text>
            <Text style={styles.balance}>$8,420.50</Text>
            <Text style={styles.balanceHint}>Updated just now</Text>
          </View>
        </TooltipTarget>

        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionsRow}>
          <TooltipTarget
            scrollContentRef={scrollContentRef}
            scrollViewRef={scrollRef}
            style={styles.actionTarget}
            testID="home-payment-button"
          >
            <QuickAction
              icon="$"
              label="Pay"
              onPress={() =>
                Alert.alert('Pay', 'The default Pay action was executed.')
              }
            />
          </TooltipTarget>
          <TooltipTarget
            scrollContentRef={scrollContentRef}
            scrollViewRef={scrollRef}
            style={styles.actionTarget}
            testID="home-transfer-button"
          >
            <QuickAction
              icon="↗"
              label="Transfer"
              onPress={() =>
                Alert.alert(
                  'Transfer',
                  'The default Transfer action was executed.',
                )
              }
            />
          </TooltipTarget>
          <TooltipTarget
            scrollContentRef={scrollContentRef}
            scrollViewRef={scrollRef}
            style={styles.actionTarget}
            testID="home-topup-button"
          >
            <QuickAction
              icon="+"
              label="Top up"
              onPress={() =>
                Alert.alert('Top up', 'The default Top Up action was executed.')
              }
            />
          </TooltipTarget>
        </View>

        <View style={styles.offersHeading}>
          <Text style={styles.sectionTitle}>Offers</Text>
          <Text style={styles.link}>See all</Text>
        </View>
        <TooltipTarget
          scrollContentRef={scrollContentRef}
          scrollViewRef={scrollRef}
          style={styles.rightAlignedTarget}
          testID="home-offers"
        >
          <View style={styles.offerCard}>
            <Text style={styles.offerBadge}>JUST FOR YOU</Text>
            <Text style={styles.offerTitle}>5% cash back</Text>
            <Text style={styles.offerDescription}>
              On your next three grocery purchases.
            </Text>
          </View>
        </TooltipTarget>

        <View style={styles.verticalSpacer} />

        <Text style={styles.sectionTitle}>Account tools</Text>
        <TooltipTarget
          scrollContentRef={scrollContentRef}
          scrollViewRef={scrollRef}
          style={styles.moreTarget}
          testID="home-more"
        >
          <View style={styles.moreCard}>
            <View>
              <Text style={styles.moreTitle}>More services</Text>
              <Text style={styles.moreDescription}>
                Statements, support and security
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TooltipTarget>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.action}
    >
      <View style={styles.actionIcon}>
        <Text style={styles.actionIconText}>{icon}</Text>
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingBottom: 64, paddingHorizontal: 20 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  eyebrow: {
    color: '#667085',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  heading: {
    color: '#101828',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 3,
  },
  profileTarget: { borderRadius: 24 },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#E0EAFF',
    borderColor: '#C7D7FE',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarText: { color: '#3538CD', fontSize: 14, fontWeight: '800' },
  tourButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#155EEF',
    borderRadius: 10,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  tourButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  sectionLabel: {
    color: '#667085',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginTop: 32,
  },
  balanceTarget: { alignSelf: 'stretch', marginTop: 10 },
  balanceCard: { backgroundColor: '#101828', borderRadius: 20, padding: 22 },
  balanceLabel: { color: '#98A2B3', fontSize: 14 },
  balance: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
  },
  balanceHint: { color: '#D0D5DD', fontSize: 12, marginTop: 8 },
  sectionTitle: {
    color: '#101828',
    fontSize: 19,
    fontWeight: '700',
    marginTop: 30,
  },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  actionTarget: { flex: 1 },
  action: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#EAECF0',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
  },
  actionIcon: {
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  actionIconText: { color: '#155EEF', fontSize: 18, fontWeight: '800' },
  actionLabel: {
    color: '#344054',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 9,
  },
  offersHeading: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: { color: '#155EEF', fontSize: 13, fontWeight: '700' },
  rightAlignedTarget: { alignSelf: 'flex-end', marginTop: 14, width: '88%' },
  offerCard: {
    backgroundColor: '#ECFDF3',
    borderColor: '#ABEFC6',
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
  },
  offerBadge: {
    color: '#067647',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  offerTitle: {
    color: '#054F31',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },
  offerDescription: { color: '#067647', fontSize: 14, marginTop: 6 },
  verticalSpacer: { height: 180 },
  moreTarget: { alignSelf: 'flex-start', marginTop: 14, width: '92%' },
  moreCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#EAECF0',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  moreTitle: { color: '#101828', fontSize: 16, fontWeight: '700' },
  moreDescription: { color: '#667085', fontSize: 13, marginTop: 4 },
  chevron: { color: '#98A2B3', fontSize: 30 },
});
