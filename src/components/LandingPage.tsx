import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle,
  Users,
  CreditCard,
  BarChart3,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [isInstalling, setIsInstalling] = useState(false);

  // Check if user is already logged in and redirect to home
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.loggedIn) {
          navigate("/home", { replace: true });
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, [navigate]);

  const handleInstallApp = async () => {
    setIsInstalling(true);

    try {
      const success = await promptInstall();
      if (success) {
        // After successful installation, redirect to login
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (error) {
      console.error("Installation failed:", error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "إدارة الأعضاء",
      description: "تتبع وإدارة جميع أعضاء الصالة الرياضية بسهولة",
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "إدارة المدفوعات",
      description: "تتبع المدفوعات والاشتراكات بشكل منظم",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "تتبع الحضور",
      description: "مراقبة حضور الأعضاء اليومي والشهري",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "التقارير والإحصائيات",
      description: "تقارير مفصلة عن أداء الصالة الرياضية",
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
      <div className="container relative z-10 px-4 py-6 sm:py-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          {/* Logo and Header Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-50 animate-pulse" />
                <img
                  src="/yacin-gym-logo.png"
                  alt="Amino Gym Logo"
                  className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full shadow-2xl border-4 border-yellow-300/50 object-cover backdrop-blur-sm"
                />
              </div>

              <motion.h1
                className="text-4xl sm:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Amino Gym
              </motion.h1>

              <motion.p
                className="text-xl sm:text-2xl text-slate-300 font-medium mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                نظام إدارة الصالة الرياضية الشامل
              </motion.p>

              <motion.p
                className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                حلول متكاملة لإدارة الأعضاء والمدفوعات والحضور مع تقارير مفصلة
                وواجهة سهلة الاستخدام
              </motion.p>
            </div>
          </motion.div>
          {/* Features Grid */}

          {/* Install Section */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <Card className="bg-slate-800/90 backdrop-blur-2xl border border-slate-700/50 shadow-2xl max-w-md mx-auto">
              <div className="p-8 space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    ابدأ الآن
                  </h2>
                  <p className="text-slate-300 text-sm mb-6">
                    ثبت التطبيق للحصول على أفضل تجربة استخدام
                  </p>
                </div>

                <div className="space-y-4">
                  {isInstallable ? (
                    <Button
                      onClick={handleInstallApp}
                      disabled={isInstalling}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold h-12 text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    >
                      {isInstalling ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          <span>جاري التثبيت...</span>
                        </div>
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" />
                          تثبيت التطبيق
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 font-semibold">
                        التطبيق مثبت بالفعل!
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleLoginRedirect}
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 h-12 text-base"
                  >
                    تسجيل الدخول
                  </Button>
                </div>

                {/* Device compatibility indicators */}
                <div className="flex justify-center gap-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Smartphone className="w-4 h-4" />
                    <span>الهاتف</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Tablet className="w-4 h-4" />
                    <span>التابلت</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Monitor className="w-4 h-4" />
                    <span>الحاسوب</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
          {/* Footer */}
          <motion.div
            className="text-center text-xs text-slate-400 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <p className="text-slate-500">
              © 2024 Amino Gym - جميع الحقوق محفوظة
            </p>
            <p className="text-slate-600 text-xs mt-1">
              PWA مُحسّن • يعمل دون انترنت • قابل للتثبيت
            </p>
          </motion.div>
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
