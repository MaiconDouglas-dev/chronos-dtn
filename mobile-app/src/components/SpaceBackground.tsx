import React from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, StatusBar, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface SpaceBackgroundProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

export const SpaceBackground: React.FC<SpaceBackgroundProps> = ({ children, scrollable = true }) => {
  const innerContent = (
    <View style={styles.container}>
      {/* Ambient Space Glows */}
      <View style={[styles.glowBall, styles.glowPurple]} />
      <View style={[styles.glowBall, styles.glowCyan]} />
      <View style={styles.content}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E1B" />
      {scrollable ? (
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          style={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {innerContent}
        </ScrollView>
      ) : (
        innerContent
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#0B0E1B',
  },
  scrollContent: {
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0E1B',
  },
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0B0E1B',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 16,
    zIndex: 1,
  },
  glowBall: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.12,
  },
  glowPurple: {
    width: width * 1.0,
    height: width * 1.0,
    backgroundColor: '#8A57FF',
    top: -width * 0.4,
    right: -width * 0.4,
  },
  glowCyan: {
    width: width * 1.0,
    height: width * 1.0,
    backgroundColor: '#00F2FE',
    bottom: -width * 0.5,
    left: -width * 0.5,
  },
});
export default SpaceBackground;
