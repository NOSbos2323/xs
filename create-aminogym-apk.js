#!/usr/bin/env node

// سكريبت بسيط لإنشاء aminogym.apk
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("🚀 إنشاء ملف aminogym.apk...");

try {
  // بناء التطبيق
  console.log("📦 بناء التطبيق...");
  execSync("npm run build", { stdio: "inherit" });

  // تثبيت Capacitor إذا لم يكن مثبتاً
  if (!fs.existsSync("node_modules/@capacitor/core")) {
    console.log("📦 تثبيت Capacitor...");
    execSync("npm install @capacitor/core @capacitor/cli @capacitor/android", {
      stdio: "inherit",
    });
  }

  // تهيئة Capacitor إذا لم يكن موجوداً
  if (!fs.existsSync("android")) {
    console.log("⚡ تهيئة Capacitor...");
    execSync('npx cap init "Amino Gym" "com.aminogym.app" --web-dir=dist', {
      stdio: "inherit",
    });
    execSync("npx cap add android", { stdio: "inherit" });
  }

  // نسخ ومزامنة الملفات
  console.log("📋 نسخ الملفات...");
  execSync("npx cap copy", { stdio: "inherit" });
  execSync("npx cap sync", { stdio: "inherit" });

  // بناء APK
  console.log("🔨 بناء APK...");
  const originalDir = process.cwd();
  process.chdir("android");

  // جعل gradlew قابل للتنفيذ
  if (process.platform !== "win32") {
    try {
      execSync("chmod +x gradlew", { stdio: "inherit" });
    } catch (e) {
      console.log("تحذير: لم يتم تعيين صلاحيات gradlew");
    }
  }

  // بناء APK
  const gradleCommand =
    process.platform === "win32" ? "gradlew.bat" : "./gradlew";
  execSync(`${gradleCommand} assembleDebug`, { stdio: "inherit" });

  // البحث عن ملف APK
  const possiblePaths = [
    "app/build/outputs/apk/debug/app-debug.apk",
    "app/build/outputs/apk/app-debug.apk",
    "build/outputs/apk/debug/app-debug.apk",
  ];

  let apkFound = false;
  for (const apkPath of possiblePaths) {
    if (fs.existsSync(apkPath)) {
      console.log(`📱 وُجد APK في: ${apkPath}`);
      console.log("📱 إنشاء aminogym.apk...");
      fs.copyFileSync(apkPath, path.join(originalDir, "aminogym.apk"));

      const stats = fs.statSync(path.join(originalDir, "aminogym.apk"));
      console.log("✅ تم إنشاء aminogym.apk بنجاح!");
      console.log(`📊 حجم الملف: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log("📍 الملف موجود في المجلد الرئيسي");
      apkFound = true;
      break;
    }
  }

  if (!apkFound) {
    console.log("🔍 البحث عن ملفات APK في جميع المجلدات...");
    const findApk = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        if (file.isDirectory()) {
          try {
            findApk(path.join(dir, file.name));
          } catch (e) {}
        } else if (file.name.endsWith(".apk")) {
          const fullPath = path.join(dir, file.name);
          console.log(`📱 وُجد APK: ${fullPath}`);
          fs.copyFileSync(fullPath, path.join(originalDir, "aminogym.apk"));
          console.log("✅ تم نسخ الملف إلى aminogym.apk");
          apkFound = true;
          return;
        }
      }
    };
    findApk(".");
  }

  process.chdir(originalDir);

  if (apkFound) {
    console.log("");
    console.log("🎉 تم إنشاء aminogym.apk بنجاح!");
    console.log("📋 خطوات التثبيت:");
    console.log("   1. انقل ملف aminogym.apk إلى هاتفك");
    console.log('   2. فعّل "مصادر غير معروفة" في إعدادات الأمان');
    console.log("   3. اضغط على ملف aminogym.apk لتثبيته");
  } else {
    console.error("❌ لم يتم العثور على ملف APK");
  }
} catch (error) {
  console.error("❌ خطأ:", error.message);
  process.exit(1);
}
