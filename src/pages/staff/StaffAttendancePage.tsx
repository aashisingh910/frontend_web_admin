import { useEffect, useState } from "react";
import { staffWorkspaceApi } from "@/services/staffWorkspaceApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function StaffAttendancePage() {
  const [month, setMonth] = useState("2026-07");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    staffWorkspaceApi.attendance(month)
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load attendance"))
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-brand" /> My Attendance
          </h1>
          <p className="text-sm text-muted-foreground">Your attendance records for the selected month.</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Attendance" value={`${data?.summary?.attendancePercent || 0}%`} />
        <Stat label="Present"    value={data?.summary?.present || 0} />
        <Stat label="Late"       value={data?.summary?.late || 0} />
        <Stat label="Weekly Off" value={data?.summary?.weeklyOff || 0} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Attendance Records</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data?.records?.map((item: any) => (
            <div
              key={item._id || item.attendanceId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm"
            >
              <div>
                <div className="font-medium">
                  {item.attendanceDate
                    ? new Date(item.attendanceDate).toLocaleDateString("en-IN")
                    : "-"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Check-in: {item.checkInTime || "-"} · Check-out: {item.checkOutTime || "-"}
                </div>
                {item.remarks && (
                  <div className="text-xs text-muted-foreground">Remarks: {item.remarks}</div>
                )}
              </div>
              <Badge variant="outline">{item.status}</Badge>
            </div>
          ))}
          {!data?.records?.length && (
            <div className="p-6 text-center text-sm text-muted-foreground">No attendance records found.</div>
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
        <div className="text-2xl font-display font-bold">{value}</div>
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
