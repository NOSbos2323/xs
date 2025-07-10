# إعداد بيئة تطوير Android لـ Amino Gym

## الخطوة 1: تثبيت المتطلبات الأساسية

### تثبيت Node.js
1. اذهب إلى [nodejs.org](https://nodejs.org/)
2. حمّل النسخة LTS (الموصى بها)
3. قم بتثبيتها واتبع التعليمات

### تثبيت Java Development Kit (JDK)
1. حمّل JDK 11 من [Oracle](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)
2. قم بتثبيته
3. أضف JAVA_HOME إلى متغيرات البيئة:
   ```
   JAVA_HOME=C:\Program Files\Java\jdk-11.0.x
   ```

### تثبيت Android Studio
1. حمّل Android Studio من [developer.android.com](https://developer.android.com/studio)
2. قم بتثبيته مع Android SDK
3. افتح Android Studio واتبع معالج الإعداد الأولي
4. تأكد من تثبيت:
   - Android SDK Platform 33 (أو أحدث)
   - Android SDK Build-Tools
   - Android SDK Command-line Tools

## الخطوة 2: إعداد متغيرات البيئة

### Windows:
```cmd
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
```

### macOS/Linux:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

## الخطوة 3: إنشاء APK

### الطريقة السريعة:
```bash
# تشغيل السكريبت التلقائي
chmod +x build-apk.sh
./build-apk.sh
```

### الطريقة اليدوية:
```bash
# 1. تثبيت التبعيات
npm install

# 2. بناء التطبيق
npm run build

# 3. تهيئة Capacitor
npx cap init "Amino Gym" "com.aminogym.app" --web-dir=dist
npx cap add android

# 4. نسخ الملفات
npx cap copy
npx cap sync

# 5. بناء APK
cd android
./gradlew assembleDebug
```

## الخطوة 4: العثور على ملف APK

بعد اكتمال البناء، ستجد ملف APK في:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## الخطوة 5: تثبيت التطبيق

1. انقل ملف APK إلى هاتف Android
2. فعّل "مصادر غير معروفة" في الإعدادات
3. اضغط على ملف APK لتثبيته

## نصائح مهمة:

- تأكد من تفعيل وضع المطور على هاتفك
- استخدم كابل USB أصلي للاتصال
- تأكد من تثبيت تعريفات USB للهاتف
- قم بإعادة تشغيل Android Studio إذا واجهت مشاكل

## حل المشاكل:

### خطأ "JAVA_HOME not set":
```bash
export JAVA_HOME=/path/to/java
```

### خطأ "Android SDK not found":
```bash
export ANDROID_HOME=/path/to/android/sdk
```

### خطأ في Gradle:
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```
