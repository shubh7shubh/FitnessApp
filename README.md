# FitnessApp 🏋️‍♂️

An advanced fitness tracking application that revolutionizes health and wellness through gamification, social engagement, and personalized nutrition plans. Built with React Native and Expo, this app combines the functionality of MyFitnessPal with motivational challenges, community-driven feeds, and premium subscription services.

## 🌟 Vision

FitnessApp isn't just another calorie counter. It's a comprehensive fitness ecosystem that:
- **Motivates** users through gamification with challenges and badges
- **Connects** fitness enthusiasts through a points-based social feed
- **Personalizes** nutrition and exercise plans through premium subscriptions
- **Empowers** users with offline-first functionality and AI-powered insights (coming soon)

## ✨ Key Features

### 🎯 Core Fitness Tracking
- **Daily Diary**: Comprehensive food and exercise logging with macro tracking
- **Nutrition Database**: Extensive food database with detailed nutritional information
- **Progress Monitoring**: Weight tracking with visual charts and goal progression
- **Goal Calculation**: Intelligent fitness goal recalculation based on user profile changes

### 🏆 Gamification & Social
- **Challenge System**: Engaging fitness challenges that users can participate in
- **Badge Collection**: Achievement badges for reaching milestones and completing challenges
- **Points-Based Ranking**: Users earn points for activities, challenges, and engagement
- **Social Feed**: Community posts ranked by user points - top performers get top visibility
- **Motivational Framework**: Points-driven system that encourages consistent engagement

### 💎 Premium Features
- **Subscription Plans**: Tiered access to premium content and features
- **Custom Diet Plans**: Personalized nutrition plans for subscribers
- **Exercise Programs**: Tailored workout routines and training plans
- **Advanced Analytics**: Detailed insights and progress analysis

### 🔮 Coming Soon
- **AI Chatbot**: Intelligent fitness and nutrition assistant
- **Advanced Coaching**: Personalized recommendations and guidance
- **Meal Planning**: AI-powered meal suggestions and grocery lists
- **Community Challenges**: Group competitions and team-based goals

## 🛠 Technology Stack

### **Frontend & Framework**
- **React Native** + **Expo SDK 52** - Cross-platform mobile development
- **Expo Router** - File-based navigation system
- **TypeScript** - Type-safe development experience

### **Styling & UI**
- **NativeWind** - Tailwind CSS utility classes for React Native
- **React Native Gifted Charts** - Beautiful data visualizations
- **Inter Font Family** - Modern typography system

### **Data & State Management**
- **WatermelonDB** - Offline-first local database with sync capabilities
- **Zustand** - Lightweight state management (`useAppStore`, `useUserStore`)
- **TanStack Query** - Server state management and caching
- **Zod** - Runtime type validation and schema definition

### **Backend & Services**
- **Supabase** - Authentication, cloud functions, and future PostgreSQL sync
- **Supabase Auth** - Google Sign-in and user management
- **EAS Build** - CI/CD pipeline for app deployment

### **Development & Quality**
- **ESLint** + **Prettier** - Code quality and consistent formatting
- **Husky** - Git hook enforcement
- **Jest** - Testing framework with jest-expo preset

## 📱 Project Structure

```
FitnessApp/
├── app/                    # Expo Router file-based routing
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   ├── (modals)/          # Modal screens
│   └── nutrition/         # Food search and logging
├── modules/               # Feature-based modules
│   ├── home/              # Dashboard and overview
│   ├── diary/             # Daily logging interface
│   ├── nutrition/         # Food database and search
│   ├── progress/          # Charts and analytics
│   └── onboarding/        # User setup flow
├── db/                    # WatermelonDB layer
│   ├── models/            # Data models (User, Food, DiaryEntry, WeightEntry)
│   ├── actions/           # Database operations
│   └── schema/            # Database schema definitions
├── components/            # Shared UI components
├── stores/                # Zustand state management
├── providers/             # React context providers
├── constants/             # Theme and configuration
└── lib/                   # External service configs
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FitnessApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Set up Supabase project and get your credentials
   - Configure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Add `google-services.json` for Android authentication

4. **Start development server**
   ```bash
   npm start
   ```

## 🔧 Development Commands

### Core Development
```bash
npm start           # Start Expo development server
npm run android     # Run on Android device/emulator
npm run ios         # Run on iOS device/simulator
npm run web         # Run web version
npm run test        # Run Jest tests with watch mode
npm run lint        # Run Expo linting
```

### Building & Deployment
```bash
eas build --platform android    # Build Android APK
eas build --platform ios        # Build iOS IPA
eas build --platform all        # Build for both platforms
```

## 🏗 Architecture Overview

### Database Architecture
**WatermelonDB Models:**
- `User` - User profiles, fitness goals, and points
- `Food` - Nutrition database with macro information
- `DiaryEntry` - Daily food and exercise logging
- `WeightEntry` - Weight tracking and progress data

### State Management
- **AppStore**: Global app state, authentication, loading states
- **UserStore**: User profile data synchronized with database
- **Goal Recalculation**: Automatic fitness goal updates based on profile changes

### Key Business Logic
- **Points System**: Users earn points for completing challenges, logging meals, and engagement
- **Feed Ranking**: Social feed posts are ranked by user points for motivation
- **Goal Calculation**: Intelligent recalculation of fitness goals using `modules/onboarding/services/goalCalculator.ts`
- **Offline-First**: Full functionality without internet connection, with future Supabase sync

## 🎨 Design System

### Styling Approach
- **NativeWind**: Tailwind-inspired utility classes for React Native
- **Theme System**: Consistent colors and typography defined in `constants/theme.ts`
- **Fitness Colors**: Specialized color palette for calories, macros, and progress indicators
- **Dark/Light Mode**: Full theme support for enhanced user experience

## 🧪 Testing

```bash
npm run test        # Run all tests
npm run test:watch  # Run tests in watch mode
```

Test files are located in the `test/` directory, including specialized tests for goal recalculation logic.

## 🚀 Roadmap

### Phase 1: Gamification Enhancement
- [ ] Advanced challenge system with multiplayer competitions
- [ ] Badge marketplace and trading features
- [ ] Social leaderboards and friend connections

### Phase 2: Premium Subscriptions
- [ ] Subscription tiers and payment integration
- [ ] Premium diet plan creator and marketplace
- [ ] Advanced analytics and insights dashboard

### Phase 3: AI Integration
- [ ] AI-powered chatbot for fitness advice
- [ ] Smart meal recommendations based on goals
- [ ] Predictive analytics for goal achievement

### Phase 4: Community Features
- [ ] Group challenges and team competitions
- [ ] Fitness coaching marketplace
- [ ] Social features expansion (stories, live workouts)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use WatermelonDB actions for all database operations
- Update both AppStore and UserStore for user-related changes
- Follow existing patterns in `modules/` for feature-specific components
- Use NativeWind classes for consistent styling
- Test goal recalculation logic thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

---

**FitnessApp** - Transforming fitness tracking into an engaging, social, and rewarding experience. 💪✨