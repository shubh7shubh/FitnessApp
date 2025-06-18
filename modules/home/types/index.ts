export interface UserStats {
  caloriesConsumed: number;
  caloriesGoal: number;
  caloriesBurned: number;
  proteinConsumed: number;
  proteinGoal: number;
  carbsConsumed: number;
  carbsGoal: number;
  fatConsumed: number;
  fatGoal: number;
  waterConsumed: number; // in ml
  waterGoal: number; // in ml
  stepsCount: number;
  stepsGoal: number;
  workoutsCompleted: number;
  workoutGoal: number;
  sleepHours: number;
  sleepGoal: number;
}

export interface DailyProgress {
  date: string;
  stats: UserStats;
  streak: number;
  badges: string[];
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
}

export interface HomeState {
  todayStats: UserStats;
  weekProgress: DailyProgress[];
  quickActions: QuickAction[];
  isLoading: boolean;
  lastUpdated: Date | null;
}

export interface MacroProgress {
  current: number;
  goal: number;
  percentage: number;
  color: string;
}
