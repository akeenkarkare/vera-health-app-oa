import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SearchStep } from '../types';

interface SearchProgressProps {
  steps: SearchStep[];
}

export const SearchProgress: React.FC<SearchProgressProps> = ({ steps }) => {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={`${step.text}-${index}`} style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <View style={styles.iconContainer}>
              {step.isActive ? (
                <ActivityIndicator size="small" color="#4299E1" />
              ) : step.isCompleted ? (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              ) : (
                <View style={styles.dot} />
              )}
            </View>
            <Text
              style={[
                styles.stepText,
                step.isActive && styles.activeStepText,
                step.isCompleted && styles.completedStepText,
              ]}
            >
              {step.text}
            </Text>
          </View>
          {step.extraInfo && (
            <View style={styles.extraInfo}>
              <Text style={styles.extraInfoText}>{step.extraInfo}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepContainer: {
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E0',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#48BB78',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 14,
    color: '#718096',
    flex: 1,
    lineHeight: 20,
  },
  activeStepText: {
    color: '#2D3748',
    fontWeight: '500',
  },
  completedStepText: {
    color: '#48BB78',
  },
  extraInfo: {
    marginLeft: 36,
    marginTop: 4,
    backgroundColor: '#EDF2F7',
    padding: 8,
    borderRadius: 6,
  },
  extraInfoText: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 18,
  },
});
