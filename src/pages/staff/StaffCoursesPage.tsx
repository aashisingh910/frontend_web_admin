import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { staffCourseApi } from "@/services/courseApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function StaffCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState("");

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await staffCourseApi.list(status);
      setCourses(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCourses(); }, [status]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const completed = courses.filter((c) => c.status === "COMPLETED").length;
  const pending   = courses.filter((c) => c.status === "ASSIGNED").length;
  const progress  = courses.filter((c) => c.status === "IN_PROGRESS").length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand" />
            My Courses
          </h1>
          <p className="text-sm text-muted-foreground">
            Courses assigned to you by HomeTown admin.
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

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Completed"  value={completed} />
        <Stat label="In Progress" value={progress} />
        <Stat label="Pending"    value={pending} />
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
                <Link to={`/my-courses/${item.progressId}`}>
                  {item.status === "COMPLETED" ? "View Result" : "Start / Continue"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!courses.length && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No courses assigned yet.
          </CardContent>
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
