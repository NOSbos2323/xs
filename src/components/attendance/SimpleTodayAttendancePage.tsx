import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CheckCircle, Clock } from "lucide-react";
import { getAllMembers, Member } from "@/services/memberService";
import { getAllPayments } from "@/services/paymentService";
import { formatDate, formatNumber, formatTimeAlgeria } from "@/lib/utils";

const SimpleTodayAttendancePage = () => {
  const [todayAttendees, setTodayAttendees] = useState<
    (Member & { isSessionPayment?: boolean })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayAttendees = async () => {
      setLoading(true);
      try {
        const [members, payments] = await Promise.all([
          getAllMembers(),
          getAllPayments(),
        ]);

        const today = new Date().toISOString().split("T")[0];

        // Get members who attended today
        const todayAttendanceMembers = members.filter(
          (member) =>
            member.lastAttendance &&
            member.lastAttendance.split("T")[0] === today,
        );

        // Get session payments from today
        const todaySessionPayments = payments.filter(
          (payment) =>
            payment.subscriptionType === "حصة واحدة" &&
            payment.date.split("T")[0] === today,
        );

        // Create session payment members for display
        const sessionPaymentMembers = todaySessionPayments.map(
          (payment, index) => ({
            id: payment.memberId,
            name:
              payment.notes?.split(" - ")[1]?.split(" (")[0] ||
              `زائر ${index + 1}`,
            membershipStatus: "active" as const,
            lastAttendance: payment.date,
            paymentStatus: "paid" as const,
            isSessionPayment: true,
            phoneNumber: payment.notes?.match(/\(([^)]+)\)/)?.[1] || "",
          }),
        );

        // Combine both types
        const allTodayAttendees = [
          ...todayAttendanceMembers,
          ...sessionPaymentMembers,
        ];

        setTodayAttendees(allTodayAttendees);
      } catch (error) {
        console.error("Error fetching today's attendees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAttendees();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white scrollbar-hide">
      <div className="container mx-auto px-3 sm:px-4 pt-20 pb-36 sm:pb-32 lg:pt-6 lg:pb-6 scrollbar-hide">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Calendar className="h-7 w-7 text-blue-400" />
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              حضور اليوم
            </h2>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <Card className="overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-600/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-slate-500/60">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {formatNumber(todayAttendees.length)}
                  </div>
                  <div className="text-sm text-gray-300 mt-1 font-medium">
                    إجمالي الحضور
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 via-blue-500/20 to-purple-500/20 p-3 sm:p-4 rounded-2xl border border-white/10 shadow-lg">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-600/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-slate-500/60">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {formatNumber(
                      todayAttendees.filter((a) => !a.isSessionPayment).length,
                    )}
                  </div>
                  <div className="text-sm text-gray-300 mt-1 font-medium">
                    أعضاء مشتركين
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 via-blue-500/20 to-purple-500/20 p-3 sm:p-4 rounded-2xl border border-white/10 shadow-lg">
                  <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-600/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-slate-500/60">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {formatNumber(
                      todayAttendees.filter((a) => a.isSessionPayment).length,
                    )}
                  </div>
                  <div className="text-sm text-gray-300 mt-1 font-medium">
                    حصص مؤقتة
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 via-blue-500/20 to-purple-500/20 p-3 sm:p-4 rounded-2xl border border-white/10 shadow-lg">
                  <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendees List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : todayAttendees.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-bluegray-800/80 to-bluegray-900/80 backdrop-blur-xl border border-bluegray-600/50 shadow-2xl rounded-2xl">
            <Calendar className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              لا يوجد حضور اليوم
            </h3>
            <p className="text-gray-400">لم يسجل أي عضو حضوره اليوم بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayAttendees.map((attendee, index) => (
              <div
                key={attendee.id || index}
                className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-800/60 via-slate-700/40 to-slate-800/60 hover:from-slate-700/70 hover:via-slate-600/50 hover:to-slate-700/70 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl backdrop-blur-sm"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}
              >
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-slate-700/80 to-slate-800/80 flex items-center justify-center ring-2 ring-slate-600/40 group-hover:ring-slate-500/60 transition-all duration-300 shadow-lg">
                  {attendee.imageUrl ? (
                    <img
                      src={attendee.imageUrl}
                      alt={attendee.name}
                      className="w-full h-full rounded-full object-cover border-2 border-slate-600/50"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-white text-lg font-semibold">
                      {attendee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full border-2 border-slate-800 shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-100 group-hover:text-white transition-colors duration-200 truncate text-base">
                      {attendee.name}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`text-xs px-2 py-1 ${
                        attendee.isSessionPayment
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          : !attendee.isSessionPayment &&
                              (attendee.paymentStatus === "unpaid" ||
                                attendee.paymentStatus === "partial" ||
                                attendee.membershipStatus === "pending" ||
                                (attendee.sessionsRemaining !== undefined &&
                                  attendee.sessionsRemaining === 0) ||
                                (attendee.membershipStartDate &&
                                  new Date() >
                                    new Date(
                                      new Date(
                                        attendee.membershipStartDate,
                                      ).setMonth(
                                        new Date(
                                          attendee.membershipStartDate,
                                        ).getMonth() + 1,
                                      ),
                                    )))
                            ? "bg-red-500/20 text-red-300 border-red-500/30"
                            : "bg-green-500/20 text-green-300 border-green-500/30"
                      }`}
                    >
                      {attendee.isSessionPayment
                        ? "حصة مؤقتة"
                        : !attendee.isSessionPayment &&
                            (attendee.paymentStatus === "unpaid" ||
                              attendee.paymentStatus === "partial" ||
                              attendee.membershipStatus === "pending" ||
                              (attendee.sessionsRemaining !== undefined &&
                                attendee.sessionsRemaining === 0) ||
                              (attendee.membershipStartDate &&
                                new Date() >
                                  new Date(
                                    new Date(
                                      attendee.membershipStartDate,
                                    ).setMonth(
                                      new Date(
                                        attendee.membershipStartDate,
                                      ).getMonth() + 1,
                                    ),
                                  )))
                          ? "غير مدفوع"
                          : "مدفوع"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-200">
                      {formatTimeAlgeria(attendee.lastAttendance).split(" ")[1]}
                    </p>
                  </div>
                  {!attendee.isSessionPayment &&
                    attendee.sessionsRemaining !== undefined && (
                      <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-200 mt-1 truncate">
                        الحصص المتبقية:{" "}
                        {formatNumber(attendee.sessionsRemaining)} حصة
                      </p>
                    )}
                  {attendee.phoneNumber && (
                    <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-200 mt-1 truncate">
                      📱 {attendee.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleTodayAttendancePage;
