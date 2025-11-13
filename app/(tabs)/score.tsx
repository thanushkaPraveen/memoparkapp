// app/(tabs)/score.tsx 
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useScaledSizes } from '../../features/accessibility';
import axiosClient from '../../lib/axios';

interface ScoreDetails {
  parking_events_id: number;
  time_factor: number;
  landmark_factor: number;
  landmarks_recalled: number;
  no_of_landmarks: number;
  path_performance: number;
  peek_penalty: number;
  assist_penalty: number;
  task_score: number;
  calculated_at: string;
  parking_location_name?: string;
  parking_address?: string;
  started_at?: string;
  ended_at?: string;
  created_at?: string;
  assistance_points: number;
}

export default function ScoreScreen() {
  const { t } = useTranslation();
  const { text, icon } = useScaledSizes();
  
  const [scores, setScores] = useState<ScoreDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scaled font sizes
  const scaledFonts = useMemo(() => ({
    cardTitle: text(18),
    statLabel: text(14),
    statValue: text(16),
    totalScoreLabel: text(16),
    totalScoreValue: text(48),
    locationText: text(12),
    emptyTitle: text(20),
    emptyText: text(14),
    loadingText: text(14),
    errorTitle: text(18),
    errorText: text(14),
    retryButtonText: text(14),
    summaryTitle: text(18),
    summaryValue: text(28),
    summaryLabel: text(12),
  }), [text]);

  // Scaled spacing
  const scaledSpacing = useMemo(() => ({
    containerPadding: text(16),
    cardPadding: text(20),
    cardMarginBottom: text(16),
    cardBorderRadius: text(16),
    cardTitleMargin: text(16),
    statsRowMargin: text(12),
    statItemPadding: text(10),
    dividerMargin: text(16),
    locationMarginTop: text(12),
    emptyIconSize: icon(80),
    emptyTitleMargin: text(16),
    emptyTextMargin: text(8),
    errorIconSize: icon(60),
    errorTitleMargin: text(16),
    errorTextMargin: text(8),
    errorButtonMargin: text(20),
    errorButtonPadding: text(12),
    errorButtonPaddingHorizontal: text(24),
    summaryMarginTop: text(8),
    summaryPadding: text(20),
    summaryTitleMargin: text(16),
    summaryDividerHeight: text(40),
    summaryValueMargin: text(4),
    loadingIconSize: icon(40),
    loadingTextMargin: text(12),
  }), [text, icon]);

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

      const response = await axiosClient.get('/scores');
      setScores(response.data);
    } catch (err: any) {
      console.error('Error fetching scores:', err);
      setError(t('errors.networkError'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchScores(true);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) {
      return t('score.dateUnknown');
    }

    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return t('score.invalidDate');
      }

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return t('score.today');
      } else if (diffDays === 1) {
        return t('score.yesterday');
      } else if (diffDays < 7) {
        return t('score.daysAgo', { count: diffDays });
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (error) {
      return t('score.invalidDate');
    }
  };

  const getSessionLabel = (score: ScoreDetails, index: number): string => {
    if (index === 0) return t('score.latestSession');
    
    const dateToUse = score.calculated_at || score.ended_at || score.created_at;
    return formatDate(dateToUse);
  };

  const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds || seconds === 0) return '0s';
    
    if (seconds < 60) return `${Math.round(seconds)}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const renderScoreCard = (score: ScoreDetails, index: number) => {
    const label = getSessionLabel(score, index);
    
    const landmarkPercentage = score.landmark_factor !== undefined 
      ? Math.round(score.landmark_factor)
      : (score.no_of_landmarks > 0 
          ? Math.round((score.landmarks_recalled / score.no_of_landmarks) * 100)
          : 0);

    const landmark_count = score.no_of_landmarks !== undefined && score.no_of_landmarks !== 0 
    ? `${score.landmarks_recalled}/${score.no_of_landmarks}` 
    : "0/0";

    const peekPenaltyPoints = score.assistance_points || 0;
    const assistPenaltySeconds = score.assist_penalty || 0;
    const assistPenaltyPoints = assistPenaltySeconds > 0 
      ? Math.round(assistPenaltySeconds / 10) 
      : 0;

    return (
      <View 
        key={score.parking_events_id} 
        style={[
          styles.card,
          {
            padding: scaledSpacing.cardPadding,
            marginBottom: scaledSpacing.cardMarginBottom,
            borderRadius: scaledSpacing.cardBorderRadius,
          }
        ]}
      >
        <Text style={[
          styles.cardTitle,
          { 
            fontSize: scaledFonts.cardTitle,
            marginBottom: scaledSpacing.cardTitleMargin,
          }
        ]}>
          {label}
        </Text>
        
        <View style={[
          styles.statsRow,
          { marginBottom: scaledSpacing.statsRowMargin }
        ]}>
          <View style={[
            styles.statItem,
            { paddingRight: scaledSpacing.statItemPadding }
          ]}>
            <Text style={[styles.statLabel, { fontSize: scaledFonts.statLabel }]}>
              {t('score.timeFactor')}:
            </Text>
            <Text style={[styles.statValue, { fontSize: scaledFonts.statValue }]}>
              {Math.round(score.time_factor || 0)}%
            </Text>
          </View>
          <View style={[
            styles.statItem,
            { paddingRight: scaledSpacing.statItemPadding }
          ]}>
            <Text style={[styles.statLabel, { fontSize: scaledFonts.statLabel }]}>
              {t('score.landmarks')}:
            </Text>
            <Text style={[styles.statValue, { fontSize: scaledFonts.statValue }]}>
              {landmark_count}
            </Text>
          </View>
        </View>

        <View style={[
          styles.statsRow,
          { marginBottom: scaledSpacing.statsRowMargin }
        ]}>
          <View style={[
            styles.statItem,
            { paddingRight: scaledSpacing.statItemPadding }
          ]}>
            <Text style={[styles.statLabel, { fontSize: scaledFonts.statLabel }]}>
              {t('score.mapView')}:
            </Text>
            <View style={styles.penaltyContainer}>
              <Text style={[styles.penaltyValue, { fontSize: scaledFonts.statValue }]}>
                {peekPenaltyPoints}
              </Text>
            </View>
          </View>
          <View style={[
            styles.statItem,
            { paddingRight: scaledSpacing.statItemPadding }
          ]}>
            <Text style={[styles.statLabel, { fontSize: scaledFonts.statLabel }]}>
              {t('score.screenTime')}:
            </Text>
            <View style={styles.penaltyContainer}>
              <Text style={[styles.penaltyValue, { fontSize: scaledFonts.statValue }]}>
                {formatDuration(assistPenaltySeconds)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[
          styles.divider,
          { marginVertical: scaledSpacing.dividerMargin }
        ]} />

        <View style={styles.totalScoreContainer}>
          <Text style={[styles.totalScoreLabel, { fontSize: scaledFonts.totalScoreLabel }]}>
            {t('score.totalScore')}:
          </Text>
          <Text style={[styles.totalScoreValue, { fontSize: scaledFonts.totalScoreValue }]}>
            {Math.round(score.task_score || 0)}
          </Text>
        </View>

        {score.parking_location_name && (
          <Text 
            style={[
              styles.locationText,
              { 
                fontSize: scaledFonts.locationText,
                marginTop: scaledSpacing.locationMarginTop,
              }
            ]} 
            numberOfLines={1}
          >
            📍 {score.parking_location_name}
          </Text>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="trophy-outline" 
        size={scaledSpacing.emptyIconSize} 
        color={COLORS.gray} 
      />
      <Text style={[
        styles.emptyTitle,
        { 
          fontSize: scaledFonts.emptyTitle,
          marginTop: scaledSpacing.emptyTitleMargin,
          marginBottom: scaledSpacing.emptyTextMargin,
        }
      ]}>
        {t('score.noScoresYet')}
      </Text>
      <Text style={[styles.emptyText, { fontSize: scaledFonts.emptyText }]}>
        {t('score.completeSessionPrompt')}
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons 
        name="alert-circle-outline" 
        size={scaledSpacing.errorIconSize} 
        color={COLORS.error} 
      />
      <Text style={[
        styles.errorTitle,
        {
          fontSize: scaledFonts.errorTitle,
          marginTop: scaledSpacing.errorTitleMargin,
          marginBottom: scaledSpacing.errorTextMargin,
        }
      ]}>
        {t('score.unableToLoad')}
      </Text>
      <Text style={[
        styles.errorText,
        {
          fontSize: scaledFonts.errorText,
          marginBottom: scaledSpacing.errorButtonMargin,
        }
      ]}>
        {error}
      </Text>
      <TouchableOpacity 
        style={[
          styles.retryButton,
          {
            paddingHorizontal: scaledSpacing.errorButtonPaddingHorizontal,
            paddingVertical: scaledSpacing.errorButtonPadding,
          }
        ]}
        onPress={() => fetchScores()}
      >
        <Text style={[styles.retryButtonText, { fontSize: scaledFonts.retryButtonText }]}>
          {t('common.tryAgain')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[
          styles.loadingText,
          {
            marginTop: scaledSpacing.loadingTextMargin,
            fontSize: scaledFonts.loadingText,
          }
        ]}>
          {t('common.loading')}
        </Text>
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
        contentContainerStyle={[
          styles.scrollContent,
          { padding: scaledSpacing.containerPadding }
        ]}
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
              <View style={[
                styles.summaryContainer,
                {
                  borderRadius: scaledSpacing.cardBorderRadius,
                  padding: scaledSpacing.summaryPadding,
                  marginTop: scaledSpacing.summaryMarginTop,
                }
              ]}>
                <Text style={[
                  styles.summaryTitle,
                  {
                    fontSize: scaledFonts.summaryTitle,
                    marginBottom: scaledSpacing.summaryTitleMargin,
                  }
                ]}>
                  {t('score.yourProgress')}
                </Text>
                <View style={styles.summaryStats}>
                  <View style={styles.summaryItem}>
                    <Text style={[
                      styles.summaryValue,
                      {
                        fontSize: scaledFonts.summaryValue,
                        marginBottom: scaledSpacing.summaryValueMargin,
                      }
                    ]}>
                      {Math.round(
                        scores.reduce((acc, s) => acc + (s.task_score || 0), 0) / scores.length
                      )}
                    </Text>
                    <Text style={[styles.summaryLabel, { fontSize: scaledFonts.summaryLabel }]}>
                      {t('score.avgScore')}
                    </Text>
                  </View>
                  <View style={[
                    styles.summaryDivider,
                    { height: scaledSpacing.summaryDividerHeight }
                  ]} />
                  <View style={styles.summaryItem}>
                    <Text style={[
                      styles.summaryValue,
                      {
                        fontSize: scaledFonts.summaryValue,
                        marginBottom: scaledSpacing.summaryValueMargin,
                      }
                    ]}>
                      {scores.length}
                    </Text>
                    <Text style={[styles.summaryLabel, { fontSize: scaledFonts.summaryLabel }]}>
                      {t('score.sessions')}
                    </Text>
                  </View>
                  <View style={[
                    styles.summaryDivider,
                    { height: scaledSpacing.summaryDividerHeight }
                  ]} />
                  <View style={styles.summaryItem}>
                    <Text style={[
                      styles.summaryValue,
                      {
                        fontSize: scaledFonts.summaryValue,
                        marginBottom: scaledSpacing.summaryValueMargin,
                      }
                    ]}>
                      {scores.filter(s => (s.task_score || 0) >= 80).length}
                    </Text>
                    <Text style={[styles.summaryLabel, { fontSize: scaledFonts.summaryLabel }]}>
                      {t('score.greatScores')}
                    </Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: '600',
    color: COLORS.dark,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: '#6B7280',
    fontWeight: '400',
  },
  statValue: {
    color: COLORS.dark,
    fontWeight: '600',
  },
  penaltyContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  penaltyValue: {
    color: '#EF4444',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  totalScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalScoreLabel: {
    color: '#6B7280',
    fontWeight: '500',
  },
  totalScoreValue: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  locationText: {
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
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
    fontWeight: '600',
    color: COLORS.dark,
  },
  emptyText: {
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
    fontWeight: '600',
    color: COLORS.dark,
  },
  errorText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: COLORS.primary,
  },
  summaryTitle: {
    fontWeight: '600',
    color: COLORS.white,
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
    fontWeight: '700',
    color: COLORS.white,
  },
  summaryLabel: {
    color: COLORS.white,
    opacity: 0.9,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.white,
    opacity: 0.3,
  },
});