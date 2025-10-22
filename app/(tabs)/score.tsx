// app/(tabs)/score.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import axiosClient from '../../lib/axios';

// Type definitions
interface ScoreDetails {
  parking_events_id: number;
  time_factor: number;
  landmarks_recalled: number;
  no_of_landmarks: number;
  path_performance: number;
  peek_penalty: number;
  assist_penalty: number;
  task_score: number;
  calculated_at: string;
  parking_location_name?: string;
  parking_address?: string;
  started_at: string;
  ended_at: string;
}

interface ScoreSession {
  label: string;
  date?: string;
  score: ScoreDetails;
}

export default function ScoreScreen() {
  const [scores, setScores] = useState<ScoreDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Fetch scores from your backend
      const response = await axiosClient.get('/scores');
      setScores(response.data);
    } catch (err: any) {
      console.error('Error fetching scores:', err);
      setError('Failed to load scores');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchScores(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getSessionLabel = (score: ScoreDetails, index: number): string => {
    if (index === 0) return 'Latest Session';
    return formatDate(score.calculated_at);
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const renderScoreCard = (score: ScoreDetails, index: number) => {
    const label = getSessionLabel(score, index);
    const landmarkPercentage = score.no_of_landmarks > 0 
      ? Math.round((score.landmarks_recalled / score.no_of_landmarks) * 100)
      : 0;

    return (
      <View key={score.parking_events_id} style={styles.card}>
        <Text style={styles.cardTitle}>{label}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Time Factor:</Text>
            <Text style={styles.statValue}>{Math.round(score.time_factor)}%</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Landmark Factor:</Text>
            <Text style={styles.statValue}>{landmarkPercentage}%</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Peek Penalty:</Text>
            <Text style={styles.penaltyValue}>{score.peek_penalty || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Assist Penalty:</Text>
            <Text style={styles.penaltyValue}>
              {score.assist_penalty ? formatDuration(score.assist_penalty) : '0s'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalScoreContainer}>
          <Text style={styles.totalScoreLabel}>Total Score:</Text>
          <Text style={styles.totalScoreValue}>{Math.round(score.task_score)}</Text>
        </View>

        {score.parking_location_name && (
          <Text style={styles.locationText} numberOfLines={1}>
            📍 {score.parking_location_name}
          </Text>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="trophy-outline" size={80} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>No Scores Yet</Text>
      <Text style={styles.emptyText}>
        Complete a parking session with navigation to see your scores here
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={60} color={COLORS.error} />
      <Text style={styles.errorTitle}>Unable to Load Scores</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => fetchScores()}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading scores...</Text>
      </View>
    );
  }

  if (error) {
    return renderError();
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {scores.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {scores.map((score, index) => renderScoreCard(score, index))}
            
            {scores.length > 0 && (
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Your Progress</Text>
                <View style={styles.summaryStats}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {Math.round(
                        scores.reduce((acc, s) => acc + s.task_score, 0) / scores.length
                      )}
                    </Text>
                    <Text style={styles.summaryLabel}>Avg Score</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{scores.length}</Text>
                    <Text style={styles.summaryLabel}>Sessions</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {scores.filter(s => s.task_score >= 80).length}
                    </Text>
                    <Text style={styles.summaryLabel}>Great Scores</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  statValue: {
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: '600',
  },
  penaltyValue: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  totalScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalScoreLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  totalScoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.primary,
  },
  locationText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.white,
    opacity: 0.3,
  },
});