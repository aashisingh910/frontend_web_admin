import { useEffect, useState } from "react";
import { staffWorkspaceApi } from "@/services/staffWorkspaceApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Loader2 } from "lucide-react";
import { toast } from "sonner";

const money = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);

export default function StaffTargetsPage() {
  const [month, setMonth] = useState("2026-07");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    staffWorkspaceApi.targets(month)
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load targets"))
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) return <PageLoader />;

  const current = data?.current;
  const pct = current?.progress?.achievementPercent || 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-brand" /> My Targets
          </h1>
          <p className="text-sm text-muted-foreground">Targets assigned by your store manager.</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
      </header>

      {current ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{current.targetMonth} Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Stat label="Assigned Target" value={money(current.assignedTarget)} />
              <Stat label="Actual Sales"    value={money(current.progress?.actualSales || 0)} />
              <Stat label="Remaining"       value={money(current.progress?.remainingTarget || 0)} />
              <Stat label="Achievement"     value={`${pct}%`} />
            </div>
            <Progress value={pct} className="h-2 [&>div]:bg-brand" />
            <div className="grid gap-3 md:grid-cols-4">
              <Stat label="Furniture" value={money(current.categoryBreakup?.furnitureTarget || 0)} />
              <Stat label="Homeware"  value={money(current.categoryBreakup?.homewareTarget || 0)} />
              <Stat label="Decor"     value={money(current.categoryBreakup?.decorTarget || 0)} />
              <Stat label="Services"  value={money(current.categoryBreakup?.servicesTarget || 0)} />
            </div>
            {current.assignment?.remarks && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                {current.assignment.remarks}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No target assigned for this month.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Target History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data?.records?.map((target: any) => (
            <div
              key={target.targetId}
              className="flex justify-between rounded-lg border p-3 text-sm"
            >
              <div>
                <div className="font-medium">{target.targetMonth}</div>
                <div className="text-xs text-muted-foreground">{target.status}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{money(target.assignedTarget)}</div>
                <div className="text-xs text-muted-foreground">
                  {target.progress?.achievementPercent || 0}% achieved
                </div>
              </div>
            </div>
          ))}
          {!data?.records?.length && (
            <div className="p-6 text-center text-sm text-muted-foreground">No target history found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold">{value}</div>
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
