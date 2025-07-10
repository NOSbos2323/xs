#!/usr/bin/env node

// سكريبت سريع لإنشاء aminogym.apk
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🚀 إنشاء aminogym.apk...");

try {
  // بناء التطبيق
  console.log("📦 بناء التطبيق...");
  execSync("npm run build", { stdio: "inherit" });

  // تثبيت Capacitor إذا لم يكن مثبتاً
  console.log("⚡ التحقق من Capacitor...");
  if (!fs.existsSync("node_modules/@capacitor/core")) {
    console.log("📦 تثبيت Capacitor...");
    execSync("npm install @capacitor/core @capacitor/cli @capacitor/android", {
      stdio: "inherit",
    });
  }

  // تهيئة Capacitor
  if (!fs.existsSync("android")) {
    console.log("⚡ تهيئة Capacitor...");
    execSync('npx cap init "Amino Gym" "com.aminogym.app" --web-dir=dist', {
      stdio: "inherit",
    });

    console.log("📱 إضافة منصة Android...");
    execSync("npx cap add android", { stdio: "inherit" });
  }

  // نسخ ومزامنة الملفات
  console.log("📋 نسخ الملفات...");
  execSync("npx cap copy", { stdio: "inherit" });
  execSync("npx cap sync", { stdio: "inherit" });

  // بناء APK
  console.log("🔨 بناء APK...");
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

  // نسخ APK إلى المجلد الرئيسي
  const apkPath = "app/build/outputs/apk/debug/app-debug.apk";
  if (fs.existsSync(apkPath)) {
    console.log("📱 إنشاء aminogym.apk...");
    fs.copyFileSync(apkPath, "../aminogym.apk");

    console.log("✅ تم إنشاء aminogym.apk بنجاح!");
    console.log("📍 الملف موجود في المجلد الرئيسي");
    console.log("📱 يمكنك الآن تثبيته على هاتف Android");

    // عرض معلومات الملف
    const stats = fs.statSync("../aminogym.apk");
    console.log(`📊 حجم الملف: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.error("❌ لم يتم العثور على ملف APK");
    console.log("🔍 البحث عن ملفات APK...");

    // البحث عن ملفات APK
    const findApk = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        if (file.isDirectory()) {
          try {
            findApk(path.join(dir, file.name));
          } catch (e) {}
        } else if (file.name.endsWith(".apk")) {
          console.log(`📱 وُجد APK: ${path.join(dir, file.name)}`);
        }
      }
    };

    try {
      findApk(".");
    } catch (e) {
      console.log("لم يتم العثور على ملفات APK");
    }
  }
} catch (error) {
  console.error("❌ خطأ:", error.message);

  // محاولة العثور على ملف APK في أي مكان
  console.log("🔍 البحث عن ملفات APK موجودة...");
  try {
    const findApkRecursive = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        if (
          file.isDirectory() &&
          !file.name.startsWith(".") &&
          file.name !== "node_modules"
        ) {
          try {
            findApkRecursive(path.join(dir, file.name));
          } catch (e) {}
        } else if (file.name.endsWith(".apk")) {
          const apkPath = path.join(dir, file.name);
          console.log(`📱 وُجد APK: ${apkPath}`);

          // نسخ إلى aminogym.apk
          if (file.name !== "aminogym.apk") {
            fs.copyFileSync(apkPath, "aminogym.apk");
            console.log("✅ تم نسخ الملف إلى aminogym.apk");
          }
        }
      }
    };

    findApkRecursive(".");
  } catch (e) {
    console.log("لم يتم العثور على ملفات APK");
  }

  process.exit(1);
}
