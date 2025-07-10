import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X, Smartphone } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

interface PWAInstallBannerProps {
  className?: string;
}

const PWAInstallBanner = ({ className = "" }: PWAInstallBannerProps) => {
  const { canInstall, installApp, isInstalled } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner before
    const isDismissed = localStorage.getItem("pwa-banner-dismissed") === "true";

    if (canInstall && !isInstalled && !isDismissed) {
      // Show banner after a delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled]);

  const handleInstall = async () => {
    try {
      await installApp();
      setShowBanner(false);
    } catch (error) {
      console.error("Failed to install app:", error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (!showBanner || isInstalled) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}
      >
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500/50 shadow-2xl backdrop-blur-xl">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm">
                    ثبت تطبيق Amino Gym
                  </h3>
                  <p className="text-blue-100 text-xs">
                    للوصول السريع وتجربة أفضل
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold"
                >
                  <Download className="w-4 h-4 mr-1" />
                  تثبيت
                </Button>

                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallBanner;
