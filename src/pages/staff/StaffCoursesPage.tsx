import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { staffWorkspaceApi } from "@/services/staffWorkspaceApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function StaffCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    staffWorkspaceApi.courses(status)
      .then((result) => {
        setCourses(result.records || []);
        setSummary(result.summary || {});
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load courses"))
      .finally(() => setLoading(false));
  }, [status]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand" /> My Courses
          </h1>
          <p className="text-sm text-muted-foreground">Courses assigned to you.</p>
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

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Assigned"    value={summary?.assigned || 0} />
        <Stat label="In Progress" value={summary?.inProgress || 0} />
        <Stat label="Completed"   value={summary?.completed || 0} />
        <Stat label="Badges"      value={summary?.badgesAwarded || 0} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((item) => (
          <Card key={item.progressId}>
            <CardHeader>
              <CardTitle className="text-base">{item.courseTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{item.courseId}</Badge>
                <Badge variant={item.status === "COMPLETED" ? "default" : "secondary"}>
                  {item.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-md bg-secondary p-2">
                  <div className="font-bold">{item.score?.scorePercent || 0}%</div>
                  <div className="text-muted-foreground">Score</div>
                </div>
                <div className="rounded-md bg-secondary p-2">
                  <div className="font-bold">{item.score?.passingScorePercent || 70}%</div>
                  <div className="text-muted-foreground">Pass</div>
                </div>
                <div className="rounded-md bg-secondary p-2">
                  <div className="font-bold">{item.score?.passed ? "Yes" : "No"}</div>
                  <div className="text-muted-foreground">Passed</div>
                </div>
              </div>
              {item.badgeAwarded && (
                <div className="rounded-md border p-2 text-xs flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-brand" />
                  <span>{item.awardedBadge?.badgeIcon} {item.awardedBadge?.badgeName}</span>
                </div>
              )}
              <Button asChild className="w-full bg-brand text-brand-foreground">
                <Link to={`/staff/courses/${item.progressId}`}>
                  {item.status === "COMPLETED" || item.status === "FAILED" ? "View Result" : "Start / Continue"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!courses.length && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">No courses assigned yet.</CardContent>
        </Card>
      )}
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

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

