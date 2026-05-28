import React from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useApp } from '../services/AppContext';

interface SpaceBackgroundProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

export const SpaceBackground: React.FC<SpaceBackgroundProps> = ({ children, scrollable = true }) => {
  const { colors, temaAtivo } = useApp();

  const innerContent = (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={temaAtivo === 'light' ? 'dark-content' : 'light-content'} 
        backgroundColor={colors.background} 
      />
      {scrollable ? (
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          style={[styles.scroll, { backgroundColor: colors.background }]}
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
  },
  scrollContent: {
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
export default SpaceBackground;
