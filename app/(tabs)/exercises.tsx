// app/(tabs)/exercises.tsx - WITH ACCESSIBILITY & LOCALIZATION
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useScaledSizes } from '../../features/accessibility';

interface Exercise {
  id: string;
  titleKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  duration: string;
  difficultyKey: string;
  descriptionKey: string;
  stepsKey: string;
  tipsKey: string;
  category: 'memory' | 'spatial' | 'observation' | 'practice';
}

const exercises: Exercise[] = [
  {
    id: '1',
    titleKey: 'exercises.landmarkChain.title',
    icon: 'link-outline',
    duration: '5 min',
    difficultyKey: 'exercises.difficulty.beginner',
    category: 'memory',
    descriptionKey: 'exercises.landmarkChain.description',
    stepsKey: 'exercises.landmarkChain.steps',
    tipsKey: 'exercises.landmarkChain.tips',
  },
  {
    id: '2',
    titleKey: 'exercises.photoMemory.title',
    icon: 'camera-outline',
    duration: '3 min',
    difficultyKey: 'exercises.difficulty.beginner',
    category: 'spatial',
    descriptionKey: 'exercises.photoMemory.description',
    stepsKey: 'exercises.photoMemory.steps',
    tipsKey: 'exercises.photoMemory.tips',
  },
  {
    id: '3',
    titleKey: 'exercises.numberShape.title',
    icon: 'shapes-outline',
    duration: '4 min',
    difficultyKey: 'exercises.difficulty.intermediate',
    category: 'memory',
    descriptionKey: 'exercises.numberShape.description',
    stepsKey: 'exercises.numberShape.steps',
    tipsKey: 'exercises.numberShape.tips',
  },
  {
    id: '4',
    titleKey: 'exercises.breadcrumb.title',
    icon: 'footsteps-outline',
    duration: '2 min',
    difficultyKey: 'exercises.difficulty.beginner',
    category: 'observation',
    descriptionKey: 'exercises.breadcrumb.description',
    stepsKey: 'exercises.breadcrumb.steps',
    tipsKey: 'exercises.breadcrumb.tips',
  },
  {
    id: '5',
    titleKey: 'exercises.spatialGrid.title',
    icon: 'grid-outline',
    duration: '10 min',
    difficultyKey: 'exercises.difficulty.advanced',
    category: 'practice',
    descriptionKey: 'exercises.spatialGrid.description',
    stepsKey: 'exercises.spatialGrid.steps',
    tipsKey: 'exercises.spatialGrid.tips',
  },
  {
    id: '6',
    titleKey: 'exercises.association.title',
    icon: 'navigate-outline',
    duration: '3 min',
    difficultyKey: 'exercises.difficulty.intermediate',
    category: 'memory',
    descriptionKey: 'exercises.association.description',
    stepsKey: 'exercises.association.steps',
    tipsKey: 'exercises.association.tips',
  }
];

export default function ExercisesScreen() {
  const { t } = useTranslation();
  const { text, icon } = useScaledSizes();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  // Scaled fonts
  const scaledFonts = useMemo(() => ({
    headerTitle: text(24),
    headerSubtitle: text(14),
    categoryLabel: text(14),
    exerciseTitle: text(16),
    metaText: text(12),
    difficultyText: text(11),
    description: text(14),
    sectionTitle: text(14),
    stepNumber: text(11),
    stepText: text(13),
    tipText: text(13),
    startButton: text(14),
    tipsSectionTitle: text(16),
    quickTipText: text(13),
  }), [text]);

  // Scaled spacing
  const scaledSpacing = useMemo(() => ({
    headerPaddingTop: text(10),
    headerPaddingBottom: text(20),
    headerPaddingHorizontal: text(20),
    headerTitleMargin: text(4),
    categoryContainerHeight: 60 + (text(1) - 1) * 20,
    categoryPadding: text(16),
    categoryPaddingVertical: text(5),
    categoryButtonPadding: text(16),
    categoryButtonPaddingVertical: text(8),
    categoryGap: text(6),
    categoryMargin: text(10),
    exerciseCardMargin: text(12),
    exerciseCardPadding: text(16),
    exerciseIconSize: icon(44),
    exerciseIconMargin: text(12),
    exerciseIconInnerSize: icon(24),
    exerciseTitleMargin: text(4),
    metaGap: text(12),
    metaIconSize: icon(14),
    metaItemGap: text(4),
    difficultyPadding: text(8),
    difficultyPaddingVertical: text(2),
    descriptionMargin: text(16),
    sectionMarginTop: text(12),
    sectionMarginBottom: text(10),
    stepMarginBottom: text(10),
    stepNumberSize: icon(20),
    stepNumberMargin: text(10),
    tipMarginBottom: text(8),
    tipGap: text(8),
    tipIconSize: icon(16),
    startButtonMargin: text(16),
    startButtonPadding: text(12),
    tipsSectionPadding: text(16),
    tipsSectionMargin: text(8),
    tipsSectionTitleMargin: text(12),
    quickTipMargin: text(10),
    quickTipGap: text(10),
    quickTipIconSize: icon(20),
    chevronSize: icon(20),
    listPadding: text(16)
  }), [text, icon]);

  const categories = [
    { id: 'all', labelKey: 'exercises.categories.all', icon: 'apps-outline' },
    { id: 'memory', labelKey: 'exercises.categories.memory', icon: 'bulb-outline' },
    { id: 'spatial', labelKey: 'exercises.categories.spatial', icon: 'compass-outline' },
    { id: 'observation', labelKey: 'exercises.categories.observation', icon: 'eye-outline' },
    { id: 'practice', labelKey: 'exercises.categories.practice', icon: 'fitness-outline' },
  ];

  const filteredExercises = selectedCategory === 'all' 
    ? exercises 
    : exercises.filter(e => e.category === selectedCategory);

  const toggleExercise = (id: string) => {
    setExpandedExercise(expandedExercise === id ? null : id);
  };

  const getDifficultyColor = (difficultyKey: string) => {
    if (difficultyKey.includes('beginner')) return '#10B981';
    if (difficultyKey.includes('intermediate')) return '#F59E0B';
    if (difficultyKey.includes('advanced')) return '#EF4444';
    return COLORS.gray;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[
        styles.header,
        {
          paddingTop: scaledSpacing.headerPaddingTop,
          paddingBottom: scaledSpacing.headerPaddingBottom,
          paddingHorizontal: scaledSpacing.headerPaddingHorizontal,
        }
      ]}>
        <Text style={[
          styles.headerTitle,
          { 
            fontSize: scaledFonts.headerTitle,
            marginBottom: scaledSpacing.headerTitleMargin,
          }
        ]}>
          {t('exercises.header.title')}
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: scaledFonts.headerSubtitle }]}>
          {t('exercises.header.subtitle')}
        </Text>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={[
          styles.categoryContainer,
          { maxHeight: scaledSpacing.categoryContainerHeight } 
        ]}
        contentContainerStyle={[
          styles.categoryContent,
          {
            paddingHorizontal: scaledSpacing.categoryPadding,
            paddingVertical: scaledSpacing.categoryPaddingVertical,
            alignItems: 'center',
          }
        ]}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              {
                paddingHorizontal: scaledSpacing.categoryButtonPadding,
                paddingVertical: scaledSpacing.categoryButtonPaddingVertical,
                gap: scaledSpacing.categoryGap,
                marginRight: scaledSpacing.categoryMargin,
              },
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={icon(20)} 
              color={selectedCategory === category.id ? COLORS.white : COLORS.gray}
            />
            <Text style={[
              styles.categoryLabel,
              { fontSize: scaledFonts.categoryLabel },
              selectedCategory === category.id && styles.categoryLabelActive
            ]} numberOfLines={1} >
              {t(category.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercises List */}
      <ScrollView 
        style={styles.exercisesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.exercisesContent,
          { padding: scaledSpacing.listPadding }
        ]}
      >
        {filteredExercises.map(exercise => (
          <TouchableOpacity
            key={exercise.id}
            style={[
              styles.exerciseCard,
              { marginBottom: scaledSpacing.exerciseCardMargin }
            ]}
            onPress={() => toggleExercise(exercise.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.exerciseHeader,
              { padding: scaledSpacing.exerciseCardPadding }
            ]}>
              <View style={[
                styles.exerciseIcon,
                {
                  width: scaledSpacing.exerciseIconSize,
                  height: scaledSpacing.exerciseIconSize,
                  marginRight: scaledSpacing.exerciseIconMargin,
                }
              ]}>
                <Ionicons 
                  name={exercise.icon} 
                  size={scaledSpacing.exerciseIconInnerSize} 
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={[
                  styles.exerciseTitle,
                  {
                    fontSize: scaledFonts.exerciseTitle,
                    marginBottom: scaledSpacing.exerciseTitleMargin,
                  }
                ]}>
                  {t(exercise.titleKey)}
                </Text>
                <View style={[
                  styles.exerciseMeta,
                  { gap: scaledSpacing.metaGap }
                ]}>
                  <View style={[
                    styles.metaItem,
                    { gap: scaledSpacing.metaItemGap }
                  ]}>
                    <Ionicons 
                      name="time-outline" 
                      size={scaledSpacing.metaIconSize} 
                      color={COLORS.gray} 
                    />
                    <Text style={[styles.metaText, { fontSize: scaledFonts.metaText }]}>
                      {exercise.duration}
                    </Text>
                  </View>
                  <View style={[
                    styles.difficultyBadge,
                    {
                      paddingHorizontal: scaledSpacing.difficultyPadding,
                      paddingVertical: scaledSpacing.difficultyPaddingVertical,
                      backgroundColor: getDifficultyColor(exercise.difficultyKey) + '20'
                    }
                  ]}>
                    <Text style={[
                      styles.difficultyText,
                      {
                        fontSize: scaledFonts.difficultyText,
                        color: getDifficultyColor(exercise.difficultyKey)
                      }
                    ]}>
                      {t(exercise.difficultyKey)}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons 
                name={expandedExercise === exercise.id ? 'chevron-up' : 'chevron-down'} 
                size={scaledSpacing.chevronSize} 
                color={COLORS.gray}
              />
            </View>

            {expandedExercise === exercise.id && (
              <View style={[
                styles.exerciseContent,
                { padding: scaledSpacing.exerciseCardPadding, paddingTop: 0 }
              ]}>
                <Text style={[
                  styles.exerciseDescription,
                  {
                    fontSize: scaledFonts.description,
                    marginBottom: scaledSpacing.descriptionMargin,
                  }
                ]}>
                  {t(exercise.descriptionKey)}
                </Text>
                
                <Text style={[
                  styles.sectionTitle,
                  {
                    fontSize: scaledFonts.sectionTitle,
                    marginTop: scaledSpacing.sectionMarginTop,
                    marginBottom: scaledSpacing.sectionMarginBottom,
                  }
                ]}>
                  {t('exercises.howToPractice')}:
                </Text>
                {t(exercise.stepsKey, { returnObjects: true }).map((step: string, index: number) => (
                  <View 
                    key={index} 
                    style={[
                      styles.stepItem,
                      { marginBottom: scaledSpacing.stepMarginBottom }
                    ]}
                  >
                    <View style={[
                      styles.stepNumber,
                      {
                        width: scaledSpacing.stepNumberSize,
                        height: scaledSpacing.stepNumberSize,
                        borderRadius: scaledSpacing.stepNumberSize / 2,
                        marginRight: scaledSpacing.stepNumberMargin,
                      }
                    ]}>
                      <Text style={[
                        styles.stepNumberText,
                        { fontSize: scaledFonts.stepNumber }
                      ]}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={[styles.stepText, { fontSize: scaledFonts.stepText }]}>
                      {step}
                    </Text>
                  </View>
                ))}

                <Text style={[
                  styles.sectionTitle,
                  {
                    fontSize: scaledFonts.sectionTitle,
                    marginTop: scaledSpacing.sectionMarginTop,
                    marginBottom: scaledSpacing.sectionMarginBottom,
                  }
                ]}>
                  {t('exercises.proTips')}:
                </Text>
                {t(exercise.tipsKey, { returnObjects: true }).map((tip: string, index: number) => (
                  <View 
                    key={index} 
                    style={[
                      styles.tipItem,
                      {
                        marginBottom: scaledSpacing.tipMarginBottom,
                        gap: scaledSpacing.tipGap,
                      }
                    ]}
                  >
                    <Ionicons 
                      name="checkmark-circle" 
                      size={scaledSpacing.tipIconSize} 
                      color={COLORS.primary} 
                    />
                    <Text style={[styles.tipText, { fontSize: scaledFonts.tipText }]}>
                      {tip}
                    </Text>
                  </View>
                ))}

                <TouchableOpacity style={[
                  styles.startButton,
                  {
                    paddingVertical: scaledSpacing.startButtonPadding,
                    marginTop: scaledSpacing.startButtonMargin,
                  }
                ]}>
                  <Text style={[
                    styles.startButtonText,
                    { fontSize: scaledFonts.startButton }
                  ]}>
                    {t('exercises.startExercise')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Bottom Tips Section */}
        <View style={[
          styles.tipsSection,
          {
            padding: scaledSpacing.tipsSectionPadding,
            marginTop: scaledSpacing.tipsSectionMargin,
          }
        ]}>
          <Text style={[
            styles.tipsSectionTitle,
            {
              fontSize: scaledFonts.tipsSectionTitle,
              marginBottom: scaledSpacing.tipsSectionTitleMargin,
            }
          ]}>
            {t('exercises.quickTips.title')}
          </Text>
          {t('exercises.quickTips.tips', { returnObjects: true }).map((tip: string, index: number) => (
            <View 
              key={index}
              style={[
                styles.quickTip,
                {
                  marginBottom: scaledSpacing.quickTipMargin,
                  gap: scaledSpacing.quickTipGap,
                }
              ]}
            >
              <Ionicons name="bulb" size={scaledSpacing.quickTipIconSize} color="#F59E0B" />
              <Text style={[styles.quickTipText, { fontSize: scaledFonts.quickTipText }]}>
                {tip}
              </Text>
            </View>
          ))}
        </View>
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontWeight: '600',
    color: COLORS.dark,
  },
  headerSubtitle: {
    color: COLORS.gray,
  },
  categoryContainer: {
    backgroundColor: COLORS.white,
    // maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryContent: {},
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryLabel: {
    color: COLORS.gray,
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: COLORS.white,
  },
  exercisesList: {
    flex: 1,
  },
  exercisesContent: {
    paddingBottom: 100,
  },
  exerciseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIcon: {
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontWeight: '600',
    color: COLORS.dark,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: COLORS.gray,
  },
  difficultyBadge: {
    borderRadius: 10,
  },
  difficultyText: {
    fontWeight: '600',
  },
  exerciseContent: {},
  exerciseDescription: {
    color: '#6B7280',
    lineHeight: 20,
  },
  sectionTitle: {
    fontWeight: '600',
    color: COLORS.dark,
  },
  stepItem: {
    flexDirection: 'row',
  },
  stepNumber: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    color: '#4B5563',
    lineHeight: 18,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    color: '#4B5563',
    lineHeight: 18,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  startButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  tipsSection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  tipsSectionTitle: {
    fontWeight: '600',
    color: '#92400E',
  },
  quickTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  quickTipText: {
    flex: 1,
    color: '#92400E',
    lineHeight: 18,
  },
});