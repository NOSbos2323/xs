import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Save,
  Download,
  Upload,
  RefreshCw,
  Shield,
  Database,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { sessionService } from "@/services/sessionService";

interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ isOpen, onClose }) => {
  const [sessionStats, setSessionStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [autoSaveProgress, setAutoSaveProgress] = useState(0);

  // تحديث إحصائيات الجلسة
  useEffect(() => {
    if (isOpen) {
      updateSessionStats();
      const interval = setInterval(updateSessionStats, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // تحديث شريط التقدم للحفظ التلقائي
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setAutoSaveProgress((prev) => {
          const newProgress = (prev + 1) % 100;
          if (newProgress === 0) {
            // تم الحفظ التلقائي
            sessionService.saveSessionData();
          }
          return newProgress;
        });
      }, 300); // 30 ثانية = 30000ms / 100 = 300ms
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const updateSessionStats = () => {
    const stats = sessionService.getSessionStats();
    setSessionStats(stats);
  };

  const handleForceSave = async () => {
    setIsLoading(true);
    try {
      await sessionService.forceSave();
      toast({
        title: "تم الحفظ",
        description: "تم حفظ جميع البيانات بنجاح",
      });
      updateSessionStats();
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      await sessionService.createBackup();
      toast({
        title: "تم إنشاء النسخة الاحتياطية",
        description: "تم إنشاء نسخة احتياطية شاملة من جميع البيانات",
      });
      setShowBackupDialog(false);
    } catch (error) {
      toast({
        title: "خطأ في النسخ الاحتياطي",
        description: "حدث خطأ أثناء إنشاء النسخة الاحتياطية",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    setIsLoading(true);
    try {
      const success = await sessionService.restoreBackup();
      if (success) {
        toast({
          title: "تم الاستعادة",
          description: "تم استعادة النسخة الاحتياطية بنجاح",
        });
      } else {
        toast({
          title: "فشل الاستعادة",
          description: "لا توجد نسخة احتياطية للاستعادة",
          variant: "destructive",
        });
      }
      setShowRestoreDialog(false);
    } catch (error) {
      toast({
        title: "خطأ في الاستعادة",
        description: "حدث خطأ أثناء استعادة النسخة الاحتياطية",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      const exportData = await sessionService.exportData();
      const blob = new Blob([exportData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gym-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "تم التصدير",
        description: "تم تصدير البيانات بنجاح",
      });
      setShowExportDialog(false);
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async () => {
    if (!importFile) return;

    setIsLoading(true);
    try {
      const text = await importFile.text();
      const success = await sessionService.importData(text);

      if (success) {
        toast({
          title: "تم الاستيراد",
          description: "تم استيراد البيانات بنجاح",
        });
      } else {
        toast({
          title: "فشل الاستيراد",
          description: "البيانات المستوردة غير صحيحة",
          variant: "destructive",
        });
      }
      setImportFile(null);
    } catch (error) {
      toast({
        title: "خطأ في الاستيراد",
        description: "حدث خطأ أثناء استيراد البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateData = async () => {
    setIsLoading(true);
    try {
      const isValid = await sessionService.validateDataIntegrity();
      toast({
        title: isValid ? "البيانات سليمة" : "تم اكتشاف مشاكل",
        description: isValid
          ? "جميع البيانات في حالة جيدة"
          : "تم إصلاح المشاكل المكتشفة",
        variant: isValid ? "default" : "destructive",
      });
      updateSessionStats();
    } catch (error) {
      toast({
        title: "خطأ في التحقق",
        description: "حدث خطأ أثناء التحقق من البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-400" />
              مدير الجلسات والبيانات
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* إحصائيات الجلسة */}
            {sessionStats && (
              <Card className="bg-slate-700/50 border-slate-600 p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  إحصائيات الجلسة الحالية
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">مدة الجلسة:</span>
                      <Badge
                        variant="outline"
                        className="text-green-400 border-green-400"
                      >
                        {sessionStats.duration} دقيقة
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">آخر نشاط:</span>
                      <Badge
                        variant="outline"
                        className="text-blue-400 border-blue-400"
                      >
                        {sessionStats.lastActivity} دقيقة
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">عدد الحفظ:</span>
                      <Badge
                        variant="outline"
                        className="text-yellow-400 border-yellow-400"
                      >
                        {sessionStats.saveCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">حالة البيانات:</span>
                      <Badge
                        variant={
                          sessionStats.dataIntegrity ? "default" : "destructive"
                        }
                        className={
                          sessionStats.dataIntegrity
                            ? "text-green-400 border-green-400"
                            : ""
                        }
                      >
                        {sessionStats.dataIntegrity ? "سليمة" : "تحتاج إصلاح"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* شريط تقدم الحفظ التلقائي */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-300">
                      الحفظ التلقائي التالي:
                    </span>
                    <span className="text-sm text-blue-400">
                      {Math.floor((100 - autoSaveProgress) * 0.3)}ث
                    </span>
                  </div>
                  <Progress value={autoSaveProgress} className="h-2" />
                </div>
              </Card>
            )}

            {/* أزرار الإجراءات */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleForceSave}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                حفظ فوري
              </Button>

              <Button
                onClick={handleValidateData}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                فحص البيانات
              </Button>

              <Button
                onClick={() => setShowBackupDialog(true)}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Database className="w-4 h-4 mr-2" />
                نسخ احتياطي
              </Button>

              <Button
                onClick={() => setShowRestoreDialog(true)}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                استعادة
              </Button>

              <Button
                onClick={() => setShowExportDialog(true)}
                disabled={isLoading}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                تصدير البيانات
              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button
                  onClick={importFile ? handleImportData : undefined}
                  disabled={isLoading || !importFile}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {importFile
                    ? `استيراد ${importFile.name}`
                    : "اختر ملف للاستيراد"}
                </Button>
              </div>
            </div>

            {/* معلومات إضافية */}
            <Card className="bg-slate-700/30 border-slate-600 p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="space-y-2 text-sm text-slate-300">
                  <p>• يتم الحفظ التلقائي كل 30 ثانية</p>
                  <p>• يتم إنشاء نسخة احتياطية عند كل تسجيل دخول</p>
                  <p>• البيانات محفوظة محلياً ولا تحتاج اتصال بالإنترنت</p>
                  <p>• يمكن تصدير واستيراد البيانات في أي وقت</p>
                </div>
              </div>
            </Card>
          </div>

          <DialogFooter>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* حوار النسخ الاحتياطي */}
      <AlertDialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <AlertDialogContent className="bg-slate-800 text-white border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-purple-400">
              إنشاء نسخة احتياطية
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              سيتم إنشاء نسخة احتياطية شاملة من جميع البيانات (الأعضاء،
              المدفوعات، الأنشطة، والإعدادات). هذه العملية آمنة ولن تؤثر على
              البيانات الحالية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateBackup}
              className="bg-purple-600 hover:bg-purple-700"
            >
              إنشاء النسخة الاحتياطية
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* حوار الاستعادة */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent className="bg-slate-800 text-white border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-orange-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              استعادة النسخة الاحتياطية
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              تحذير: سيتم استبدال جميع البيانات الحالية بالنسخة الاحتياطية
              الأخيرة. تأكد من أن لديك نسخة احتياطية حديثة قبل المتابعة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreBackup}
              className="bg-orange-600 hover:bg-orange-700"
            >
              استعادة البيانات
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* حوار التصدير */}
      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent className="bg-slate-800 text-white border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cyan-400">
              تصدير البيانات
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              سيتم تصدير جميع البيانات في ملف JSON يمكن حفظه واستيراده لاحقاً.
              هذا الملف يحتوي على جميع الأعضاء والمدفوعات والأنشطة والإعدادات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExportData}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              تصدير البيانات
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SessionManager;
