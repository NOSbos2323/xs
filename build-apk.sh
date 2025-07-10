#!/bin/bash

# Amino Gym APK Builder Script
# سكريبت بناء ملف APK لتطبيق Amino Gym

echo "🚀 بدء إنشاء ملف APK لـ Amino Gym..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm غير مثبت. يرجى تثبيت npm أولاً"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت التبعيات..."
    npm install
fi

# Build the web application
echo "🏗️ بناء التطبيق..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ فشل في بناء التطبيق"
    exit 1
fi

# Install Capacitor if not already installed
if ! npm list @capacitor/core &> /dev/null; then
    echo "⚡ تثبيت Capacitor..."
    npm install @capacitor/core @capacitor/cli @capacitor/android
fi

# Initialize Capacitor project if android folder doesn't exist
if [ ! -d "android" ]; then
    echo "🔧 تهيئة مشروع Capacitor..."
    npx cap init "Amino Gym" "com.aminogym.app" --web-dir=dist
    
    echo "📱 إضافة منصة Android..."
    npx cap add android
fi

# Copy web assets and sync
echo "📋 نسخ الملفات ومزامنة المشروع..."
npx cap copy
npx cap sync

echo "✅ تم إنشاء مشروع Android بنجاح!"
echo ""
echo "📍 المجلد: ./android"
echo "🔧 لبناء APK:"
echo "   1. افتح Android Studio"
echo "   2. افتح مجلد ./android"
echo "   3. اختر Build > Build Bundle(s) / APK(s) > Build APK(s)"
echo ""
echo "أو استخدم سطر الأوامر:"
echo "   cd android && ./gradlew assembleDebug"
echo ""
echo "📱 ملف APK سيكون في: android/app/build/outputs/apk/debug/"