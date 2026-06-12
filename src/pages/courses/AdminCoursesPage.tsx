import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminCourseApi } from "@/services/courseApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await adminCourseApi.list();
      setCourses(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand" />
            Course Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, update and assign courses to staff, stores and managers.
          </p>
        </div>
        <Button asChild className="bg-brand text-brand-foreground">
          <Link to="/courses/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.courseId}>
            <CardHeader>
              <CardTitle className="text-base">{course.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="line-clamp-3 text-muted-foreground">
                {course.description || "No description"}
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{course.courseId}</Badge>
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
                <Badge variant={course.status === "ACTIVE" ? "default" : "secondary"}>
                  {course.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-md bg-secondary p-2">
                  <div className="font-bold">{course.questions?.length || 0}</div>
                  <div className="text-muted-foreground">Questions</div>
                </div>
                <div className="rounded-md bg-secondary p-2">
                  <div className="font-bold">{course.passingScorePercent}%</div>
                  <div className="text-muted-foreground">Pass</div>
                </div>
                <div className="rounded-md bg-secondary p-2">
                  <div className="font-bold">{course.estimatedMinutes}</div>
                  <div className="text-muted-foreground">Mins</div>
                </div>
              </div>

              {course.completionBadge?.badgeName ? (
                <div className="rounded-md border p-2 text-xs">
                  <span className="mr-1">{course.completionBadge.badgeIcon}</span>
                  {course.completionBadge.badgeName}
                </div>
              ) : null}

              <div className="flex gap-2 pt-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link to={`/courses/create?edit=${course.courseId}`}>Edit</Link>
                </Button>
                <Button asChild size="sm" className="flex-1 bg-brand text-brand-foreground">
                  <Link to={`/courses/assign/${course.courseId}`}>
                    <Send className="mr-1 h-3 w-3" />
                    Assign
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!courses.length && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No courses found. Create your first course.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
