import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

interface InstallPromptProps {
  onDismiss?: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onDismiss }) => {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = React.useState(false);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success || onDismiss) {
      setIsDismissed(true);
      onDismiss?.();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (!isInstallable || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80"
      >
        <div className="bg-gradient-to-r from-bluegray-800/95 to-bluegray-900/95 backdrop-blur-xl border border-bluegray-600/50 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center">
                <img
                  src="/yacin-gym-logo.png"
                  alt="Amino Gym"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  تثبيت Amino Gym
                </h3>
                <p className="text-gray-300 text-xs">
                  احصل على تجربة أفضل مع التطبيق
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold text-sm h-9"
            >
              <Download className="h-4 w-4 mr-2" />
              تثبيت
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="border-bluegray-600 text-gray-300 hover:bg-bluegray-700 text-sm h-9 px-4"
            >
              لاحقاً
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;
