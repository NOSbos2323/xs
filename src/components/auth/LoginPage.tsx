import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LogIn,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("ADMIN");
  const [password, setPassword] = useState("ADMIN ADMIN");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Check if user is already logged in and load remembered credentials
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

    // Load remembered credentials
    const rememberedCredentials = localStorage.getItem("rememberedCredentials");
    if (rememberedCredentials) {
      try {
        const credentials = JSON.parse(rememberedCredentials);
        setUsername(credentials.username || "");
        setRememberMe(true);
      } catch (error) {
        console.error("Error loading remembered credentials:", error);
      }
    }

    // Listen for PWA install prompt
    const handleInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setCanInstall(false);
      } else {
        setCanInstall(true);
      }
    };

    checkIfInstalled();
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate loading for better UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Get saved password or use default
    const savedPassword = localStorage.getItem("gymPassword") || "ADMIN ADMIN";
    const savedUser = JSON.parse(
      localStorage.getItem("gymUserSettings") || "{}",
    );
    const savedUsername = savedUser.username || "ADMIN";

    // Check credentials
    if (username === savedUsername && password === savedPassword) {
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem(
          "rememberedCredentials",
          JSON.stringify({
            username: username,
            rememberMe: true,
          }),
        );
      } else {
        localStorage.removeItem("rememberedCredentials");
      }

      // Store login info with enhanced timer for all devices
      const currentTime = new Date().getTime();
      const userData = {
        loggedIn: true,
        userInfo: {
          username: "ADMIN",
          name: "Administrator",
          role: "admin",
        },
        loginTime: new Date().toISOString(),
        loginTimestamp: currentTime,
      };

      // Set login data - preserve existing timer if content is not unlocked
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("loginSuccess", "true");

      // Only reset timer if content was previously unlocked or no timer exists
      const isUnlocked = localStorage.getItem("contentUnlocked");
      const existingTimer = localStorage.getItem("contentLockTimer");

      if (isUnlocked === "true" || !existingTimer) {
        localStorage.setItem("contentLockTimer", currentTime.toString());
      }

      // Debug logging for timer setup
      console.log("Login timer set:", {
        timestamp: currentTime,
        date: new Date(currentTime).toLocaleString(),
        willLockAt: new Date(currentTime + 30 * 60 * 1000).toLocaleString(),
      });

      // Navigate to home page
      navigate("/home", { replace: true });
    } else {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    }

    setIsLoading(false);
  };

  const handleInstallApp = async () => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      alert("✅ التطبيق مثبت بالفعل!");
      return;
    }

    // Try direct installation first
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
          setCanInstall(false);
          alert("🎉 تم التثبيت بنجاح!");
        }

        setDeferredPrompt(null);
        return;
      } catch (error) {
        console.error("Installation failed:", error);
      }
    }

    // Simple fallback instructions
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
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80')",
      }}
    >
      {/* Enhanced Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-md"></div>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-yellow-400/10 to-orange-500/10 blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-blue-400/10 to-purple-500/10 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>
      {/* Install Button - Top Left */}

      {/* Platform and Status indicators */}
      {/* Content */}
      <div className="container relative z-10 px-4 py-6 sm:py-10 mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Enhanced Logo Section */}
          <motion.div
            className="flex justify-center mb-6 sm:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-50 animate-pulse" />
                <img
                  src="/yacin-gym-logo.png"
                  alt="Amino Gym Logo"
                  className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full shadow-2xl border-4 border-yellow-300/50 object-cover backdrop-blur-sm"
                />
              </div>
              <motion.h1
                className="text-3xl sm:text-4xl font-bold text-center mt-4 mb-2 bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Amino Gym
              </motion.h1>
              <motion.p
                className="text-slate-300 text-sm font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                نظام إدارة الصالة الرياضية
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-slate-800/90 backdrop-blur-2xl border border-slate-700/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-slate-600/60">
              <div className="p-6 sm:p-8 space-y-6">
                <div className="text-center">
                  <motion.h2
                    className="text-xl sm:text-2xl font-bold text-white mb-2 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    تسجيل الدخول
                  </motion.h2>
                  <motion.p
                    className="text-slate-300 text-sm mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    أدخل بياناتك للوصول إلى النظام
                  </motion.p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <Label
                      htmlFor="username"
                      className="text-slate-200 font-medium"
                    >
                      اسم المستخدم
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:border-yellow-400/50 focus:ring-yellow-400/20 transition-all duration-300 h-12 text-base"
                      placeholder="أدخل اسم المستخدم"
                      required
                      disabled={isLoading}
                    />
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                  >
                    <Label
                      htmlFor="password"
                      className="text-slate-200 font-medium"
                    >
                      كلمة المرور
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:border-yellow-400/50 focus:ring-yellow-400/20 transition-all duration-300 h-12 text-base pr-12"
                        placeholder="أدخل كلمة المرور"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors duration-200"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center space-x-2 space-x-reverse"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                  >
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked as boolean)
                      }
                      className="border-slate-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="remember"
                      className="text-slate-300 text-sm cursor-pointer"
                    >
                      تذكرني
                    </Label>
                  </motion.div>

                  {error && (
                    <motion.div
                      className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.1 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold h-12 text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          <span>جاري تسجيل الدخول...</span>
                        </div>
                      ) : (
                        <>
                          <LogIn className="w-5 h-5 mr-2" />
                          تسجيل الدخول
                        </>
                      )}
                    </Button>
                    {/* Install App Button - Always visible */}
                  </motion.div>
                </form>

                <motion.div
                  className="text-center text-xs text-slate-400 mt-6 border-t border-slate-700/50 pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <p>بالضغط على تسجيل الدخول، فإنك توافق على شروط الاستخدام</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-slate-500">
                      © 2024 Amino Gym - جميع الحقوق محفوظة
                    </p>
                    <p className="text-slate-600 text-xs">
                      {isOnline ? "✓ يعمل دون انترنت" : "⚡ وضع عدم الاتصال"} •
                      PWA مُحسّن • قابل للتثبيت
                    </p>
                  </div>
                </motion.div>
              </div>
            </Card>
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
      <motion.div
        className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-yellow-500/8 to-orange-500/8 blur-3xl"
        animate={{
          x: [0, 15, 0],
          y: [0, -25, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  );
};

export default LoginPage;
