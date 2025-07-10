import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CheckCircle, Clock } from "lucide-react";
import { getAllMembers, Member } from "@/services/memberService";
import { getAllPayments } from "@/services/paymentService";
import { formatDate, formatNumber } from "@/lib/utils";

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
          <p className="text-gray-300 text-sm mb-2">
            {formatDate(new Date().toISOString())}
          </p>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-green-400 font-semibold">
              {formatNumber(todayAttendees.length)} حاضر
            </span>
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
            <h3 className="text-lg font-semibold text-white mb-4 px-2">
              قائمة الحضور ({formatNumber(todayAttendees.length)} عضو)
            </h3>
            {todayAttendees.map((attendee, index) => (
              <div
                key={attendee.id || index}
                className={`bg-gradient-to-br backdrop-blur-xl shadow-xl rounded-2xl p-4 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
                  !attendee.isSessionPayment &&
                  (attendee.paymentStatus === "unpaid" ||
                    attendee.paymentStatus === "partial" ||
                    attendee.membershipStatus === "pending" ||
                    (attendee.sessionsRemaining !== undefined &&
                      attendee.sessionsRemaining === 0) ||
                    (attendee.membershipStartDate &&
                      new Date() >
                        new Date(
                          new Date(attendee.membershipStartDate).setMonth(
                            new Date(attendee.membershipStartDate).getMonth() +
                              1,
                          ),
                        )))
                    ? "from-red-900/80 to-red-800/80 border border-red-500/50"
                    : "from-bluegray-800/80 to-bluegray-900/80 border border-bluegray-600/50"
                }`}
              >
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Avatar className="h-14 w-14 border-2 border-bluegray-600 shadow-lg">
                    <AvatarImage src={attendee.imageUrl} alt={attendee.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                      {attendee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className={`text-lg font-semibold truncate ${
                          !attendee.isSessionPayment &&
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
                            ? "!text-red-300 text-red-300"
                            : "text-white"
                        }`}
                        style={
                          !attendee.isSessionPayment &&
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
                            ? { color: "#fca5a5 !important" }
                            : {}
                        }
                      >
                        {attendee.name}
                      </h3>
                      <Badge
                        variant={
                          attendee.isSessionPayment ? "secondary" : "default"
                        }
                        className={`text-sm px-3 py-1 ${
                          attendee.isSessionPayment
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                            : "bg-green-500/20 text-green-300 border-green-500/30"
                        }`}
                      >
                        {attendee.isSessionPayment ? "حصة مؤقتة" : "عضو مشترك"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-gray-300">
                          وقت الحضور:{" "}
                          {new Date(attendee.lastAttendance).toLocaleTimeString(
                            "ar-DZ",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>

                      {!attendee.isSessionPayment &&
                        attendee.sessionsRemaining !== undefined && (
                          <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-green-300">
                              الحصص المتبقية:{" "}
                              {formatNumber(attendee.sessionsRemaining)} حصة
                            </span>
                          </div>
                        )}

                      {attendee.phoneNumber && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">
                            📱 {attendee.phoneNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
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
