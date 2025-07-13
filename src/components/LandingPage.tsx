import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Smartphone,
  Monitor,
  Tablet,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

const LandingPage = () => {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [isOnline] = React.useState(navigator.onLine);

  const handleInstallApp = async () => {
    const success = await promptInstall();

    if (!success) {
      // Fallback instructions for different platforms
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      let msg = "📱 لتثبيت التطبيق:\n\n";

      if (isIOS) {
        msg += "1️⃣ اضغط زر المشاركة ⬆️\n2️⃣ اختر 'إضافة للشاشة الرئيسية'";
      } else if (isAndroid) {
        msg += "1️⃣ اضغط قائمة المتصفح ⋮\n2️⃣ اختر 'تثبيت التطبيق'";
      } else {
        msg +=
          "1️⃣ ابحث عن أيقونة التثبيت في شريط العناوين\n2️⃣ أو اضغط Ctrl+Shift+A";
      }

      alert(msg);
    }
  };

  const features = [
    {
      icon: "👥",
      title: "إدارة الأعضاء",
      description: "تتبع بيانات الأعضاء والاشتراكات بسهولة",
    },
    {
      icon: "💰",
      title: "إدارة المدفوعات",
      description: "تسجيل ومتابعة جميع المدفوعات والمستحقات",
    },
    {
      icon: "📊",
      title: "التقارير والإحصائيات",
      description: "تقارير مفصلة عن أداء الصالة الرياضية",
    },
    {
      icon: "📱",
      title: "يعمل بدون انترنت",
      description: "استخدم التطبيق حتى بدون اتصال بالإنترنت",
    },
  ];

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80')",
      }}
    >
      {/* Enhanced Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-md"></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-yellow-400/10 to-orange-500/10 blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-blue-400/10 to-purple-500/10 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-8 mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-50 animate-pulse" />
              <img
                src="/yacin-gym-logo.png"
                alt="Amino Gym Logo"
                className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full shadow-2xl border-4 border-yellow-300/50 object-cover"
              />
            </div>
          </div>

          <motion.h1
            className="text-4xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Amino Gym
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-slate-300 mb-6 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            نظام إدارة شامل للصالة الرياضية
          </motion.p>

          <motion.p
            className="text-lg text-slate-400 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            إدارة الأعضاء والمدفوعات والتقارير بطريقة سهلة ومتطورة. يعمل على
            جميع الأجهزة وبدون انترنت.
          </motion.p>

          {/* Install Button */}
          {isInstallable && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mb-8"
            >
              <Button
                onClick={handleInstallApp}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-lg px-8 py-4 h-auto shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                <Download className="w-6 h-6 mr-3" />
                تثبيت التطبيق الآن
              </Button>
              <p className="text-slate-400 text-sm mt-3">
                احصل على تجربة أفضل مع التطبيق المثبت
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
            >
              <Card className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6 text-center hover:border-slate-600/60 transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Platform Support */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            يعمل على جميع الأجهزة
          </h2>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-slate-300">
              <Smartphone className="w-6 h-6 text-yellow-400" />
              <span>الهاتف المحمول</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Tablet className="w-6 h-6 text-yellow-400" />
              <span>الجهاز اللوحي</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Monitor className="w-6 h-6 text-yellow-400" />
              <span>الحاسوب</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              {isOnline ? (
                <Wifi className="w-6 h-6 text-green-400" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-400" />
              )}
              <span>{isOnline ? "متصل" : "يعمل بدون انترنت"}</span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="text-center text-slate-400 text-sm"
        >
          <p>© 2024 Amino Gym - جميع الحقوق محفوظة</p>
          <p className="mt-2">
            تطبيق ويب متقدم (PWA) • قابل للتثبيت • يعمل بدون انترنت
          </p>
        </motion.div>
      </div>

      {/* Enhanced Animated Blobs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl"
        animate={{
          x: [0, -25, 0],
          y: [0, -15, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  );
};

export default LandingPage;
