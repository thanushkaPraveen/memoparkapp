// app/(tabs)/exercises.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';

interface Exercise {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  steps: string[];
  tips: string[];
  category: 'memory' | 'spatial' | 'observation' | 'practice';
}

const exercises: Exercise[] = [
  {
    id: '1',
    title: 'Landmark Chain Method',
    icon: 'link-outline',
    duration: '5 min',
    difficulty: 'Beginner',
    category: 'memory',
    description: 'Create memorable connections between landmarks to form a mental path back to your car.',
    steps: [
      'When leaving your car, identify 3-5 distinct landmarks along your path',
      'Create a story that connects each landmark in sequence',
      'For example: "I parked by the RED mailbox, walked past the TALL tree, entered through the BLUE door"',
      'Mentally rehearse the story 2-3 times as you walk',
      'When returning, reverse the story to find your way back'
    ],
    tips: [
      'Use vivid, unusual details that stand out',
      'Include colors, sizes, and unique features',
      'The more absurd the story, the easier to remember'
    ]
  },
  {
    id: '2',
    title: 'Photo Memory Palace',
    icon: 'camera-outline',
    duration: '3 min',
    difficulty: 'Beginner',
    category: 'spatial',
    description: 'Use visual snapshots to create a mental map of your parking location.',
    steps: [
      'Stand at your car and take a mental "photo" of the surrounding area',
      'Turn 90 degrees and take another mental snapshot',
      'Repeat until you have 4 mental photos (one for each direction)',
      'As you walk away, look back and take one final mental photo',
      'When returning, recall these images in reverse order'
    ],
    tips: [
      'Focus on permanent features, not other cars',
      'Include building corners, signs, and painted markings',
      'Close your eyes briefly to "save" each mental photo'
    ]
  },
  {
    id: '3',
    title: 'Number-Shape System',
    icon: 'shapes-outline',
    duration: '4 min',
    difficulty: 'Intermediate',
    category: 'memory',
    description: 'Convert parking information into memorable shapes and patterns.',
    steps: [
      'Note your parking spot number or nearby identifiers',
      'Convert numbers into shapes (1=pencil, 2=swan, 3=heart, etc.)',
      'Create a visual scene with these shapes',
      'Add the floor/level as a color to your scene',
      'Review the complete image before leaving'
    ],
    tips: [
      'Use consistent number-shape associations',
      'Make the mental image large and colorful',
      'Add motion or interaction between shapes'
    ]
  },
  {
    id: '4',
    title: 'Breadcrumb Technique',
    icon: 'footsteps-outline',
    duration: '2 min',
    difficulty: 'Beginner',
    category: 'observation',
    description: 'Leave mental "breadcrumbs" at key decision points along your path.',
    steps: [
      'At each turn or entrance, pause for 2 seconds',
      'Note one unique feature at that spot',
      'Say it out loud: "Turning left at the yellow pillar"',
      'Count your turns as you go',
      'When returning, count backwards and look for your markers'
    ],
    tips: [
      'Focus on immovable objects',
      'Use multiple senses - note sounds and smells too',
      'Practice this technique in familiar places first'
    ]
  },
  {
    id: '5',
    title: 'Spatial Grid Practice',
    icon: 'grid-outline',
    duration: '10 min',
    difficulty: 'Advanced',
    category: 'practice',
    description: 'Develop your mental mapping abilities with this visualization exercise.',
    steps: [
      'Before parking, visualize the area as a grid from above',
      'Place your car on this mental grid',
      'Identify your destination on the grid',
      'Trace your path on the mental grid as you walk',
      'Practice recreating the grid from memory at your destination',
      'Use the grid to navigate back without looking at landmarks'
    ],
    tips: [
      'Start with simple rectangular parking lots',
      'Use cardinal directions (N, S, E, W) as anchors',
      'Practice in familiar locations before trying new places'
    ]
  },
  {
    id: '6',
    title: 'Association Anchors',
    icon: 'navigate-outline',
    duration: '3 min',
    difficulty: 'Intermediate',
    category: 'memory',
    description: 'Create strong mental associations between landmarks and personal memories.',
    steps: [
      'Identify 3 landmarks near your parking spot',
      'Connect each landmark to a personal memory or person',
      'Example: "This red sign reminds me of mom\'s red coat"',
      'Create emotional connections to strengthen memory',
      'Review associations before leaving the area'
    ],
    tips: [
      'Use positive, meaningful memories',
      'The stronger the emotion, the better the recall',
      'Link to people you know for better retention'
    ]
  }
];

export default function ExercisesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All', icon: 'apps-outline' },
    { id: 'memory', label: 'Memory', icon: 'bulb-outline' },
    { id: 'spatial', label: 'Spatial', icon: 'compass-outline' },
    { id: 'observation', label: 'Observation', icon: 'eye-outline' },
    { id: 'practice', label: 'Practice', icon: 'fitness-outline' },
  ];

  const filteredExercises = selectedCategory === 'all' 
    ? exercises 
    : exercises.filter(e => e.category === selectedCategory);

  const toggleExercise = (id: string) => {
    setExpandedExercise(expandedExercise === id ? null : id);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return COLORS.gray;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Memory Exercises</Text>
        <Text style={styles.headerSubtitle}>Improve your landmark navigation skills</Text>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={20} 
              color={selectedCategory === category.id ? COLORS.white : COLORS.gray}
            />
            <Text style={[
              styles.categoryLabel,
              selectedCategory === category.id && styles.categoryLabelActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercises List */}
      <ScrollView 
        style={styles.exercisesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.exercisesContent}
      >
        {filteredExercises.map(exercise => (
          <TouchableOpacity
            key={exercise.id}
            style={styles.exerciseCard}
            onPress={() => toggleExercise(exercise.id)}
            activeOpacity={0.7}
          >
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseIcon}>
                <Ionicons 
                  name={exercise.icon} 
                  size={24} 
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                <View style={styles.exerciseMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={COLORS.gray} />
                    <Text style={styles.metaText}>{exercise.duration}</Text>
                  </View>
                  <View style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(exercise.difficulty) + '20' }
                  ]}>
                    <Text style={[
                      styles.difficultyText,
                      { color: getDifficultyColor(exercise.difficulty) }
                    ]}>
                      {exercise.difficulty}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons 
                name={expandedExercise === exercise.id ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={COLORS.gray}
              />
            </View>

            {expandedExercise === exercise.id && (
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                
                <Text style={styles.sectionTitle}>How to Practice:</Text>
                {exercise.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}

                <Text style={styles.sectionTitle}>Pro Tips:</Text>
                {exercise.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}

                <TouchableOpacity style={styles.startButton}>
                  <Text style={styles.startButtonText}>Start Exercise</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Bottom Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsSectionTitle}>Quick Memory Tips</Text>
          <View style={styles.quickTip}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text style={styles.quickTipText}>
              Always look back at your car before entering a building - this creates a stronger visual memory.
            </Text>
          </View>
          <View style={styles.quickTip}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text style={styles.quickTipText}>
              Use your phone to take a quick photo as backup, but try to rely on memory first.
            </Text>
          </View>
          <View style={styles.quickTip}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text style={styles.quickTipText}>
              Practice these techniques in familiar places to build confidence before using them in new locations.
            </Text>
          </View>
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
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  categoryContainer: {
    backgroundColor: COLORS.white,
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryLabel: {
    fontSize: 14,
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
    padding: 16,
    paddingBottom: 100,
  },
  exerciseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exerciseIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  exerciseContent: {
    padding: 16,
    paddingTop: 0,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 12,
    marginBottom: 10,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tipsSection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  tipsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  quickTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  quickTipText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
});