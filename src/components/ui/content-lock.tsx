import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Phone, CheckCircle, AlertCircle } from "lucide-react";

interface ContentLockProps {
  isVisible: boolean;
  onUnlock: () => void;
}

const ContentLock: React.FC<ContentLockProps> = ({ isVisible, onUnlock }) => {
  const [code, setCode] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = () => {
    setShowPhone(true);
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (code.toLowerCase().trim() === "je suis la") {
      onUnlock();
    } else {
      setError("الرمز غير صحيح. يرجى المحاولة مرة أخرى.");
    }

    setIsLoading(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-red-400/10 to-orange-500/10 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-blue-400/10 to-purple-500/10 blur-3xl"
          animate={{
            x: [0, -25, 0],
            y: [0, -15, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto flex flex-col items-center w-full max-w-sm sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full"
        >
          {/* Lock Icon */}
          <motion.div
            className="flex justify-center mb-4 sm:mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-500 rounded-full blur-lg opacity-50 animate-pulse" />
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-red-300/50">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-slate-800/90 backdrop-blur-2xl border border-slate-700/50 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="text-center">
                  <motion.h2
                    className="text-xl sm:text-2xl font-bold text-white mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    🔒 انتهت التجربة المجانية
                  </motion.h2>
                  <motion.p
                    className="text-slate-300 text-sm mb-4 sm:mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    انتهت فترة الاستخدام المجاني. أدخل رمز التفعيل للمتابعة
                  </motion.p>
                </div>

                <form
                  onSubmit={handleSubmitCode}
                  className="space-y-4 sm:space-y-5"
                >
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <Label
                      htmlFor="code"
                      className="text-slate-200 font-medium text-sm sm:text-base"
                    >
                      رمز التفعيل
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:border-red-400/50 focus:ring-red-400/20 transition-all duration-300 h-10 sm:h-12 text-sm sm:text-base"
                      placeholder="أدخل رمز التفعيل"
                      required
                      disabled={isLoading}
                    />
                  </motion.div>

                  {error && (
                    <motion.div
                      className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center justify-center gap-2"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </motion.div>
                  )}

                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading || !code.trim()}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold h-10 sm:h-12 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-sm sm:text-base">
                            جاري التحقق...
                          </span>
                        </div>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          <span className="text-sm sm:text-base">
                            تفعيل الرمز
                          </span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      onClick={handleRequestCode}
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 h-10 sm:h-12 text-sm sm:text-base"
                      disabled={isLoading}
                    >
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="text-sm sm:text-base">
                        طلب رمز التفعيل
                      </span>
                    </Button>
                  </motion.div>
                </form>

                {showPhone && (
                  <motion.div
                    className="text-center p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                      <span className="text-blue-400 font-semibold text-sm sm:text-base">
                        اتصل بنا للحصول على الرمز
                      </span>
                    </div>
                    <p className="text-blue-300 text-base sm:text-lg font-bold">
                      📞 +213 123 456 789
                    </p>
                    <p className="text-slate-400 text-xs sm:text-sm mt-2">
                      اتصل بهذا الرقم للحصول على رمز التفعيل
                    </p>
                  </motion.div>
                )}

                <motion.div
                  className="text-center text-xs text-slate-400 border-t border-slate-700/50 pt-3 sm:pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <p className="text-xs sm:text-sm">
                    للحصول على النسخة الكاملة، يرجى الاتصال بالدعم الفني
                  </p>
                  <p className="text-slate-500 mt-1 text-xs">
                    © 2024 Amino Gym - جميع الحقوق محفوظة
                  </p>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContentLock;
