import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatNumber, formatDate } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  getAllPayments,
  Payment,
  deletePayment,
} from "@/services/paymentService";
import { getMemberById, getAllMembers } from "@/services/memberService";
import {
  Calendar,
  CreditCard,
  Search,
  Trash2,
  RefreshCw,
  Edit,
  MoreVertical,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface PaymentsListProps {
  onRefresh?: number;
  onEditPayment?: (payment: Payment) => void;
  ref?: React.Ref<{ fetchPayments: () => Promise<void> }>;
}

const PaymentsList = forwardRef(
  ({ onRefresh, onEditPayment }: PaymentsListProps = {}, ref) => {
    const [payments, setPayments] = useState<
      (Payment & { memberName?: string })[]
    >([]);
    const [filteredPayments, setFilteredPayments] = useState<
      (Payment & { memberName?: string })[]
    >([]);
    const [partialPayments, setPartialPayments] = useState<
      Array<{
        memberName: string;
        amount: number;
        subscriptionType?: string;
        memberId: string;
      }>
    >([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filterType, setFilterType] = useState<string>("all");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(
      null,
    );

    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const allPayments = await getAllPayments();
        const allMembers = await getAllMembers();

        // Enhance payments with member names
        const enhancedPayments = await Promise.all(
          allPayments.map(async (payment) => {
            try {
              const member = await getMemberById(payment.memberId);
              return {
                ...payment,
                memberName: member?.name || "غير معروف",
              };
            } catch (error) {
              return {
                ...payment,
                memberName: "غير معروف",
              };
            }
          }),
        );

        // Get partial payments from members
        const partialPaymentsList = allMembers
          .filter(
            (member) =>
              member.paymentStatus === "partial" &&
              member.partialPaymentAmount &&
              member.partialPaymentAmount > 0,
          )
          .map((member) => ({
            memberName: member.name,
            amount: member.partialPaymentAmount || 0,
            subscriptionType: member.subscriptionType,
            memberId: member.id,
          }));

        // Sort by date (newest first)
        const sortedPayments = enhancedPayments.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        setPayments(sortedPayments);
        setFilteredPayments(sortedPayments);
        setPartialPayments(partialPaymentsList);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchPayments();
    }, [onRefresh]);

    // Expose the fetchPayments method to parent components via ref
    React.useImperativeHandle(ref, () => ({
      fetchPayments,
    }));

    useEffect(() => {
      // Apply filters
      let result = [...payments];

      // Apply search filter
      if (searchQuery) {
        result = result.filter(
          (payment) =>
            payment.memberName
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            payment.notes?.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      // Apply subscription type filter
      if (filterType && filterType !== "all") {
        result = result.filter(
          (payment) => payment.subscriptionType === filterType,
        );
      }

      setFilteredPayments(result);
    }, [searchQuery, filterType, payments]);

    const formatPaymentDate = (dateString: string) => {
      return formatDate(dateString);
    };

    const getPaymentMethodIcon = (method: string) => {
      switch (method) {
        case "cash":
          return <CreditCard className="h-4 w-4 text-green-400" />;
        case "card":
          return <CreditCard className="h-4 w-4 text-blue-400" />;
        case "transfer":
          return <Calendar className="h-4 w-4 text-purple-400" />;
        default:
          return <CreditCard className="h-4 w-4 text-gray-400" />;
      }
    };

    const getPaymentMethodText = (method: string) => {
      switch (method) {
        case "cash":
          return "نقدا";
        case "card":
          return "بطاقة";
        case "transfer":
          return "تحويل";
        default:
          return method;
      }
    };

    const handleDeletePayment = async () => {
      if (!paymentToDelete) return;

      try {
        await deletePayment(paymentToDelete.id);
        toast({
          title: "تم بنجاح",
          description: "تم حذف المدفوعات بنجاح",
          variant: "default",
        });
        await fetchPayments();
      } catch (error) {
        console.error("Error deleting payment:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حذف المدفوعات",
          variant: "destructive",
        });
      } finally {
        setDeleteDialogOpen(false);
        setPaymentToDelete(null);
      }
    };

    const handleDeletePartialPayment = async (memberId: string) => {
      try {
        const { updateMember, getMemberById } = await import(
          "@/services/memberService"
        );
        const member = await getMemberById(memberId);
        if (member) {
          const updatedMember = {
            ...member,
            paymentStatus: "unpaid" as const,
            partialPaymentAmount: 0,
          };
          await updateMember(updatedMember);
          toast({
            title: "تم بنجاح",
            description: "تم حذف الدفع الجزئي بنجاح",
            variant: "default",
          });
          // Refresh the payments list to remove the partial payment card
          await fetchPayments();
          // Trigger refresh for parent components (like revenue cards)
          if (onRefresh) {
            // Force a refresh by incrementing the refresh counter
            window.dispatchEvent(new CustomEvent("paymentsUpdated"));
          }
        }
      } catch (error) {
        console.error("Error deleting partial payment:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حذف الدفع الجزئي",
          variant: "destructive",
        });
      }
    };

    const openDeleteDialog = (payment: Payment) => {
      setPaymentToDelete(payment);
      setDeleteDialogOpen(true);
    };

    const handleEditPayment = (payment: Payment) => {
      if (onEditPayment) {
        onEditPayment(payment);
      }
    };

    return (
      <Card className="bg-bluegray-700/30 backdrop-blur-md border-bluegray-600 shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            سجل المدفوعات
          </h2>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-bluegray-600/50 border-bluegray-500 text-white w-full"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-bluegray-600/50 border-bluegray-500 text-white w-full md:w-48">
                <SelectValue placeholder="فلترة حسب النوع" />
              </SelectTrigger>
              <SelectContent className="bg-bluegray-700 border-bluegray-600 text-white">
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="شهري">شهري</SelectItem>
                <SelectItem value="13 حصة">13 حصة</SelectItem>
                <SelectItem value="15 حصة">15 حصة</SelectItem>
                <SelectItem value="30 حصة">30 حصة</SelectItem>
                <SelectItem value="حصة واحدة">حصة واحدة</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={fetchPayments}
              variant="outline"
              className="bg-bluegray-600/50 border-bluegray-500 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  تحديث
                </>
              )}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            لا توجد مدفوعات للعرض
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Partial Payments Section */}
            {partialPayments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  المدفوعات الجزئية
                </h3>
                {partialPayments.map((partialPayment, index) => (
                  <div
                    key={`partial-${partialPayment.memberId}-${index}`}
                    className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {partialPayment.memberName}
                        </span>
                        <span className="text-sm text-gray-400">
                          ({partialPayment.subscriptionType || "غير محدد"})
                        </span>
                        <span className="text-xs bg-yellow-600/30 text-yellow-300 px-2 py-1 rounded">
                          دفع جزئي
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                        <CreditCard className="h-4 w-4 text-yellow-400" />
                        <span>دفع جزئي</span>
                        <span className="mx-2">•</span>
                        <span>مبلغ مدفوع جزئياً</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">
                        {formatNumber(partialPayment.amount)} DZD
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-bluegray-700 border-bluegray-600 text-white">
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeletePartialPayment(
                                partialPayment.memberId,
                              )
                            }
                            className="hover:bg-red-600 cursor-pointer text-red-400"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            حذف الدفع الجزئي
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Regular Payments Section */}
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                المدفوعات المكتملة
              </h3>
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-bluegray-600/50 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {payment.memberName}
                      </span>
                      <span className="text-sm text-gray-400">
                        ({payment.subscriptionType})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                      <span>{getPaymentMethodText(payment.paymentMethod)}</span>
                      <span className="mx-2">•</span>
                      <span>{formatPaymentDate(payment.date)}</span>
                    </div>
                    {payment.notes && (
                      <p className="text-sm text-gray-400 mt-1">
                        {payment.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                      {formatNumber(payment.amount)} DZD
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-bluegray-700 border-bluegray-600 text-white">
                        <DropdownMenuItem
                          onClick={() => handleEditPayment(payment)}
                          className="hover:bg-bluegray-600 cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(payment)}
                          className="hover:bg-red-600 cursor-pointer text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-bluegray-700 border-bluegray-600 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف هذه المدفوعات؟ لا يمكن التراجع عن هذا
                الإجراء.
                {paymentToDelete && (
                  <div className="mt-2 p-2 bg-bluegray-600 rounded">
                    <div>
                      العضو: {paymentToDelete.memberName || "غير معروف"}
                    </div>
                    <div>
                      المبلغ: {formatNumber(paymentToDelete.amount)} DZD
                    </div>
                    <div>النوع: {paymentToDelete.subscriptionType}</div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-bluegray-600 border-bluegray-500 text-white hover:bg-bluegray-500">
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePayment}
                className="bg-red-600 hover:bg-red-700"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    );
  },
);

export default PaymentsList;
