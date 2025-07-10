#!/usr/bin/env node

// Amino Gym APK Builder - Node.js Script
// سكريبت Node.js لإنشاء ملف aminogym.apk

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("🚀 بدء إنشاء ملف aminogym.apk...");

try {
  // Build the web app
  console.log("📦 بناء التطبيق...");
  execSync("npm run build", { stdio: "inherit" });

  // Install Capacitor dependencies if not installed
  console.log("⚡ التحقق من تثبيت Capacitor...");
  try {
    execSync("npm list @capacitor/core", { stdio: "ignore" });
  } catch {
    console.log("📦 تثبيت Capacitor...");
    execSync("npm install @capacitor/core @capacitor/cli @capacitor/android", {
      stdio: "inherit",
    });
  }

  // Initialize Capacitor if not already done
  if (!fs.existsSync("android")) {
    console.log("⚡ تهيئة Capacitor...");
    execSync('npx cap init "Amino Gym" "com.aminogym.app" --web-dir=dist', {
      stdio: "inherit",
    });

    console.log("📱 إضافة منصة Android...");
    execSync("npx cap add android", { stdio: "inherit" });
  }

  // Copy web assets to native project
  console.log("📋 نسخ الملفات...");
  execSync("npx cap copy", { stdio: "inherit" });

  // Sync the project
  console.log("🔄 مزامنة المشروع...");
  execSync("npx cap sync", { stdio: "inherit" });

  // Build APK
  console.log("🔨 بناء ملف APK...");
  process.chdir("android");

  // Make gradlew executable
  if (process.platform !== "win32") {
    execSync("chmod +x gradlew", { stdio: "inherit" });
  }

  // Build debug APK
  const gradleCommand =
    process.platform === "win32" ? "gradlew.bat" : "./gradlew";
  execSync(`${gradleCommand} assembleDebug`, { stdio: "inherit" });

  // Check if APK was created
  const apkPath = "app/build/outputs/apk/debug/app-debug.apk";
  if (!fs.existsSync(apkPath)) {
    throw new Error("ملف APK غير موجود في المسار المتوقع");
  }

  // Copy APK to root directory with custom name
  console.log("📱 إنشاء ملف aminogym.apk...");
  fs.copyFileSync(apkPath, "../aminogym.apk");

  console.log("✅ تم إنشاء ملف aminogym.apk بنجاح!");
  console.log("📍 الملف موجود في:", path.resolve("../aminogym.apk"));
  console.log("📱 يمكنك الآن تثبيت التطبيق على هاتف Android");
  console.log("");
  console.log("📋 خطوات التثبيت:");
  console.log("   1. انقل ملف aminogym.apk إلى هاتفك");
  console.log("   2. فعّل 'مصادر غير معروفة' في إعدادات الأمان");
  console.log("   3. اضغط على ملف aminogym.apk لتثبيته");
  console.log("");
  console.log("🎉 تم بنجاح! Amino Gym جاهز للتثبيت");
} catch (error) {
  console.error("❌ خطأ في إنشاء APK:", error.message);
  process.exit(1);
}
