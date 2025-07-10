import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Users,
  Calendar,
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  X,
  Home,
  Settings,
  BarChart3,
  Clock,
  UserPlus,
  Smartphone,
  Eye,
  Edit,
  Save,
  LogOut,
  Download,
  Upload,
  Trash2,
  BookOpen,
  MousePointer,
  Filter,
  RefreshCw,
  FileText,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserGuide = ({ isOpen, onClose }: UserGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    {
      title: "مرحباً بك في Amino Gym",
      icon: <Home className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      steps: [
        {
          title: "نظرة عامة على النظام",
          content: (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                  <img
                    src="/yacin-gym-logo.png"
                    alt="Amino Gym"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  مرحباً بك في Amino Gym
                </h3>
                <p className="text-gray-300">
                  نظام إدارة شامل وحديث للصالة الرياضية
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <Users className="w-8 h-8 text-blue-400 mb-2" />
                  <h4 className="font-semibold text-white mb-1">
                    إدارة الأعضاء
                  </h4>
                  <p className="text-sm text-gray-300">
                    إضافة وتعديل وإدارة بيانات الأعضاء بسهولة
                  </p>
                </div>

                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <Calendar className="w-8 h-8 text-green-400 mb-2" />
                  <h4 className="font-semibold text-white mb-1">
                    تسجيل الحضور
                  </h4>
                  <p className="text-sm text-gray-300">
                    تتبع حضور الأعضاء وإدارة الحصص المتبقية
                  </p>
                </div>

                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                  <CreditCard className="w-8 h-8 text-purple-400 mb-2" />
                  <h4 className="font-semibold text-white mb-1">
                    إدارة المدفوعات
                  </h4>
                  <p className="text-sm text-gray-300">
                    تسجيل المدفوعات وتتبع الاشتراكات
                  </p>
                </div>

                <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                  <BarChart3 className="w-8 h-8 text-orange-400 mb-2" />
                  <h4 className="font-semibold text-white mb-1">التقارير</h4>
                  <p className="text-sm text-gray-300">
                    إحصائيات شاملة وتقارير مفصلة
                  </p>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "واجهة النظام",
          content: (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">
                التنقل في النظام
              </h3>

              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-400" />
                    على الهاتف المحمول
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      شريط التنقل العلوي للوصول السريع
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      شريط التنقل السفلي للأقسام الرئيسية
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      أزرار الإجراءات السريعة
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-green-400" />
                    على الكمبيوتر
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      الشريط الجانبي للتنقل والإعدادات
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      التبويبات العلوية للأقسام
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      شريط البحث والإجراءات السريعة
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "رموز الأزرار في النظام",
          content: (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">
                دليل رموز الأزرار ووظائفها
              </h3>

              <div className="space-y-6">
                {/* أزرار التنقل الرئيسية */}
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                    <MousePointer className="w-5 h-5" />
                    أزرار التنقل الرئيسية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Home className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">الرئيسية</div>
                        <div className="text-xs text-gray-400">
                          العودة للوحة التحكم
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Users className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">الأعضاء</div>
                        <div className="text-xs text-gray-400">
                          إدارة قائمة الأعضاء
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <CreditCard className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">المدفوعات</div>
                        <div className="text-xs text-gray-400">
                          تسجيل ومتابعة المدفوعات
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">التقارير</div>
                        <div className="text-xs text-gray-400">
                          عرض الإحصائيات والتقارير
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* أزرار الإجراءات السريعة */}
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    أزرار الإجراءات السريعة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Plus className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">إضافة حصة</div>
                        <div className="text-xs text-gray-400">
                          تسجيل حصة مؤقتة سريعة
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <UserPlus className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">إضافة عضو</div>
                        <div className="text-xs text-gray-400">
                          تسجيل عضو جديد
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Search className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">البحث</div>
                        <div className="text-xs text-gray-400">
                          البحث عن الأعضاء
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-pink-500/20 rounded-lg">
                        <Calendar className="w-5 h-5 text-pink-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">حضور اليوم</div>
                        <div className="text-xs text-gray-400">
                          عرض حضور اليوم
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* أزرار الإعدادات والإدارة */}
                <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                  <h4 className="font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    أزرار الإعدادات والإدارة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Settings className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">الإعدادات</div>
                        <div className="text-xs text-gray-400">
                          إعدادات النظام والأسعار
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          دليل الاستخدام
                        </div>
                        <div className="text-xs text-gray-400">
                          فتح هذا الدليل
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Download className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          تصدير البيانات
                        </div>
                        <div className="text-xs text-gray-400">
                          حفظ نسخة احتياطية
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Upload className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          استيراد البيانات
                        </div>
                        <div className="text-xs text-gray-400">
                          استعادة نسخة احتياطية
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* أزرار الإجراءات على الأعضاء */}
                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                  <h4 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    أزرار إجراءات الأعضاء
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">تسجيل حضور</div>
                        <div className="text-xs text-gray-400">
                          تسجيل حضور العضو
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Edit className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">تعديل</div>
                        <div className="text-xs text-gray-400">
                          تعديل بيانات العضو
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Eye className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          عرض التفاصيل
                        </div>
                        <div className="text-xs text-gray-400">
                          عرض معلومات العضو
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <RefreshCw className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          تجديد الاشتراك
                        </div>
                        <div className="text-xs text-gray-400">
                          إعادة تعيين الحصص
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* أزرار أخرى مهمة */}
                <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                  <h4 className="font-semibold text-red-300 mb-3 flex items-center gap-2">
                    <LogOut className="w-5 h-5" />
                    أزرار أخرى مهمة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <LogOut className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          تسجيل الخروج
                        </div>
                        <div className="text-xs text-gray-400">
                          الخروج من النظام
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          حذف البيانات
                        </div>
                        <div className="text-xs text-gray-400">
                          مسح جميع البيانات
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-gray-500/20 rounded-lg">
                        <Filter className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">فلترة</div>
                        <div className="text-xs text-gray-400">
                          تصفية النتائج
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Save className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">حفظ</div>
                        <div className="text-xs text-gray-400">
                          حفظ التغييرات
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* نصيحة مهمة */}
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">💡</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-1">
                        نصيحة للاستخدام
                      </h4>
                      <p className="text-sm text-blue-200">
                        مرر الماوس فوق أي زر لرؤية وصف سريع لوظيفته. معظم
                        الأزرار تحتوي على تلميحات مفيدة تظهر عند التمرير عليها.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      title: "إضافة عضو جديد",
      icon: <UserPlus className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      steps: [
        {
          title: "الوصول إلى قسم الأعضاء",
          content: (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">
                كيفية الوصول إلى قسم الأعضاء
              </h3>

              <div className="space-y-4">
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h4 className="font-semibold text-white mb-2">
                    الطريقة الأولى
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>انقر على تبويب "الأعضاء" في الشريط العلوي</span>
                  </div>
                </div>

                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="font-semibold text-white mb-2">
                    الطريقة الثانية
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Plus className="w-4 h-4 text-green-400" />
                    <span>استخدم زر "إضافة عضو" من الشريط الجانبي</span>
                  </div>
                </div>

                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                  <h4 className="font-semibold text-white mb-2">
                    الطريقة الثالثة
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Search className="w-4 h-4 text-purple-400" />
                    <span>استخدم البحث السريع للعثور على الأعضاء</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-black">!</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-300 mb-1">
                      نصيحة
                    </h4>
                    <p className="text-sm text-yellow-200">
                      يمكنك الوصول إلى جميع الوظائف من أي مكان في النظام
                      باستخدام الأزرار السريعة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "ملء بيانات العضو",
          content: (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">
                البيانات المطلوبة للعضو الجديد
              </h3>

              <div className="space-y-4">
                <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                  <h4 className="font-semibold text-red-300 mb-2">
                    البيانات الأساسية (مطلوبة)
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-red-400" />
                      اسم العضو الكامل
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-red-400" />
                      نوع الاشتراك (13 حصة، 15 حصة، 30 حصة)
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h4 className="font-semibold text-blue-300 mb-2">
                    البيانات الإضافية (اختيارية)
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-blue-400 rounded" />
                      رقم الهاتف
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-blue-400 rounded" />
                      البريد الإلكتروني
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-blue-400 rounded" />
                      صورة شخصية
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-blue-400 rounded" />
                      ملاحظات إضافية
                    </li>
                  </ul>
                </div>

                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="font-semibold text-green-300 mb-2">
                    أنواع الاشتراكات المتاحة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-700/50 rounded p-3 text-center">
                      <div className="text-lg font-bold text-white">13 حصة</div>
                      <div className="text-sm text-green-400">1,500 دج</div>
                    </div>
                    <div className="bg-slate-700/50 rounded p-3 text-center">
                      <div className="text-lg font-bold text-white">15 حصة</div>
                      <div className="text-sm text-green-400">1,800 دج</div>
                    </div>
                    <div className="bg-slate-700/50 rounded p-3 text-center">
                      <div className="text-lg font-bold text-white">30 حصة</div>
                      <div className="text-sm text-green-400">1,800 دج</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "حفظ بيانات العضو",
          content: (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">
                إتمام إضافة العضو الجديد
              </h3>

              <div className="space-y-4">
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="font-semibold text-green-300 mb-2">
                    خطوات الحفظ
                  </h4>
                  <ol className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                        1
                      </div>
                      تأكد من ملء جميع البيانات المطلوبة
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                        2
                      </div>
                      اختر نوع الاشتراك المناسب
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                        3
                      </div>
                      انقر على زر "حفظ" أو "إضافة عضو"
                    </li>
                  </ol>
                </div>

                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h4 className="font-semibold text-blue-300 mb-2">
                    ما يحدث بعد الحفظ
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      يتم إنشاء ملف شخصي للعضو
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      يتم تعيين عدد الحصص حسب نوع الاشتراك
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      يظهر العضو في قائمة الأعضاء
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      يصبح جاهزاً لتسجيل الحضور
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-black">!</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-300 mb-1">
                        تذكر
                      </h4>
                      <p className="text-sm text-yellow-200">
                        يمكنك تعديل بيانات العضو في أي وقت من خلال النقر على
                        اسمه في قائمة الأعضاء
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      title: "تسجيل الحضور",
      icon: <Calendar className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
      steps: [
        {
          title: "البحث عن العضو",
          content: (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">
                كيفية العثور على العضو لتسجيل حضوره
              </h3>

              <div className="space-y-4">
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h4 className="font-semibold text-blue-300 mb-2">
                    البحث بالاسم
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Search className="w-4 h-4 text-blue-400" />
                      <span>استخدم مربع البحث في أعلى الصفحة</span>
                    </div>
                    <div className="bg-slate-700/50 rounded p-2 text-xs text-gray-400">
                      مثال: اكتب "أحمد" للبحث عن جميع الأعضاء الذين يحتوي اسمهم
                      على "أحمد"
                    </div>
                  </div>
                </div>

                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="font-semibold text-green-300 mb-2">
                    التصفح في القائمة
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-green-400" />
                      تصفح قائمة الأعضاء مرتبة أبجدياً
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-400" />
                      استخدم الفلاتر لعرض أعضاء معينين فقط
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                  <h4 className="font-semibold text-purple-300 mb-2">
                    معلومات العضو المعروضة
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      اسم العضو وصورته الشخصية
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      عدد الحصص المتبقية
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      حالة الاشتراك والدفع
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      تاريخ آخر حضور
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "تسجيل الحضور",
          content: (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">
                خطوات تسجيل حضور العضو
              </h3>

              <div className="space-y-4">
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="font-semibold text-green-300 mb-2">
                    الطريقة الأساسية
                  </h4>
                  <ol className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                        1
                      </div>
                      ابحث عن العضو في قائمة الأعضاء
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                        2
                      </div>
                      انقر على زر "تسجيل حضور" بجانب اسم العضو
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                        3
                      </div>
                      تأكيد تسجيل الحضور
                    </li>
                  </ol>
                </div>

                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h4 className="font-semibold text-blue-300 mb-2">
                    ما يحدث عند تسجيل الحضور
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      يتم تسجيل تاريخ ووقت الحضور
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      يتم خصم حصة واحدة من الرصيد
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      يظهر العضو في قائمة حضور اليوم
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      يتم تحديث الإحصائيات
                    </li>
                  </ul>
                </div>

                <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                  <h4 className="font-semibold text-orange-300 mb-2">
                    حالات خاصة
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      إذا لم تتبق حصص للعضو، ستظهر رسالة تنبيه
                    </li>
                    <li className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-orange-400" />
                      إذا كان الاشتراك منتهياً، ستحتاج لتجديده أولاً
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "مراجعة الحضور",
          content: (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">
                مراجعة وإدارة حضور الأعضاء
              </h3>

              <div className="space-y-4">
                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                  <h4 className="font-semibold text-purple-300 mb-2">
                    عرض حضور اليوم
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      انقر على تبويب "حضور اليوم" لعرض جميع الحاضرين
                    </li>
                    <li className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-400" />
                      مراجعة تفاصيل كل عضو حاضر
                    </li>
                    <li className="flex items-center gap-2">
                      <Edit className="w-4 h-4 text-purple-400" />
                      إمكانية تعديل أو إلغاء الحضور إذا لزم الأمر
                    </li>
                  </ul>
                </div>

                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="font-semibold text-green-300 mb-2">
                    الإحصائيات المتاحة
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-700/50 rounded p-3 text-center">
                      <div className="text-lg font-bold text-white">
                        العدد الكلي
                      </div>
                      <div className="text-sm text-green-400">
                        للحاضرين اليوم
                      </div>
                    </div>
                    <div className="bg-slate-700/50 rounded p-3 text-center">
                      <div className="text-lg font-bold text-white">
                        الأعضاء المشتركين
                      </div>
                      <div className="text-sm text-green-400">
                        مقابل الحصص المؤقتة
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-black">!</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-300 mb-1">
                        نصيحة مهمة
                      </h4>
                      <p className="text-sm text-yellow-200">
                        تأكد من مراجعة حضور اليوم بانتظام للتأكد من دقة البيانات
                        وحل أي مشاكل قد تظهر
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      title: "إدارة المدفوعات",
      icon: <CreditCard className="w-6 h-6" />,
      color: "from-orange-500 to-red-500",
      steps: [
        {
          title: "أنواع المدفوعات",
          content: (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">
                أنواع المدفوعات المتاحة في النظام
              </h3>

              <div className="space-y-4">
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="font-semibold text-green-300 mb-2">
                    الاشتراكات الشهرية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-700/50 rounded p-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">
                          13 حصة
                        </div>
                        <div className="text-sm text-green-400">1,500 دج</div>
                        <div className="text-xs text-gray-400 mt-1">
                          مناسب للمبتدئين
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-700/50 rounded p-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">
                          15 حصة
                        </div>
                        <div className="text-sm text-green-400">1,800 دج</div>
                        <div className="text-xs text-gray-400 mt-1">
                          الأكثر شيوعاً
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-700/50 rounded p-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">
                          30 حصة
                        </div>
                        <div className="text-sm text-green-400">1,800 دج</div>
                        <div className="text-xs text-gray-400 mt-1">
                          للمتقدمين
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h4 className="font-semibold text-blue-300 mb-2">
                    الحصص المؤقتة
                  </h4>
                  <div className="bg-slate-700/50 rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-white">
                          حصة واحدة
                        </div>
                        <div className="text-sm text-gray-400">
                          للزوار أو التجربة
                        </div>
                      </div>
                      <div className="text-xl font-bold text-blue-400">
                        200 دج
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                  <h4 className="font-semibold text-purple-300 mb-2">
                    حالات الدفع
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-green-600/20 rounded p-3 text-center">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-green-300">
                        مدفوع
                      </div>
                    </div>
                    <div className="bg-yellow-600/20 rounded p-3 text-center">
                      <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-yellow-300">
                        جزئي
                      </div>
                    </div>
                    <div className="bg-red-600/20 rounded p-3 text-center">
                      <X className="w-6 h-6 text-red-400 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-red-300">
                        غير مدفوع
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "تسجيل دفعة جديدة",
          content: (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">
                كيفية تسجيل دفعة جديدة
              </h3>

              <div className="space-y-4">
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h4 className="font-semibold text-blue-300 mb-2">
                    للأعضاء المسجلين
                  </h4>
                  <ol className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                        1
                      </div>
                      اذهب إلى قسم "المدفوعات"
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                        2
                      </div>
                      انقر على "إضافة دفعة جديدة"
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                        3
                      </div>
                      اختر العضو من القائمة
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                        4
                      </div>
                      حدد نوع الاشتراك والمبلغ
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                        5
                      </div>
                      احفظ الدفعة
                    </li>
                  </ol>
                </div>

                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="font-semibold text-green-300 mb-2">
                    للحصص المؤقتة
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Plus className="w-4 h-4 text-green-400" />
                      <span>استخدم زر "إضافة حصة" السريع</span>
                    </div>
                    <div className="bg-slate-700/50 rounded p-2 text-xs text-gray-400">
                      هذا الخيار مناسب للزوار الذين يريدون تجربة الصالة لمرة
                      واحدة
                    </div>
                  </div>
                </div>

                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                  <h4 className="font-semibold text-purple-300 mb-2">
                    البيانات المطلوبة
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      اسم العضو أو الزائر
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      نوع الاشتراك أو الحصة
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      المبلغ المدفوع
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-purple-400 rounded" />
                      ملاحظات إضافية (اختياري)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "متابعة المدفوعات",
          content: (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">
                مراقبة ومتابعة المدفوعات
              </h3>

              <div className="space-y-4">
                <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                  <h4 className="font-semibold text-orange-300 mb-2">
                    المدفوعات المعلقة
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-orange-400" />
                      عرض الأعضاء الذين لم يدفعوا بعد
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      تتبع المدفوعات الجزئية
                    </li>
                    <li className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      مراقبة تواريخ انتهاء الاشتراكات
                    </li>
                  </ul>
                </div>

                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="font-semibold text-green-300 mb-2">
                    التقارير المالية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-700/50 rounded p-3">
                      <div className="text-center">
                        <BarChart3 className="w-6 h-6 text-green-400 mx-auto mb-1" />
                        <div className="text-sm font-semibold text-white">
                          الإيرادات اليومية
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-700/50 rounded p-3">
                      <div className="text-center">
                        <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-1" />
                        <div className="text-sm font-semibold text-white">
                          الإيرادات الشهرية
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h4 className="font-semibold text-blue-300 mb-2">
                    إدارة المدفوعات
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <Edit className="w-4 h-4 text-blue-400" />
                      تعديل مبلغ أو تاريخ الدفعة
                    </li>
                    <li className="flex items-center gap-2">
                      <Save className="w-4 h-4 text-blue-400" />
                      حفظ ملاحظات خاصة بكل دفعة
                    </li>
                    <li className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-400" />
                      عرض تاريخ جميع مدفوعات العضو
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-black">!</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-300 mb-1">
                        نصيحة مالية
                      </h4>
                      <p className="text-sm text-yellow-200">
                        راجع المدفوعات المعلقة يومياً وتابع مع الأعضاء المتأخرين
                        في الدفع لضمان استمرارية الإيرادات
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
  ];

  const nextStep = () => {
    if (currentStep < sections[currentSection].steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentStep(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentStep(sections[currentSection - 1].steps.length - 1);
    }
  };

  const goToSection = (sectionIndex: number) => {
    setCurrentSection(sectionIndex);
    setCurrentStep(0);
  };

  const currentSectionData = sections[currentSection];
  const currentStepData = currentSectionData.steps[currentStep];
  const totalSteps = sections.reduce(
    (acc, section) => acc + section.steps.length,
    0,
  );
  const currentStepNumber =
    sections
      .slice(0, currentSection)
      .reduce((acc, section) => acc + section.steps.length, 0) +
    currentStep +
    1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700 overflow-hidden">
        <DialogHeader className="border-b border-slate-700 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              دليل الاستخدام - Amino Gym
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>
                الخطوة {currentStepNumber} من {totalSteps}
              </span>
              <span>{Math.round((currentStepNumber / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStepNumber / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex h-full overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-80 border-r border-slate-700 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">المحتويات</h3>
            <div className="space-y-2">
              {sections.map((section, sectionIndex) => (
                <motion.button
                  key={sectionIndex}
                  onClick={() => goToSection(sectionIndex)}
                  className={`w-full text-right p-3 rounded-lg transition-all duration-200 ${
                    currentSection === sectionIndex
                      ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                      : "bg-slate-800/50 text-gray-300 hover:bg-slate-700/50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        currentSection === sectionIndex
                          ? "bg-white/20"
                          : "bg-slate-700/50"
                      }`}
                    >
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{section.title}</div>
                      <div className="text-xs opacity-75">
                        {section.steps.length} خطوة
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Section Header */}
            <div
              className={`p-6 bg-gradient-to-r ${currentSectionData.color} bg-opacity-10 border-b border-slate-700`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${currentSectionData.color} bg-opacity-20`}
                >
                  {currentSectionData.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {currentSectionData.title}
                  </h2>
                  <p className="text-gray-300">{currentStepData.title}</p>
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentSection}-${currentStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {currentStepData.content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <div className="border-t border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentSection === 0 && currentStep === 0}
                  className="border-slate-600 text-gray-300 hover:bg-slate-700 disabled:opacity-50"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  السابق
                </Button>

                <div className="flex items-center gap-2">
                  {currentSectionData.steps.map((_, stepIndex) => (
                    <button
                      key={stepIndex}
                      onClick={() => setCurrentStep(stepIndex)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        currentStep === stepIndex
                          ? `bg-gradient-to-r ${currentSectionData.color}`
                          : "bg-slate-600 hover:bg-slate-500"
                      }`}
                    />
                  ))}
                </div>

                {currentSection === sections.length - 1 &&
                currentStep === sections[currentSection].steps.length - 1 ? (
                  <Button
                    onClick={onClose}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    إنهاء الدليل
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    className={`bg-gradient-to-r ${currentSectionData.color} text-white`}
                  >
                    التالي
                    <ArrowLeft className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserGuide;
