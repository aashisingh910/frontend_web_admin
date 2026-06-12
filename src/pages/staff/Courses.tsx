import { useEffect, useState } from "react";
import { LMS_API_URL } from "@/lib/api";
import { getSession } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, Target, FileText, Video, Loader2,
  HelpCircle, CheckCircle2, ExternalLink, ChevronDown, ChevronUp,
  BookOpen, AlertCircle,
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

// ─── component ────────────────────────────────────────────────────────────────

export default function StaffCourses() {
  const session = getSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${LMS_API_URL}/course`);
        const data = await res.json();
        if (res.ok && data.success) {
          setCourses((data.data as Course[]).filter((c) => c.status === "PUBLISHED"));
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

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-6 pb-8">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-display font-bold">My Courses</h1>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading courses…"
              : `${courses.length} course${courses.length !== 1 ? "s" : ""} available`}
            {session?.name ? ` · ${session.name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs text-emerald-700 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" /> Published
        </div>
      </div>

      {/* loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-brand" />
          <p className="text-sm text-muted-foreground">Loading your courses…</p>
        </div>
      )}

      {/* error */}
      {error && (
        <Card>
          <CardContent className="p-5 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </CardContent>
        </Card>
      )}

      {/* empty */}
      {!loading && !error && courses.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <GraduationCap className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">No courses available yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Check back soon — your manager will assign courses.</p>
          </CardContent>
        </Card>
      )}

      {/* course cards */}
      {!loading && !error && (
        <div className="grid sm:grid-cols-2 gap-5">
          {courses.map((course) => (
            <StaffCourseCard
              key={course._id}
              course={course}
              isOpen={expanded === course._id}
              onToggle={() => toggle(course._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── staff course card ────────────────────────────────────────────────────────

function StaffCourseCard({
  course,
  isOpen,
  onToggle,
}: {
  course: Course;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [qLoading, setQLoading]   = useState(false);
  const [qError, setQError]       = useState("");

  const loadQuestions = async () => {
    if (questions !== null) return; // already loaded
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
  };

  const handleToggle = () => {
    onToggle();
    if (!isOpen) loadQuestions();
  };

  const totalMarks = (questions ?? []).reduce((a, q) => a + q.marks, 0);

  return (
    <Card className={`overflow-hidden transition-all duration-200 border-border/60 ${isOpen ? "border-brand/30 shadow-[0_4px_20px_rgba(0,0,0,0.08)]" : "hover:border-brand/20 hover:shadow-sm"}`}>
      {/* cover */}
      <div
        className="relative h-28 cursor-pointer select-none"
        style={{ background: coverFor(course._id) }}
        onClick={handleToggle}
      >
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10px] font-semibold text-white">
            PUBLISHED
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
            <Target className="h-2.5 w-2.5" /> {course.passingPercentage}% pass
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-display font-bold text-base leading-tight drop-shadow">
            {course.title}
          </h3>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* description */}
        <p className="text-xs text-muted-foreground leading-relaxed">{course.description}</p>

        {/* badges row */}
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
          {questions !== null && questions.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/5 border border-brand/20 px-2 py-0.5 text-[10px] text-brand">
              <HelpCircle className="h-2.5 w-2.5" /> {questions.length} quiz Q{questions.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* expand toggle */}
        <Button
          variant="ghost"
          className="w-full h-8 text-xs text-muted-foreground hover:text-brand hover:bg-brand/5 border border-dashed"
          onClick={handleToggle}
        >
          {isOpen ? (
            <><ChevronUp className="h-3.5 w-3.5 mr-1.5" /> Hide Details</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5 mr-1.5" /> Show Full Content &amp; Quiz</>
          )}
        </Button>

        {/* expanded content */}
        {isOpen && (
          <div className="space-y-4 border-t pt-4" onClick={(e) => e.stopPropagation()}>

            {/* full content */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
                <BookOpen className="h-3.5 w-3.5 text-brand" /> Course Content
              </div>
              <p className="text-xs leading-6 whitespace-pre-wrap text-foreground/75 bg-muted/30 rounded-lg p-3 border">
                {course.contentText}
              </p>
            </div>

            {/* resource links */}
            {(course.pdfUrl || course.videoUrl) && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Learning Resources</p>
                {course.pdfUrl && (
                  <a
                    href={course.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="flex-1 font-medium">Open PDF Material</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                )}
                {course.videoUrl && (
                  <a
                    href={course.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Video className="h-4 w-4 shrink-0" />
                    <span className="flex-1 font-medium">Watch Video Lesson</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                )}
              </div>
            )}

            {/* quiz questions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <HelpCircle className="h-3.5 w-3.5 text-brand" /> Quiz Questions
                </div>
                {questions !== null && questions.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">{questions.length} Q · {totalMarks} mark{totalMarks !== 1 ? "s" : ""}</span>
                )}
              </div>

              {qLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {qError && (
                <div className="flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {qError}
                </div>
              )}

              {questions !== null && questions.length === 0 && !qLoading && (
                <div className="rounded-lg border border-dashed py-6 text-center">
                  <HelpCircle className="h-6 w-6 mx-auto mb-1.5 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">No questions yet for this course.</p>
                </div>
              )}

              {questions !== null && questions.length > 0 && (
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <StaffQuestionCard key={q._id} question={q} index={idx} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── staff question card ──────────────────────────────────────────────────────

function StaffQuestionCard({ question, index }: { question: Question; index: number }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-xl border border-border/60 p-3.5 space-y-2.5 bg-card">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">
          {index + 1}
        </span>
        <p className="text-xs font-medium leading-relaxed flex-1">{question.question}</p>
        <Badge variant="outline" className="text-[9px] shrink-0">{question.marks}m</Badge>
      </div>

      <div className="grid grid-cols-2 gap-1.5 pl-7">
        {question.options.map((opt, i) => (
          <div
            key={i}
            className={`flex items-start gap-1.5 rounded-lg border px-2.5 py-2 text-[11px] transition-colors ${
              revealed && i === question.correctAnswer
                ? "border-emerald-400/60 bg-emerald-50 text-emerald-800"
                : "border-border/60 bg-muted/20 text-muted-foreground"
            }`}
          >
            <span className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${
              revealed && i === question.correctAnswer
                ? "bg-emerald-500 text-white"
                : "bg-muted-foreground/20 text-muted-foreground"
            }`}>
              {Q_LABELS[i]}
            </span>
            <span className="leading-relaxed">{opt}</span>
            {revealed && i === question.correctAnswer && (
              <CheckCircle2 className="h-3 w-3 shrink-0 ml-auto mt-0.5 text-emerald-500" />
            )}
          </div>
        ))}
      </div>

      <div className="pl-7">
        <button
          onClick={() => setRevealed((p) => !p)}
          className="text-[10px] font-medium text-brand/70 hover:text-brand transition-colors underline underline-offset-2"
        >
          {revealed ? "Hide answer" : "Reveal answer"}
        </button>
      </div>
    </div>
  );
}
