#!/usr/bin/env node

/**
 * Debug script for white screen issue
 * Run this script to get debugging information and steps to resolve the issue
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Fitness App Debug Script");
console.log("============================\n");

// Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  console.log("📦 Package.json Analysis:");
  console.log(`   • Expo version: ${packageJson.dependencies.expo}`);
  console.log(
    `   • React Native version: ${packageJson.dependencies["react-native"]}`
  );
  console.log(
    `   • WatermelonDB version: ${packageJson.dependencies["@nozbe/watermelondb"]}`
  );
  console.log(`   • Zustand version: ${packageJson.dependencies.zustand}`);
  console.log("");
} catch (error) {
  console.error("❌ Error reading package.json:", error.message);
}

// Check if node_modules exists
if (fs.existsSync("node_modules")) {
  console.log("✅ node_modules directory exists");
} else {
  console.log("❌ node_modules directory missing - run npm install");
}

// Check if metro cache exists
const metroCachePath = path.join(process.cwd(), ".expo");
if (fs.existsSync(metroCachePath)) {
  console.log("✅ Expo cache directory exists");
} else {
  console.log(
    "ℹ️  Expo cache directory not found (this is normal for first run)"
  );
}

console.log("\n🚀 Debugging Steps:");
console.log("==================");
console.log("1. Clear all caches:");
console.log("   npx expo start --clear");
console.log("");
console.log("2. If that doesn't work, try:");
console.log("   npm run reset-project");
console.log("");
console.log("3. Check the debug screen at /index to see app state");
console.log("");
console.log("4. Look for these console logs in your terminal:");
console.log("   🚀 Initializing app...");
console.log("   📊 Seeding food database...");
console.log("   👤 Getting active user...");
console.log("   ✅ App initialization complete");
console.log("");
console.log(
  "5. If you see errors, they will be displayed on the loading screen"
);
console.log("");
console.log("6. Common issues:");
console.log("   • Database initialization failing");
console.log("   • Font loading issues");
console.log("   • Navigation logic getting stuck");
console.log("   • WatermelonDB setup problems");
console.log("");
console.log("7. If the issue persists:");
console.log("   • Check the debug screen at /index");
console.log("   • Look for error messages in the console");
console.log("   • Try navigating manually using the debug buttons");
console.log("");

// Check for common configuration issues
console.log("🔧 Configuration Check:");
console.log("======================");

// Check if app.json has the right configuration
try {
  const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
  if (appJson.expo.newArchEnabled) {
    console.log("✅ New Architecture is enabled");
  } else {
    console.log("ℹ️  New Architecture is disabled");
  }

  if (appJson.expo.updates?.enabled === false) {
    console.log("✅ Updates are disabled (good for debugging)");
  }
} catch (error) {
  console.error("❌ Error reading app.json:", error.message);
}

console.log("\n📱 Next Steps:");
console.log("==============");
console.log("1. Run: npx expo start --clear");
console.log("2. Check the console output for any errors");
console.log("3. If you see a white screen, check the debug screen at /index");
console.log("4. Use the debug buttons to test navigation manually");
console.log("5. Look for any error messages displayed on screen");
console.log("");
console.log("🎯 The debug screen will show you:");
console.log("   • Current app state (loading, authenticated, etc.)");
console.log("   • Any initialization errors");
console.log("   • Manual navigation options");
console.log("");
console.log("Good luck debugging! 🍀");
