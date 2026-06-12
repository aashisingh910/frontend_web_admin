import { useEffect, useState } from "react";
import { managerCourseApi } from "@/services/courseApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function ManagerCoursesPage() {
  const [data, setData]       = useState<any>(null);
  const [status, setStatus]   = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const result = await managerCourseApi.list(status);
      setData(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load manager courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const records = data?.records || [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand" />
            Store Course Progress
          </h1>
          <p className="text-sm text-muted-foreground">
            {data?.storeName} · Store #{data?.storeCode}
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
        </select>
      </header>

      <div className="grid gap-4 md:grid-cols-5">
        <Stat label="Total"       value={summary.totalAssigned || 0} />
        <Stat label="Completed"   value={summary.completed     || 0} />
        <Stat label="In Progress" value={summary.inProgress    || 0} />
        <Stat label="Failed"      value={summary.failed        || 0} />
        <Stat label="Badges"      value={summary.badgesAwarded || 0} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Staff Course Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {records.map((item: any) => (
            <div
              key={item.progressId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm"
            >
              <div>
                <div className="font-medium">{item.employeeName}</div>
                <div className="text-xs text-muted-foreground">
                  {item.employeeCode} · {item.department || "—"} · {item.courseTitle}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{item.status}</Badge>
                <Badge variant="secondary">{item.score?.scorePercent || 0}%</Badge>
                {item.badgeAwarded && (
                  <Badge className="gap-1">
                    <Trophy className="h-3 w-3" /> Badge
                  </Badge>
                )}
              </div>
            </div>
          ))}

          {!records.length && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No course records found for your store.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className="text-2xl font-display font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
