import { useEffect, useState } from "react";
import { staffWorkspaceApi } from "@/services/staffWorkspaceApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";

const money = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);

export default function StaffIncentivesPage() {
  const [month, setMonth] = useState("2026-07");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    staffWorkspaceApi.incentives(month)
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load incentives"))
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Gift className="h-5 w-5 text-brand" /> My Incentives
          </h1>
          <p className="text-sm text-muted-foreground">Incentive status from manager and admin approvals.</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Total Payable" value={money(data?.summary?.totalPayable || 0)} />
        <Stat label="Paid"          value={money(data?.summary?.totalPaid || 0)} />
        <Stat label="Pending"       value={money(data?.summary?.pendingPayout || 0)} />
        <Stat label="Records"       value={data?.summary?.totalRecords || 0} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Incentive Records</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data?.records?.map((item: any) => (
            <div
              key={item.incentiveId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm"
            >
              <div>
                <div className="font-medium">{item.incentiveMonth}</div>
                <div className="text-xs text-muted-foreground">
                  Attendance: {item.performanceInputs?.attendancePercent || 0}% ·
                  Achievement: {item.targetReference?.achievementPercent || 0}%
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {money(item.calculation?.payableIncentive || 0)}
                </div>
                <Badge variant="outline">{item.approval?.status}</Badge>
              </div>
            </div>
          ))}
          {!data?.records?.length && (
            <div className="p-6 text-center text-sm text-muted-foreground">No incentives found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className="text-lg font-display font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
