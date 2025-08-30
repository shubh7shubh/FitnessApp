# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Advanced fitness tracking application that combines MyFitnessPal-like functionality with gamification, social engagement, and premium subscriptions. Features offline-first architecture with planned Supabase sync, points-based social feeds, challenge systems, and AI-powered insights (future).

## Development Commands

### Core Development
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator  
- `npm run web` - Run web version
- `npm run test` - Run Jest tests with watch mode
- `npm run lint` - Run Expo linting

### Building & Deployment
- `eas build --platform android` - Build Android APK
- `eas build --platform ios` - Build iOS IPA
- `eas build --platform all` - Build for both platforms

## Architecture Overview

### Technology Stack
- **Framework**: React Native with Expo (SDK 52)
- **Navigation**: Expo Router (file-based routing)
- **UI**: NativeWind (Tailwind CSS for React Native)
- **Database**: WatermelonDB (offline-first, future Supabase PostgreSQL sync)
- **Backend**: Supabase (authentication, cloud functions)
- **State Management**: Zustand (`useAppStore`, `useUserStore`)
- **Data Fetching**: TanStack Query (caching, mutations)
- **Validation**: Zod (schema validation, runtime type safety)
- **Authentication**: Supabase Auth with Google Sign-in
- **Charts**: React Native Gifted Charts
- **Code Quality**: ESLint + Prettier + Husky

### Project Structure
- `app/` - File-based routing screens (Expo Router)
- `modules/` - Feature-based modules (home, diary, nutrition, etc.)
- `db/` - WatermelonDB models, schemas, actions, and migrations
- `components/` - Shared UI components
- `stores/` - Zustand state management stores
- `providers/` - React context providers (Auth, Database, Toast)
- `constants/` - Theme colors and mock data
- `lib/` - External service configurations (Supabase)

### Database Architecture
**WatermelonDB Models:**
- `User` - User profiles, fitness goals, points, and badges
- `Food` - Food database with nutrition facts
- `DiaryEntry` - Daily food/exercise logging entries
- `WeightEntry` - Weight tracking records
- `Challenge` - Fitness challenges and competitions (future)
- `Badge` - Achievement system for gamification (future)

**Key Database Actions:**
- `userActions.ts` - User CRUD and goal recalculation logic
- `diaryActions.ts` - Daily logging operations
- `foodActions.ts` - Food database operations and seeding
- `progressActions.ts` - Weight tracking and progress calculations

### State Management
**AppStore** (`stores/appStore.ts`):
- Current user session
- App-wide loading states
- Authentication state

**UserStore** (`stores/useUserStore.ts`):
- User profile data (height, weight, goals)
- Fitness goals (calories, macros)
- Points and badges system
- Synchronized with database User model

### Key Features
1. **Onboarding Flow** - Multi-step user setup with goal calculation
2. **Daily Diary** - Food and exercise logging with macro tracking
3. **Progress Tracking** - Weight charts and goal monitoring
4. **Nutrition Search** - Food database with macro information
5. **Gamified Social Feeds** - Points-based ranking system, top performers get visibility
6. **Challenge System** - Fitness challenges with badges and point rewards
7. **Premium Subscriptions** - Diet plans, exercise programs, advanced features
8. **User Profiles** - Editable profiles with automatic goal recalculation
9. **AI Integration** - Chatbot and personalized recommendations (future)

### Critical Business Logic
**Goal Recalculation System:**
Located in `db/actions/userActions.ts`, automatically recalculates user fitness goals when critical profile fields change:
- Height, weight, activity level, goal type
- Uses `modules/onboarding/services/goalCalculator.ts`
- Updates both `useAppStore` and `useUserStore`
- Triggered on profile edits and significant weight changes (≥0.5kg)

**Gamification System:**
- **Points**: Earned through challenges, daily logging, and engagement
- **Badges**: Achievement system for milestones and challenges
- **Social Ranking**: Feed posts ranked by user points for motivation
- **Challenges**: Community competitions with rewards

### Navigation Structure
- `(tabs)/` - Main tab navigation (Home, Diary, Progress, Feeds)
- `(auth)/` - Authentication screens
- `(modals)/` - Modal screens (Profile, Comments, etc.)
- `nutrition/` - Food search and logging screens
- `blogs/` - Articles and blog content

### Styling System
- **NativeWind**: Tailwind CSS classes for React Native
- **Theme**: Defined in `constants/theme.ts` with dark/light mode support
- **Custom Colors**: Fitness-specific colors (calories, protein, carbs, fat)
- **Typography**: Inter font family (Regular, SemiBold, Bold)

### Environment & Configuration
- **Supabase**: Configure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **EAS**: Project ID in `app.json` and build profiles in `eas.json`
- **Google Services**: Android authentication via `google-services.json`

### Testing
- **Framework**: Jest with jest-expo preset
- **Test Files**: Located in `test/` directory
- **Goal Calculation Testing**: `test/goalRecalculationTest.ts` for nutrition goal validation

### Development Guidelines
1. **Database Updates**: Always use WatermelonDB actions, never direct model manipulation
2. **Goal Recalculation**: Use `updateUserAndRecalculateGoals()` for profile changes affecting fitness goals
3. **State Management**: Update both AppStore and UserStore for user-related changes
4. **Points System**: Update user points when implementing new engagement features
5. **UI Components**: Follow existing patterns in `modules/` for feature-specific components
6. **Navigation**: Use Expo Router conventions for file-based routing
7. **Styling**: Prefer NativeWind classes over StyleSheet for consistency
8. **Offline-First**: Design features to work offline with eventual Supabase sync

### Performance Considerations
- **WatermelonDB**: Optimized for offline-first, lazy loading
- **Image Handling**: Use Expo Image for better caching and performance
- **List Rendering**: Use FlatList for long lists, ScrollView for short content
- **Goal Recalculation**: Only triggered for critical field changes to optimize performance

### Known Issues & Solutions
- **Goal Recalculation**: Comprehensive fix documented in `GOAL_RECALCULATION_FIX.md`
- **Store Synchronization**: Both AppStore and UserStore must be updated together for user changes
- **Weight Tracking**: Significant changes (≥0.5kg) automatically trigger goal recalculation