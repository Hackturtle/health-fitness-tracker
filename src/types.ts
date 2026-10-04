export type Equipment =
  | 'Machine'
  | 'Cable'
  | 'Dumbbell'
  | 'Barbell'
  | 'Smith'
  | 'Bodyweight'

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Core'

export interface Exercise {
  id: string
  name: string
  equipment: Equipment
  primaryMuscle: MuscleGroup
  secondaryMuscles?: MuscleGroup[]
}

export interface WorkoutSet {
  id: string
  weight: number
  reps: number
  kind: 'Warm-up' | 'Working'
}

export interface WorkoutExercise {
  exercise: Exercise
  sets: WorkoutSet[]
}
