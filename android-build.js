#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("🚀 بدء إنشاء ملف APK لـ Amino Gym...");

try {
  // Build the web app
  console.log("📦 بناء التطبيق...");
  execSync("npm run build", { stdio: "inherit" });

  // Initialize Capacitor if not already done
  if (!fs.existsSync("android")) {
    console.log("⚡ تهيئة Capacitor...");
    execSync("npx cap init", { stdio: "inherit" });

    console.log("📱 إضافة منصة Android...");
    execSync("npx cap add android", { stdio: "inherit" });
  }

  // Copy web assets to native project
  console.log("📋 نسخ الملفات...");
  execSync("npx cap copy", { stdio: "inherit" });

  // Sync the project
  console.log("🔄 مزامنة المشروع...");
  execSync("npx cap sync", { stdio: "inherit" });

  console.log("✅ تم إنشاء مشروع Android بنجاح!");
  console.log("📍 يمكنك العثور على المشروع في مجلد: ./android");
  console.log("🔧 لبناء APK، استخدم Android Studio أو الأمر التالي:");
  console.log("   cd android && ./gradlew assembleDebug");
} catch (error) {
  console.error("❌ خطأ في إنشاء APK:", error.message);
  process.exit(1);
}
