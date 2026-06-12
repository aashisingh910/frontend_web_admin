import { useEffect, useState } from "react";
import { LMS_API_URL } from "@/lib/api";
import { getSession } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, BookOpen, Target, FileText, Video, Loader2 } from "lucide-react";

// ─── types ───────────────────────────────────────────────────────────────────

interface Course {
  _id: string;
  title: string;
  description: string;
  contentText: string;
  pdfUrl: string;
  videoUrl: string;
  passingPercentage: number;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
}

const COVERS = [
  "linear-gradient(135deg, var(--brand), var(--golden))",
  "linear-gradient(135deg, var(--info), var(--brand))",
  "linear-gradient(135deg, var(--brown), var(--golden))",
  "linear-gradient(135deg, var(--golden), var(--brand))",
  "linear-gradient(135deg, #b45309, #ea580c)",
  "linear-gradient(135deg, #1e3a8a, #b45309)",
];

const coverFor = (id: string) => COVERS[id.charCodeAt(id.length - 1) % COVERS.length];

// ─── component ───────────────────────────────────────────────────────────────

export default function ManagerCourses() {
  const session = getSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${LMS_API_URL}/course`);
        const data = await res.json();
        if (res.ok && data.success) setCourses(data.data);
        else setError(data.message || "Failed to load courses");
      } catch {
        setError("Network error — could not load courses");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const published = courses.filter((c) => c.status === "PUBLISHED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Courses</h1>
        <p className="text-sm text-muted-foreground">
          {session?.storeName || "My store"} — track your team's learning progress.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: BookOpen,      label: "Total courses",     value: courses.length,   tint: "bg-brand/10 text-brand" },
          { icon: GraduationCap, label: "Published",         value: published.length, tint: "bg-emerald-500/10 text-emerald-700" },
          { icon: Target,        label: "Avg pass %",        value: courses.length ? Math.round(courses.reduce((a, c) => a + c.passingPercentage, 0) / courses.length) + "%" : "—", tint: "bg-amber-500/10 text-amber-700" },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-md flex items-center justify-center ${k.tint}`}>
                <k.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
                <div className="font-display text-xl font-bold">{k.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="p-6 text-center text-red-600 text-sm">{error}</CardContent>
        </Card>
      )}

      {!loading && !error && !courses.length && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No courses available yet.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {courses.map((course) => (
          <Card key={course._id} className="overflow-hidden hover:border-brand/40 transition-colors">
            <CardContent className="p-0 flex">
              <div className="w-2 shrink-0" style={{ background: coverFor(course._id) }} />
              <div className="p-4 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{course.title}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${course.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" : "bg-amber-500/10 text-amber-700 border-amber-500/30"}`}
                  >
                    {course.status}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" /> Pass: {course.passingPercentage}%
                  </span>
                  {course.pdfUrl && (
                    <a href={course.pdfUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-brand hover:underline" onClick={(e) => e.stopPropagation()}>
                      <FileText className="h-3 w-3" /> PDF
                    </a>
                  )}
                  {course.videoUrl && (
                    <a href={course.videoUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-brand hover:underline" onClick={(e) => e.stopPropagation()}>
                      <Video className="h-3 w-3" /> Video
                    </a>
                  )}
                  <span className="ml-auto">
                    {new Date(course.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
