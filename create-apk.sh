#!/bin/bash

# Amino Gym APK Creator - إنشاء ملف aminogym.apk
# سكريبت إنشاء ملف APK جاهز للتثبيت

echo "🚀 بدء إنشاء ملف aminogym.apk..."

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً"
    exit 1
fi

# التحقق من وجود npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm غير مثبت. يرجى تثبيت npm أولاً"
    exit 1
fi

# تثبيت التبعيات إذا لم تكن موجودة
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت التبعيات..."
    npm install
fi

# بناء التطبيق
echo "🏗️ بناء التطبيق..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ فشل في بناء التطبيق"
    exit 1
fi

# تثبيت Capacitor إذا لم يكن مثبتاً
if ! npm list @capacitor/core &> /dev/null; then
    echo "⚡ تثبيت Capacitor..."
    npm install @capacitor/core @capacitor/cli @capacitor/android
fi

# تهيئة مشروع Capacitor إذا لم يكن موجوداً
if [ ! -d "android" ]; then
    echo "🔧 تهيئة مشروع Capacitor..."
    npx cap init "Amino Gym" "com.aminogym.app" --web-dir=dist
    
    echo "📱 إضافة منصة Android..."
    npx cap add android
fi

# نسخ الملفات ومزامنة المشروع
echo "📋 نسخ الملفات ومزامنة المشروع..."
npx cap copy
npx cap sync

# التحقق من وجود مجلد android
if [ ! -d "android" ]; then
    echo "❌ مجلد android غير موجود"
    exit 1
fi

# الانتقال إلى مجلد android وبناء APK
echo "🔨 بناء ملف APK..."
cd android

# التحقق من وجود gradlew
if [ ! -f "gradlew" ]; then
    echo "❌ ملف gradlew غير موجود"
    exit 1
fi

# منح صلاحيات التنفيذ لـ gradlew
chmod +x gradlew

# بناء APK
./gradlew assembleDebug

if [ $? -ne 0 ]; then
    echo "❌ فشل في بناء APK"
    exit 1
fi

# التحقق من وجود ملف APK
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK_PATH" ]; then
    echo "❌ ملف APK غير موجود في المسار المتوقع"
    exit 1
fi

# نسخ ملف APK إلى المجلد الرئيسي باسم aminogym.apk
echo "📱 إنشاء ملف aminogym.apk..."
cp "$APK_PATH" "../aminogym.apk"

if [ $? -eq 0 ]; then
    echo "✅ تم إنشاء ملف aminogym.apk بنجاح!"
    echo "📍 الملف موجود في: $(pwd)/../aminogym.apk"
    echo "📱 يمكنك الآن تثبيت التطبيق على هاتف Android"
    echo ""
    echo "📋 خطوات التثبيت:"
    echo "   1. انقل ملف aminogym.apk إلى هاتفك"
    echo "   2. فعّل 'مصادر غير معروفة' في إعدادات الأمان"
    echo "   3. اضغط على ملف aminogym.apk لتثبيته"
    echo ""
    echo "🎉 تم بنجاح! Amino Gym جاهز للتثبيت"
else
    echo "❌ فشل في نسخ ملف APK"
    exit 1
fi
