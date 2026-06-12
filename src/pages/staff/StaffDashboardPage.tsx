import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { staffWorkspaceApi } from "@/services/staffWorkspaceApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck, Target, BookOpen, Gift, Trophy, Store, UserCog, Loader2,
} from "lucide-react";
import { toast } from "sonner";

const money = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);

export default function StaffDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    staffWorkspaceApi.dashboard()
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return <Empty text="No dashboard data found." />;

  const { profile, kpis } = data;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">
              Welcome, {profile.staff.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {profile.staff.designation || "Staff"} · {profile.staff.department || "-"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline">
                <Store className="mr-1 h-3 w-3" />
                {profile.store.storeName}
              </Badge>
              <Badge variant="outline">#{profile.store.storeCode}</Badge>
              <Badge variant="outline">{profile.store.city}</Badge>
              <Badge variant="outline">
                <UserCog className="mr-1 h-3 w-3" />
                {profile.manager.name || "Manager"}
              </Badge>
            </div>
          </div>
          <Link
            to="/staff/profile"
            className="rounded-xl border bg-muted/40 p-3 text-sm hover:bg-accent"
          >
            <div className="text-muted-foreground">Employee Code</div>
            <div className="font-semibold">{profile.staff.employeeCode}</div>
          </Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi icon={CalendarCheck} label="Attendance"       value={`${kpis.attendancePercent}%`} />
        <Kpi icon={Target}        label="Target Achieved"  value={`${kpis.targetAchievementPercent}%`} />
        <Kpi icon={BookOpen}      label="Courses Done"     value={kpis.coursesCompleted} />
        <Kpi icon={Gift}          label="Payable Incentive" value={money(kpis.payableIncentive)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Target Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Current Target"  value={money(kpis.currentTarget)} />
            <Row label="Actual Sales"    value={money(kpis.actualSales)} />
            <Row label="Remaining"       value={money(kpis.remainingTarget)} />
            <Row label="Achievement"     value={`${kpis.targetAchievementPercent}%`} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Workspace Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Present Days"    value={String(kpis.presentDays)} />
            <Row label="Late Days"       value={String(kpis.lateDays)} />
            <Row label="Pending Courses" value={String(kpis.coursesPending)} />
            <Row label="Active Notices"  value={String(kpis.activeNotices)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-brand" /> My Badges
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {profile.staff.badges?.map((badge: any) => (
            <div
              key={`${badge.badgeId}-${badge.courseId}`}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <span className="mr-1">{badge.badgeIcon}</span>
              {badge.badgeName}
            </div>
          ))}
          {!profile.staff.badges?.length && (
            <div className="text-sm text-muted-foreground">No badges earned yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="p-8 text-center text-sm text-muted-foreground">{text}</CardContent>
    </Card>
  );
}
