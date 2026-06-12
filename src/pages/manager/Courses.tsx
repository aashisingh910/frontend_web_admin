import { useEffect, useState } from "react";
import { LMS_API_URL } from "@/lib/api";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap, BookOpen, Target, FileText, Video, Loader2,
  ArrowLeft, HelpCircle, CheckCircle2, LayoutGrid, AlertCircle,
  Calendar, ExternalLink,
} from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────

interface Course {
  _id: string;
  title: string;
  description: string;
  contentText: string;
  pdfUrl: string;
  videoUrl: string;
  passingPercentage: number;
  status: "PUBLISHED" | "DRAFT";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Question {
  _id: string;
  courseId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  createdAt: string;
  updatedAt: string;
}

// ─── constants ────────────────────────────────────────────────────────────────

const COVERS = [
  "linear-gradient(135deg,#3B2416 0%,#C8A24A 100%)",
  "linear-gradient(135deg,#102A43 0%,#3B2416 100%)",
  "linear-gradient(135deg,#6F4E37 0%,#C8A24A 100%)",
  "linear-gradient(135deg,#B85C38 0%,#6F4E37 100%)",
  "linear-gradient(135deg,#102A43 0%,#C8A24A 100%)",
  "linear-gradient(135deg,#3B2416 0%,#B85C38 100%)",
];
const coverFor = (id: string) => COVERS[id.charCodeAt(id.length - 1) % COVERS.length];
const Q_LABELS = ["A", "B", "C", "D"];
const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// ─── component ────────────────────────────────────────────────────────────────

export default function ManagerCourses() {
  const session = getSession();
  const [courses, setCourses]   = useState<Course[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [selected, setSelected] = useState<Course | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${LMS_API_URL}/course`);
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

  if (selected) {
    return <CourseDetail course={selected} onBack={() => setSelected(null)} />;
  }

  const published = courses.filter((c) => c.status === "PUBLISHED");
  const avgPass   = courses.length
    ? Math.round(courses.reduce((a, c) => a + c.passingPercentage, 0) / courses.length)
    : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* header */}
      <div>
        <h1 className="text-2xl font-display font-bold">Courses</h1>
        <p className="text-sm text-muted-foreground">
          {session?.storeName || "Your store"} · Team learning catalogue
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: LayoutGrid,    label: "Total",      value: courses.length,   color: "bg-brand/10 text-brand" },
          { icon: GraduationCap, label: "Published",  value: published.length, color: "bg-emerald-500/10 text-emerald-700" },
          { icon: Target,        label: "Avg Pass %", value: `${avgPass}%`,    color: "bg-amber-500/10 text-amber-700" },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${k.color}`}>
                <k.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground leading-none">{k.label}</p>
                <p className="font-display text-xl font-bold mt-0.5">{k.value}</p>
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
          <CardContent className="p-5 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </CardContent>
        </Card>
      )}

      {!loading && !error && courses.length === 0 && (
        <Card>
          <CardContent className="py-14 text-center text-muted-foreground">
            <GraduationCap className="h-9 w-9 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No courses available yet.</p>
          </CardContent>
        </Card>
      )}

      {/* course grid */}
      {!loading && !error && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((c) => (
            <ManagerCourseCard key={c._id} course={c} onOpen={() => setSelected(c)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── manager course card ──────────────────────────────────────────────────────

function ManagerCourseCard({ course, onOpen }: { course: Course; onOpen: () => void }) {
  return (
    <Card
      className="group overflow-hidden cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-200 border-border/60"
      onClick={onOpen}
    >
      {/* cover */}
      <div className="relative h-28" style={{ background: coverFor(course._id) }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            course.status === "PUBLISHED" ? "bg-emerald-500/90 text-white" : "bg-amber-400/90 text-black"
          }`}>{course.status}</span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-display font-bold text-base leading-tight drop-shadow line-clamp-2">
            {course.title}
          </h3>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{course.description}</p>

        {/* content preview */}
        <p className="text-xs text-foreground/70 line-clamp-2 leading-relaxed border-l-2 border-brand/30 pl-2">
          {course.contentText}
        </p>

        {/* pass % bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Passing score</span>
            <span className="font-semibold">{course.passingPercentage}%</span>
          </div>
          <Progress value={course.passingPercentage} className="h-1.5" />
        </div>

        {/* tags */}
        <div className="flex flex-wrap gap-1.5">
          {course.pdfUrl && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-[10px] text-red-600">
              <FileText className="h-2.5 w-2.5" /> PDF
            </span>
          )}
          {course.videoUrl && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] text-blue-600">
              <Video className="h-2.5 w-2.5" /> Video
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" /> {fmt(course.createdAt)}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-brand hover:text-brand hover:bg-brand/10 px-2"
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
          >
            View →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── course detail ────────────────────────────────────────────────────────────

function CourseDetail({ course, onBack }: { course: Course; onBack: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qLoading, setQLoading]   = useState(true);
  const [qError, setQError]       = useState("");

  useEffect(() => {
    (async () => {
      setQLoading(true);
      setQError("");
      try {
        const res  = await fetch(`${LMS_API_URL}/course/${course._id}/question`);
        const data = await res.json();
        if (res.ok && data.success) setQuestions(Array.isArray(data.data) ? data.data : []);
        else setQError(data.message || "Could not load questions");
      } catch {
        setQError("Network error");
      } finally {
        setQLoading(false);
      }
    })();
  }, [course._id]);

  const totalMarks = questions.reduce((a, q) => a + q.marks, 0);

  return (
    <div className="space-y-6 pb-8">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </Button>

      {/* hero */}
      <div className="relative rounded-xl overflow-hidden" style={{ background: coverFor(course._id) }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative p-7 sm:p-10 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              course.status === "PUBLISHED" ? "bg-emerald-500 text-white" : "bg-amber-400 text-black"
            }`}>{course.status}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs text-white backdrop-blur-sm">
              <Target className="h-3 w-3" /> Pass: {course.passingPercentage}%
            </span>
            {course.pdfUrl && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs text-white backdrop-blur-sm">
                <FileText className="h-3 w-3" /> PDF Available
              </span>
            )}
            {course.videoUrl && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs text-white backdrop-blur-sm">
                <Video className="h-3 w-3" /> Video Available
              </span>
            )}
          </div>
          <h1 className="text-3xl font-display font-bold text-white leading-tight">{course.title}</h1>
          <p className="text-white/80 text-sm max-w-2xl">{course.description}</p>
          <p className="text-white/50 text-xs">Added {fmt(course.createdAt)} · Updated {fmt(course.updatedAt)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* main */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-brand" /> Course Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 whitespace-pre-wrap text-foreground/80">{course.contentText}</p>
            </CardContent>
          </Card>

          {/* questions (read-only) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <HelpCircle className="h-4 w-4 text-brand" /> Quiz Questions
                {!qLoading && (
                  <span className="text-xs font-normal text-muted-foreground">
                    ({questions.length} question{questions.length !== 1 ? "s" : ""}{totalMarks > 0 ? `, ${totalMarks} marks` : ""})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {qLoading && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {qError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {qError}
                </div>
              )}
              {!qLoading && !qError && questions.length === 0 && (
                <div className="py-10 text-center">
                  <HelpCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No questions have been added to this course yet.</p>
                </div>
              )}
              {!qLoading && questions.length > 0 && (
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <QuestionCard key={q._id} question={q} index={idx} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* sidebar */}
        <div className="space-y-4">
          {(course.pdfUrl || course.videoUrl) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {course.pdfUrl && (
                  <a href={course.pdfUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border p-3 text-sm hover:border-brand/50 hover:bg-brand/5 transition-colors group">
                    <div className="h-8 w-8 rounded-md bg-red-50 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs">PDF Material</div>
                      <div className="text-[11px] text-muted-foreground truncate">{course.pdfUrl}</div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand" />
                  </a>
                )}
                {course.videoUrl && (
                  <a href={course.videoUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border p-3 text-sm hover:border-brand/50 hover:bg-brand/5 transition-colors group">
                    <div className="h-8 w-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                      <Video className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs">Video Lesson</div>
                      <div className="text-[11px] text-muted-foreground truncate">{course.videoUrl}</div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Course Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 text-sm divide-y">
              {[
                { label: "Status",     value: <Badge className={`text-[10px] ${course.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{course.status}</Badge> },
                { label: "Passing",    value: <span className="font-semibold text-xs">{course.passingPercentage}%</span> },
                { label: "Questions",  value: <span className="font-semibold text-xs">{qLoading ? "…" : questions.length}</span> },
                { label: "Total Marks",value: <span className="font-semibold text-xs">{qLoading ? "…" : totalMarks}</span> },
                { label: "Added",      value: <span className="text-xs">{fmt(course.createdAt)}</span> },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2.5">
                  <span className="text-muted-foreground text-xs">{row.label}</span>
                  {row.value}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── question card (read-only) ────────────────────────────────────────────────

function QuestionCard({ question, index }: { question: Question; index: number }) {
  return (
    <div className="rounded-xl border border-border/60 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
          {index + 1}
        </span>
        <div className="flex-1 space-y-3">
          <p className="text-sm font-medium leading-relaxed">{question.question}</p>

          <div className="grid grid-cols-2 gap-2">
            {question.options.map((opt, i) => (
              <div key={i} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                i === question.correctAnswer
                  ? "border-emerald-400/60 bg-emerald-50 text-emerald-800"
                  : "border-border/60 bg-muted/30 text-muted-foreground"
              }`}>
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                  i === question.correctAnswer ? "bg-emerald-500 text-white" : "bg-border text-muted-foreground"
                }`}>{Q_LABELS[i]}</span>
                <span className="leading-relaxed">{opt}</span>
                {i === question.correctAnswer && (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 ml-auto mt-0.5 text-emerald-500" />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-normal">
              {question.marks} mark{question.marks !== 1 ? "s" : ""}
            </Badge>
            <span className="text-[10px] text-muted-foreground">Correct: Option {Q_LABELS[question.correctAnswer]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
