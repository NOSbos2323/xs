import React, {
  useState,
  lazy,
  Suspense,
  memo,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  CreditCard,
  BarChart3,
  Calendar,
  DollarSign,
} from "lucide-react";

// Lazy load components for better performance with retry logic
const StatisticsOverview = lazy(() => import("./dashboard/StatisticsOverview"));
const AttendanceChart = lazy(() => import("./dashboard/AttendanceChart"));
const RecentActivities = lazy(() => import("./dashboard/RecentActivities"));
const MembersList = lazy(() => import("./attendance/MembersList"));
const TodayAttendancePage = lazy(
  () => import("./attendance/TodayAttendancePage"),
);
const PendingPaymentsPage = lazy(
  () => import("./payments/PendingPaymentsPage"),
);
const SimpleTodayAttendancePage = lazy(
  () => import("./attendance/SimpleTodayAttendancePage"),
);
const TopMobileNavigation = lazy(() => import("./layout/TopMobileNavigation"));
const MobileNavigationComponent = lazy(
  () => import("./layout/MobileNavigation"),
);
const SettingsPage = lazy(() => import("./settings/SettingsPage"));
const PaymentsPage = lazy(() => import("./payments/PaymentsPage"));
const ReportsPage = lazy(() => import("./reports/ReportsPage"));
const NetworkStatus = lazy(() => import("./ui/network-status"));
const InstallPrompt = lazy(() => import("./ui/install-prompt"));
const PWAInstallBanner = lazy(() => import("./ui/pwa-install-banner"));
const MemberDialog = lazy(() => import("./attendance/MemberDialog"));
const DesktopSidebar = lazy(() => import("./layout/DesktopSidebar"));
const UserGuide = lazy(() => import("./guide/UserGuide"));
const ContentLock = lazy(() => import("./ui/content-lock"));

import { formatNumber } from "@/lib/utils";
import {
  getAllMembers,
  addActivity,
  resetMemberSessions,
  searchAndFilterMembers,
  addMember,
  Member,
} from "@/services/memberService";
import { addSessionPayment } from "@/services/paymentService";
import { toast } from "@/components/ui/use-toast";
import { debounce, throttle } from "@/utils/performance";

const BackgroundBlob = memo(({ className }: { className?: string }) => (
  <div
    className={`absolute rounded-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-2xl contain-strict ${className}`}
    style={{ willChange: "transform" }}
  >
    <div className="w-[400px] h-[300px]"></div>
  </div>
));

BackgroundBlob.displayName = "BackgroundBlob";

const SidebarItem = memo(
  ({
    icon,
    label,
    active = false,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
  }) => {
    const handleClick = useCallback(() => {
      onClick?.();
    }, [onClick]);

    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer fast-transition contain-layout ${active ? "bg-blue-500/20 text-blue-300" : "text-gray-300 hover:bg-white/5"}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
      >
        <div>{icon}</div>
        <span className="font-medium text-sm">{label}</span>
      </div>
    );
  },
);

SidebarItem.displayName = "SidebarItem";

const Sidebar = memo(
  ({
    activeItem,
    setActiveItem,
  }: {
    activeItem: string;
    setActiveItem: (item: string) => void;
  }) => {
    const sidebarItems = useMemo(
      () => [
        { icon: <Home size={22} />, label: "الرئيسية", key: "dashboard" },
        { icon: <Users size={22} />, label: "الأعضاء", key: "attendance" },
        { icon: <CreditCard size={22} />, label: "المدفوعات", key: "payments" },
        { icon: <BarChart3 size={22} />, label: "التقارير", key: "reports" },
      ],
      [],
    );

    return (
      <Card className="h-full w-64 bg-slate-800/90 border border-slate-700/50 overflow-hidden hidden lg:block">
        <div className="p-4 flex flex-col h-full">
          {/* Logo Section */}
          <div className="mb-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-500 flex items-center justify-center">
              <img
                src="/yacin-gym-logo.png"
                alt="Amino Gym"
                className="w-10 h-10 rounded-full object-cover"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
            <h2 className="text-lg font-bold text-yellow-400">Amino Gym</h2>
            <p className="text-xs text-gray-400">نظام إدارة الصالة الرياضية</p>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2 flex-1">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                active={activeItem === item.key}
                onClick={() => setActiveItem(item.key)}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-slate-700/50">
            <div className="text-center text-xs text-gray-500">
              <p>© 2024 Amino Gym</p>
            </div>
          </div>
        </div>
      </Card>
    );
  },
);

const HomePage = () => {
  const [isContentLocked, setIsContentLocked] = useState(false);

  // Check if we just logged in and remove the flag
  useEffect(() => {
    const loginSuccess = localStorage.getItem("loginSuccess");
    if (loginSuccess) {
      localStorage.removeItem("loginSuccess");
    }
  }, []);

  // Content lock timer effect - Enhanced for better accuracy and device compatibility
  useEffect(() => {
    const checkContentLock = () => {
      try {
        const timerStart = localStorage.getItem("contentLockTimer");
        const isUnlocked = localStorage.getItem("contentUnlocked");
        const loginSuccess = localStorage.getItem("loginSuccess");

        // If content is manually unlocked, don't lock it
        if (isUnlocked === "true") {
          setIsContentLocked(false);
          return;
        }

        // If user just logged in, only reset timer if content was unlocked
        if (loginSuccess === "true") {
          localStorage.removeItem("loginSuccess");

          // Only reset timer if content was previously unlocked
          if (isUnlocked === "true") {
            localStorage.setItem(
              "contentLockTimer",
              new Date().getTime().toString(),
            );
            setIsContentLocked(false);
          }
          return;
        }

        if (timerStart) {
          const startTime = parseInt(timerStart, 10);
          const currentTime = new Date().getTime();
          const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

          // Validate the timer values
          if (!isNaN(startTime) && !isNaN(currentTime) && startTime > 0) {
            const elapsedTime = currentTime - startTime;

            // Debug logging for timer accuracy
            console.log("Content Lock Timer Check:", {
              startTime: new Date(startTime).toLocaleString(),
              currentTime: new Date(currentTime).toLocaleString(),
              elapsedMinutes: Math.floor(elapsedTime / (60 * 1000)),
              shouldLock: elapsedTime >= thirtyMinutes,
            });

            if (elapsedTime >= thirtyMinutes) {
              setIsContentLocked(true);
            } else {
              setIsContentLocked(false);
            }
          }
        } else {
          // If no timer is set, set it now (fallback)
          localStorage.setItem(
            "contentLockTimer",
            new Date().getTime().toString(),
          );
          setIsContentLocked(false);
        }
      } catch (error) {
        console.error("Error in content lock timer:", error);
        // On error, don't lock the content to avoid blocking users
        setIsContentLocked(false);
      }
    };

    // Check immediately
    checkContentLock();

    // Check every 30 seconds for better accuracy
    const interval = setInterval(checkContentLock, 30000);

    // Also check when the page becomes visible (for mobile devices)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkContentLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleContentUnlock = () => {
    try {
      // Set unlock flag
      localStorage.setItem("contentUnlocked", "true");
      // Reset timer for next session
      localStorage.setItem("contentLockTimer", new Date().getTime().toString());
      setIsContentLocked(false);

      console.log(
        "Content unlocked successfully at:",
        new Date().toLocaleString(),
      );
    } catch (error) {
      console.error("Error unlocking content:", error);
    }
  };
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [showTodayAttendance, setShowTodayAttendance] = React.useState(false);
  const [showPendingPayments, setShowPendingPayments] = React.useState(false);
  const [showAddSessionDialog, setShowAddSessionDialog] = React.useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = React.useState(false);
  const [showSettingsPage, setShowSettingsPage] = React.useState(false);
  const [showUserGuide, setShowUserGuide] = React.useState(false);

  // Listen for custom events from settings page
  React.useEffect(() => {
    const handleOpenAddSession = () => {
      setShowAddSessionDialog(true);
    };

    const handleOpenAddMember = () => {
      setShowAddMemberDialog(true);
    };

    window.addEventListener("openAddSessionDialog", handleOpenAddSession);
    window.addEventListener("openAddMemberDialog", handleOpenAddMember);

    return () => {
      window.removeEventListener("openAddSessionDialog", handleOpenAddSession);
      window.removeEventListener("openAddMemberDialog", handleOpenAddMember);
    };
  }, []);

  // Play success sound function - memoized
  const playSuccessSound = useCallback(async () => {
    try {
      const audio = new Audio("/success-sound.mp3");
      audio.volume = 0.7;
      await audio.play();
    } catch (error) {
      // Fallback beep sound
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3,
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (fallbackError) {
        console.error("Sound failed:", fallbackError);
      }
    }
  }, []);

  // Get current session price from settings - memoized
  const getCurrentSessionPrice = useMemo(() => {
    const savedPricing = localStorage.getItem("gymPricingSettings");
    if (savedPricing) {
      try {
        const pricing = JSON.parse(savedPricing);
        return pricing.singleSession || 200;
      } catch (error) {
        console.error("Error loading pricing:", error);
      }
    }
    return 200;
  }, []);

  // Handle add session function - memoized
  const handleAddSession = useCallback(async () => {
    try {
      const { payment, memberId } = await addSessionPayment("عضو مؤقت");
      const sessionPrice = getCurrentSessionPrice;

      toast({
        title: "تم بنجاح",
        description: `تم تسجيل حصة واحدة - ${formatNumber(sessionPrice)} دج`,
      });

      playSuccessSound();
    } catch (error) {
      console.error("Error adding session:", error);
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ أثناء تسجيل الحصة";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setShowAddSessionDialog(false);
    }
  }, [getCurrentSessionPrice, playSuccessSound]);

  // Handle add member function - memoized
  const handleAddMember = useCallback(
    async (memberData: Partial<Member>) => {
      try {
        const newMember = await addMember(memberData as Omit<Member, "id">);
        setShowAddMemberDialog(false);
        toast({
          title: "تمت الإضافة",
          description: `تم إضافة ${newMember.name} بنجاح`,
        });
        playSuccessSound();
      } catch (error) {
        console.error("Error adding member:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء إضافة العضو",
          variant: "destructive",
        });
      }
    },
    [playSuccessSound],
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Content Lock Overlay */}
      <Suspense fallback={null}>
        <ContentLock
          isVisible={isContentLocked}
          onUnlock={handleContentUnlock}
        />
      </Suspense>
      {/* Network Status Indicator */}
      <Suspense fallback={null}>
        <NetworkStatus />
      </Suspense>
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Consistent Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400/5 via-transparent to-blue-500/5" />
        </div>

        {/* Right Sidebar */}
        <div className="relative w-64 bg-slate-800/95 border-l border-slate-700/50 z-10">
          <Suspense fallback={null}>
            <DesktopSidebar
              onAddSessionClick={() => setShowAddSessionDialog(true)}
              onAddMemberClick={() => setShowAddMemberDialog(true)}
              onSettingsClick={() => setShowSettingsPage(true)}
              onSearchClick={() => setActiveTab("attendance")}
              onUserGuideClick={() => setShowUserGuide(true)}
            />
          </Suspense>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative z-10">
          {/* Enhanced Top Navigation Bar - Hidden on mobile */}
          <div className="hidden lg:hidden bg-gradient-to-r from-slate-800/95 to-slate-700/95 backdrop-blur-xl border-b border-slate-700/50 shadow-lg px-6 py-3"></div>

          {/* Simple Tab Navigation */}
          <div className="bg-slate-800/90 border-b border-slate-700/50 px-4 py-3 flex-shrink-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              defaultValue="dashboard"
              className="w-full"
            >
              <TabsList className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-1 w-full justify-end">
                <TabsTrigger
                  value="dashboard"
                  className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-md px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <Home className="w-4 h-4" />
                    <span>الرئيسية</span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="attendance"
                  className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-md px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <Users className="w-4 h-4" />
                    <span>الأعضاء</span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="payments"
                  className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-md px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <CreditCard className="w-4 h-4" />
                    <span>المدفوعات</span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="today-attendance"
                  className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-md px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <Calendar className="w-4 h-4" />
                    <span>حضور اليوم</span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="pending-payments"
                  className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-md px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <DollarSign className="w-4 h-4" />
                    <span>المدفوعات المعلقة</span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="reports"
                  className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-md px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <BarChart3 className="w-4 h-4" />
                    <span>التقارير</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Simple Content Area */}
          <div className="flex-1 bg-slate-900 relative overflow-y-auto">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              defaultValue="dashboard"
              className="w-full h-full"
            >
              {/* Dashboard Content */}
              <TabsContent
                value="dashboard"
                className="mt-0 h-full overflow-y-auto p-4"
              >
                <div className="space-y-4 max-w-6xl mx-auto">
                  {/* Simple Welcome Header */}
                  <div className="text-center mb-4">
                    <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/50">
                      <h2 className="text-xl font-bold text-yellow-400 mb-2">
                        لوحة التحكم الرئيسية
                      </h2>
                      <p className="text-slate-300 text-sm">
                        إدارة شاملة وفعالة لصالتك الرياضية
                      </p>
                    </div>
                  </div>

                  {/* Statistics Overview */}
                  <div>
                    <Suspense
                      fallback={
                        <div className="h-20 bg-slate-800/50 rounded-lg animate-pulse" />
                      }
                    >
                      <StatisticsOverview />
                    </Suspense>
                  </div>

                  {/* Simple Charts and Activities Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {/* Simple Attendance Chart */}
                    <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
                      <Suspense
                        fallback={
                          <div className="h-40 bg-slate-700/50 rounded-lg animate-pulse" />
                        }
                      >
                        <AttendanceChart />
                      </Suspense>
                    </div>

                    {/* Simple Recent Activities */}
                    <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
                      <Suspense
                        fallback={
                          <div className="h-40 bg-slate-700/50 rounded-lg animate-pulse" />
                        }
                      >
                        <RecentActivities limit={4} />
                      </Suspense>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attendance" className="mt-0 h-full">
                <div className="h-full bg-slate-800/60 rounded-lg border border-slate-700/50 m-4">
                  <Suspense
                    fallback={
                      <div className="h-full bg-slate-700/50 rounded-3xl animate-pulse" />
                    }
                  >
                    <MembersList />
                  </Suspense>
                </div>
              </TabsContent>

              <TabsContent value="payments" className="mt-0 h-full">
                <div className="h-full bg-slate-800/60 rounded-lg border border-slate-700/50 m-4">
                  <Suspense
                    fallback={
                      <div className="h-full bg-slate-700/50 rounded-3xl animate-pulse" />
                    }
                  >
                    <PaymentsPage />
                  </Suspense>
                </div>
              </TabsContent>

              <TabsContent value="today-attendance" className="mt-0 h-full">
                <div className="h-full bg-slate-800/60 rounded-lg border border-slate-700/50 m-4">
                  <Suspense
                    fallback={
                      <div className="h-full bg-slate-700/50 rounded-3xl animate-pulse" />
                    }
                  >
                    <TodayAttendancePage
                      onBack={() => setActiveTab("dashboard")}
                    />
                  </Suspense>
                </div>
              </TabsContent>

              <TabsContent value="pending-payments" className="mt-0 h-full">
                <div className="h-full bg-slate-800/60 rounded-lg border border-slate-700/50 m-4">
                  <Suspense
                    fallback={
                      <div className="h-full bg-slate-700/50 rounded-3xl animate-pulse" />
                    }
                  >
                    <PendingPaymentsPage
                      onBack={() => setActiveTab("dashboard")}
                    />
                  </Suspense>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="mt-0 h-full">
                <div className="h-full bg-slate-800/60 rounded-lg border border-slate-700/50 m-4">
                  <Suspense
                    fallback={
                      <div className="h-full bg-slate-700/50 rounded-3xl animate-pulse" />
                    }
                  >
                    <ReportsPage />
                  </Suspense>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Simple Background */}
        <div className="absolute inset-0 overflow-hidden">
          <BackgroundBlob className="w-[400px] h-[300px] -top-20 -left-20 opacity-10" />
          <BackgroundBlob className="w-[300px] h-[200px] -bottom-10 -right-10 opacity-15" />
        </div>

        <div className="relative z-10 container mx-auto px-2 sm:px-4 py-4 sm:py-6 flex h-screen">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto pb-36 sm:pb-32 pt-16">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              defaultValue="dashboard"
              className="w-full h-full"
            >
              {/* Mobile Tab Navigation */}

              {/* Mobile Dashboard Content */}
              <TabsContent value="dashboard" className="space-y-8 mt-0">
                {/* Welcome Header */}
                <div className="text-center mb-4">
                  <h1 className="text-lg font-bold text-yellow-400 mb-1">
                    مرحباً بك في Amino Gym
                  </h1>
                  <p className="text-gray-300 text-sm">
                    نظام إدارة شامل لصالتك الرياضية
                  </p>
                </div>
                {/* Statistics Overview */}
                <div>
                  <Suspense
                    fallback={
                      <div className="h-24 bg-slate-800/50 rounded-lg animate-pulse" />
                    }
                  >
                    <StatisticsOverview />
                  </Suspense>
                </div>
                {/* Charts and Activities Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Attendance Chart */}
                  <div>
                    <Suspense
                      fallback={
                        <div className="h-48 bg-slate-800/50 rounded-lg animate-pulse" />
                      }
                    >
                      <AttendanceChart />
                    </Suspense>
                  </div>

                  {/* Recent Activities */}
                  <div>
                    <Suspense
                      fallback={
                        <div className="h-48 bg-slate-800/50 rounded-lg animate-pulse" />
                      }
                    >
                      <RecentActivities limit={4} />
                    </Suspense>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="attendance" className="mt-0">
                <Suspense
                  fallback={
                    <div className="h-80 bg-slate-800/50 rounded-lg animate-pulse" />
                  }
                >
                  <MembersList />
                </Suspense>
              </TabsContent>
              <TabsContent value="payments" className="mt-0">
                <Suspense
                  fallback={
                    <div className="h-80 bg-slate-800/50 rounded-lg animate-pulse" />
                  }
                >
                  <PaymentsPage />
                </Suspense>
              </TabsContent>
              <TabsContent value="reports" className="mt-0">
                <Suspense
                  fallback={
                    <div className="h-80 bg-slate-800/50 rounded-lg animate-pulse" />
                  }
                >
                  <ReportsPage />
                </Suspense>
              </TabsContent>
              <TabsContent value="today-attendance" className="mt-0">
                <Suspense
                  fallback={
                    <div className="h-80 bg-slate-800/50 rounded-lg animate-pulse" />
                  }
                >
                  <SimpleTodayAttendancePage />
                </Suspense>
              </TabsContent>
              <TabsContent value="pending-payments" className="mt-0">
                <Suspense
                  fallback={
                    <div className="h-80 bg-slate-800/50 rounded-lg animate-pulse" />
                  }
                >
                  <PendingPaymentsPage
                    onBack={() => setActiveTab("dashboard")}
                  />
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        {/* Mobile Navigation */}
        <Suspense fallback={null}>
          <TopMobileNavigation
            activeItem={activeTab}
            setActiveItem={setActiveTab}
            onSettingsClick={() => setShowSettingsPage(true)}
          />
          <MobileNavigationComponent
            activeItem={activeTab}
            setActiveItem={(item) => {
              setActiveTab(item);
              setShowTodayAttendance(false);
              setShowPendingPayments(false);
            }}
            onTodayAttendanceClick={() => setShowTodayAttendance(true)}
            onPendingPaymentsClick={() => setShowPendingPayments(true)}
            onAddSessionClick={() => setShowAddSessionDialog(true)}
            onAddMemberClick={() => setShowAddMemberDialog(true)}
          />
        </Suspense>
      </div>
      {/* Today's Attendance Page */}
      {showTodayAttendance && (
        <div className="fixed inset-0 z-40 bg-slate-900">
          <Suspense
            fallback={<div className="h-screen bg-slate-900 animate-pulse" />}
          >
            <TodayAttendancePage onBack={() => setShowTodayAttendance(false)} />
          </Suspense>
        </div>
      )}
      {/* Pending Payments Page */}
      {showPendingPayments && (
        <div className="fixed inset-0 z-40 bg-slate-900">
          <Suspense
            fallback={<div className="h-screen bg-slate-900 animate-pulse" />}
          >
            <PendingPaymentsPage onBack={() => setShowPendingPayments(false)} />
          </Suspense>
        </div>
      )}
      {/* Settings Page */}
      {showSettingsPage && (
        <div className="fixed inset-0 z-40 bg-slate-900">
          <Suspense
            fallback={<div className="h-screen bg-slate-900 animate-pulse" />}
          >
            <SettingsPage
              onBack={() => setShowSettingsPage(false)}
              onNavigate={(page) => {
                setShowSettingsPage(false);
                if (page === "today-attendance") {
                  setShowTodayAttendance(true);
                } else if (page === "pending-payments") {
                  setShowPendingPayments(true);
                } else {
                  setActiveTab(page);
                }
              }}
            />
          </Suspense>
        </div>
      )}
      {/* Add Session Dialog */}
      <Dialog
        open={showAddSessionDialog}
        onOpenChange={setShowAddSessionDialog}
      >
        <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              إضافة حصة واحدة
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-green-400 font-semibold">
                سعر الحصة الواحدة: {formatNumber(getCurrentSessionPrice)} دج
              </p>
            </div>

            <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-400">هل أنت متأكد من إضافة حصة واحدة؟</p>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddSessionDialog(false)}
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleAddSession}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              تسجيل الحصة - {formatNumber(getCurrentSessionPrice)} دج
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add Member Dialog */}
      <Suspense fallback={null}>
        <MemberDialog
          isOpen={showAddMemberDialog}
          onClose={() => setShowAddMemberDialog(false)}
          onSave={handleAddMember}
          title="إضافة عضو جديد"
        />
      </Suspense>
      {/* User Guide */}
      <Suspense fallback={null}>
        <UserGuide
          isOpen={showUserGuide}
          onClose={() => setShowUserGuide(false)}
        />
      </Suspense>
      {/* Install Prompt */}
      <Suspense fallback={null}>
        <InstallPrompt />
      </Suspense>

      {/* PWA Install Banner */}
      <Suspense fallback={null}>
        <PWAInstallBanner />
      </Suspense>
      {/* Add padding to account for top and bottom navigation bars on mobile */}
      <div className="pt-16 pb-32 lg:pt-0 lg:pb-0 md:hidden" />
    </div>
  );
};

export default HomePage;
