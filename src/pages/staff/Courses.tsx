import { useEffect, useState } from "react";
import { LMS_API_URL } from "@/lib/api";
import { getSession } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, FileText, Video, Target, Loader2, ExternalLink } from "lucide-react";

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

export default function StaffCourses() {
  const session = getSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${LMS_API_URL}/course`);
        const data = await res.json();
        if (res.ok && data.success) {
          // staff sees published courses only
          setCourses(data.data.filter((c: Course) => c.status === "PUBLISHED"));
        } else {
          setError(data.message || "Failed to load courses");
        }
      } catch {
        setError("Network error — could not load courses");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My Courses</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading…" : `${courses.length} course${courses.length !== 1 ? "s" : ""} available`}
          {session?.name ? ` · ${session.name}` : ""}
        </p>
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
            No courses available yet. Check back soon.
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {courses.map((course) => {
          const isOpen = expanded === course._id;
          return (
            <Card
              key={course._id}
              className="overflow-hidden hover:border-brand/40 transition-colors cursor-pointer"
              onClick={() => setExpanded(isOpen ? null : course._id)}
            >
              <div className="h-20 w-full relative" style={{ background: coverFor(course._id) }}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-2 left-3 right-3">
                  <div className="text-white font-semibold text-sm leading-tight drop-shadow line-clamp-1">
                    {course.title}
                  </div>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-[10px]">
                    PUBLISHED
                  </Badge>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Target className="h-3 w-3" /> Pass: {course.passingPercentage}%
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>

                {/* Expanded content */}
                {isOpen && (
                  <div className="border-t pt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{course.contentText}</p>

                    <div className="flex flex-wrap gap-2">
                      {course.pdfUrl && (
                        <a
                          href={course.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand hover:text-white transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" /> Open PDF
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {course.videoUrl && (
                        <a
                          href={course.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand hover:text-white transition-colors"
                        >
                          <Video className="h-3.5 w-3.5" /> Watch Video
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>
                    {new Date(course.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className="text-brand">{isOpen ? "Show less ↑" : "Read more ↓"}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
