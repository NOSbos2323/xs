# دليل إنشاء ملف APK لتطبيق Amino Gym

## المتطلبات الأساسية

### 1. تثبيت Node.js
- قم بتحميل وتثبيت Node.js من [nodejs.org](https://nodejs.org/)
- تأكد من تثبيت الإصدار 16 أو أحدث

### 2. تثبيت Android Studio (اختياري)
- قم بتحميل Android Studio من [developer.android.com](https://developer.android.com/studio)
- قم بتثبيت Android SDK

### 3. تثبيت Java Development Kit (JDK)
- قم بتثبيت JDK 11 أو أحدث
- تأكد من إعداد متغير البيئة JAVA_HOME

## طرق إنشاء ملف APK

### الطريقة الأولى: استخدام السكريبت التلقائي

```bash
# منح صلاحيات التنفيذ للسكريبت
chmod +x build-apk.sh

# تشغيل السكريبت
./build-apk.sh
```

### الطريقة الثانية: الخطوات اليدوية

1. **تثبيت التبعيات:**
```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
```

2. **بناء التطبيق:**
```bash
npm run build
```

3. **تهيئة Capacitor:**
```bash
npx cap init "Amino Gym" "com.aminogym.app" --web-dir=dist
npx cap add android
```

4. **نسخ الملفات ومزامنة المشروع:**
```bash
npx cap copy
npx cap sync
```

5. **بناء APK:**
```bash
cd android
./gradlew assembleDebug
```

### الطريقة الثالثة: استخدام Android Studio

1. افتح Android Studio
2. اختر "Open an existing Android Studio project"
3. اختر مجلد `android` في مشروعك
4. انتظر حتى يتم تحميل المشروع
5. اذهب إلى `Build > Build Bundle(s) / APK(s) > Build APK(s)`
6. انتظر حتى يكتمل البناء

## مواقع ملفات APK

بعد اكتمال البناء، ستجد ملف APK في:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## تثبيت التطبيق على الهاتف

### للتطوير والاختبار:
1. فعّل "مصادر غير معروفة" في إعدادات الأمان
2. انقل ملف APK إلى هاتفك
3. اضغط على الملف لتثبيته

### للنشر:
- قم بتوقيع APK باستخدام مفتاح التوقيع
- ارفعه إلى Google Play Store أو وزعه مباشرة

## حل المشاكل الشائعة

### خطأ في JAVA_HOME
```bash
export JAVA_HOME=/path/to/your/java
export PATH=$JAVA_HOME/bin:$PATH
```

### خطأ في Android SDK
```bash
export ANDROID_HOME=/path/to/android/sdk
export PATH=$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$PATH
```

### خطأ في Gradle
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

## ميزات التطبيق

- ✅ يعمل بدون إنترنت
- ✅ قابل للتثبيت على Android
- ✅ واجهة عربية كاملة
- ✅ إدارة الأعضاء والمدفوعات
- ✅ تقارير مفصلة
- ✅ نسخ احتياطي للبيانات

## الدعم

إذا واجهت أي مشاكل، تأكد من:
1. تثبيت جميع المتطلبات الأساسية
2. تحديث Node.js إلى أحدث إصدار
3. التأكد من إعدادات متغيرات البيئة
4. مراجعة رسائل الخطأ في Terminal
