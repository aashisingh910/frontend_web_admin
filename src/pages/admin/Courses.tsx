import { useState, useEffect } from "react";
import { LMS_API_URL } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus, GraduationCap, Loader2, BookOpen, Target,
  FileText, Video, HelpCircle, CheckCircle2, LayoutGrid,
  Calendar, ExternalLink, AlertCircle, X, Pencil,
} from "lucide-react";
import { toast } from "sonner";

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

// ─── helpers ──────────────────────────────────────────────────────────────────

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

// ─── main component ───────────────────────────────────────────────────────────

export default function AdminCourses() {
  const [courses, setCourses]   = useState<Course[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Course | null>(null);   // selected course for side panel
  const [openNew, setOpenNew]   = useState(false);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${LMS_API_URL}/course`);
      const data = await res.json();
      if (res.ok && data.success) setCourses(data.data);
      else toast.error(data.message || "Failed to load courses");
    } catch {
      toast.error("Network error — could not load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (payload: Partial<Course>) => {
    try {
      const token = localStorage.getItem("token");
      const user  = JSON.parse(localStorage.getItem("user") || "{}");
      const res   = await fetch(`${LMS_API_URL}/course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...payload, createdBy: user?._id || user?.id || "" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`"${payload.title}" created`);
        setCourses((p) => [data.data, ...p]);
        setOpenNew(false);
      } else {
        toast.error(data.message || "Creation failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Course>) => {
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${LMS_API_URL}/course/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Course updated");
        setCourses((prev) => prev.map(c => c._id === id ? { ...c, ...data.data } : c));
        if (selected?._id === id) setSelected(data.data); // update panel data
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  // ── filters ──
  const published = courses.filter((c) => c.status === "PUBLISHED");
  const draft     = courses.filter((c) => c.status === "DRAFT");
  const avgPass   = courses.length
    ? Math.round(courses.reduce((a, c) => a + c.passingPercentage, 0) / courses.length)
    : 0;

  const visible = courses.filter((c) => {
    const matchFilter = filter === "ALL" || c.status === filter;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 relative">
      {/* ── header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Course Library</h1>
          <p className="text-sm text-muted-foreground">Manage LMS courses and quiz questions</p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90 shadow-warm">
              <Plus className="h-4 w-4 mr-1.5" /> New Course
            </Button>
          </DialogTrigger>
          <NewCourseDialog onCreate={handleCreate} />
        </Dialog>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: LayoutGrid,   label: "Total Courses",  value: courses.length,   tint: "bg-brand/10 text-brand" },
          { icon: GraduationCap,label: "Published",      value: published.length, tint: "bg-emerald-500/10 text-emerald-700" },
          { icon: BookOpen,     label: "Draft",          value: draft.length,     tint: "bg-amber-500/10 text-amber-700" },
          { icon: Target,       label: "Avg Pass %",     value: `${avgPass}%`,    tint: "bg-blue-500/10 text-blue-700" },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${k.tint}`}>
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

      {/* ── toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search courses…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-52"
        />
        <div className="flex rounded-lg border overflow-hidden">
          {(["ALL", "PUBLISHED", "DRAFT"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium transition ${
                filter === s
                  ? "bg-brand text-white"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {s === "ALL" ? "All" : s === "PUBLISHED" ? "Published" : "Draft"}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground">{visible.length} result{visible.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ── loading ── */}
      {loading && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4 h-56" /></Card>
          ))}
        </div>
      )}

      {/* ── empty ── */}
      {!loading && !visible.length && (
        <Card>
          <CardContent className="py-14 text-center text-muted-foreground">
            <GraduationCap className="h-9 w-9 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{search || filter !== "ALL" ? "No courses match your filter." : "No courses yet."}</p>
          </CardContent>
        </Card>
      )}

      {/* ── grid ── */}
      {!loading && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {visible.map((c) => (
            <CourseCard key={c._id} course={c} onOpen={() => setSelected(c)} />
          ))}
        </div>
      )}

      {/* ── side panel (selected course detail) ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 transition-opacity"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-3xl bg-background h-full overflow-y-auto shadow-xl animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Course Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 md:p-6">
              <CourseDetail
                course={selected}
                onUpdate={handleUpdate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── course card (unchanged) ──────────────────────────────────────────────────

function CourseCard({ course, onOpen }: { course: Course; onOpen: () => void }) {
  return (
    <Card
      className="group overflow-hidden cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-200 border-border/60"
      onClick={onOpen}
    >
      <div className="relative h-28" style={{ background: coverFor(course._id) }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            course.status === "PUBLISHED"
              ? "bg-emerald-500/90 text-white"
              : "bg-amber-400/90 text-black"
          }`}>
            {course.status}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-display font-bold text-base leading-tight drop-shadow line-clamp-2">
            {course.title}
          </h3>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{course.description}</p>
        <p className="text-xs text-foreground/70 line-clamp-3 leading-relaxed border-l-2 border-brand/30 pl-2">
          {course.contentText}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">
            <Target className="h-2.5 w-2.5" /> Pass {course.passingPercentage}%
          </span>
          {course.pdfUrl && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              <FileText className="h-2.5 w-2.5" /> PDF
            </span>
          )}
          {course.videoUrl && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
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
            View Details →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── course detail (panel version) ────────────────────────────────────────────

function CourseDetail({ course, onUpdate }: { course: Course; onUpdate: (id: string, updates: Partial<Course>) => void }) {
  const [questions, setQuestions]   = useState<Question[]>([]);
  const [qLoading, setQLoading]     = useState(true);
  const [qError, setQError]         = useState("");
  const [addQOpen, setAddQOpen]     = useState(false);
  const [editCourseOpen, setEditCourseOpen] = useState(false);

  const loadQuestions = async () => {
    setQLoading(true);
    setQError("");
    try {
      const res  = await fetch(`${LMS_API_URL}/course/${course._id}/question`);
      const data = await res.json();
      if (res.ok && data.success) setQuestions(Array.isArray(data.data) ? data.data : []);
      else setQError(data.message || "Failed to load questions");
    } catch {
      setQError("Network error");
    } finally {
      setQLoading(false);
    }
  };

  useEffect(() => { loadQuestions(); }, [course._id]);

  const handleAddQuestion = async (payload: Omit<Question, "_id" | "createdAt" | "updatedAt">) => {
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${LMS_API_URL}/course/${course._id}/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Question added");
        setQuestions((p) => [...p, data.data]);
        setAddQOpen(false);
      } else {
        toast.error(data.message || "Failed to add question");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const totalMarks = questions.reduce((a, q) => a + q.marks, 0);

  return (
    <div className="space-y-6">
      {/* ── edit button ── */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setEditCourseOpen(true)}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Course
        </Button>
        <Dialog open={editCourseOpen} onOpenChange={setEditCourseOpen}>
          <EditCourseDialog
            course={course}
            onUpdate={(updates) => {
              onUpdate(course._id, updates);
              setEditCourseOpen(false);
            }}
          />
        </Dialog>
      </div>

      {/* ── hero ── */}
      <div className="relative rounded-xl overflow-hidden" style={{ background: coverFor(course._id) }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative p-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              course.status === "PUBLISHED" ? "bg-emerald-500 text-white" : "bg-amber-400 text-black"
            }`}>{course.status}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs text-white backdrop-blur-sm">
              <Target className="h-3 w-3" /> Pass: {course.passingPercentage}%
            </span>
            {course.pdfUrl && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs text-white backdrop-blur-sm">
                <FileText className="h-3 w-3" /> PDF
              </span>
            )}
            {course.videoUrl && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs text-white backdrop-blur-sm">
                <Video className="h-3 w-3" /> Video
              </span>
            )}
          </div>
          <h1 className="text-2xl font-display font-bold text-white leading-tight">{course.title}</h1>
          <p className="text-white/80 text-sm">{course.description}</p>
          <p className="text-white/50 text-xs">Added {fmt(course.createdAt)} · Last updated {fmt(course.updatedAt)}</p>
        </div>
      </div>

      {/* ── body ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* left col */}
        <div className="lg:col-span-2 space-y-6">
          {/* content */}
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

          {/* questions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <HelpCircle className="h-4 w-4 text-brand" /> Quiz Questions
                  {!qLoading && (
                    <span className="text-xs font-normal text-muted-foreground">
                      ({questions.length} question{questions.length !== 1 ? "s" : ""}{totalMarks > 0 ? `, ${totalMarks} marks` : ""})
                    </span>
                  )}
                </CardTitle>
                <Dialog open={addQOpen} onOpenChange={setAddQOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-8 bg-brand text-white hover:bg-brand/90 text-xs">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
                    </Button>
                  </DialogTrigger>
                  <AddQuestionDialog courseId={course._id} onAdd={handleAddQuestion} />
                </Dialog>
              </div>
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
                  <p className="text-sm text-muted-foreground">No questions yet — add the first one.</p>
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

        {/* right col */}
        <div className="space-y-4">
          {/* resources */}
          {(course.pdfUrl || course.videoUrl) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {course.pdfUrl && (
                  <a
                    href={course.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border p-3 text-sm hover:border-brand/50 hover:bg-brand/5 transition-colors group"
                  >
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
                  <a
                    href={course.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border p-3 text-sm hover:border-brand/50 hover:bg-brand/5 transition-colors group"
                  >
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

          {/* course info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Course Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground text-xs">Status</span>
                <Badge className={`text-[10px] ${course.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {course.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground text-xs">Passing Score</span>
                <span className="font-semibold text-xs">{course.passingPercentage}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground text-xs">Questions</span>
                <span className="font-semibold text-xs">{qLoading ? "…" : questions.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground text-xs">Total Marks</span>
                <span className="font-semibold text-xs">{qLoading ? "…" : totalMarks}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground text-xs">Created</span>
                <span className="text-xs">{fmt(course.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground text-xs">Updated</span>
                <span className="text-xs">{fmt(course.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── question card ────────────────────────────────────────────────────────────

function QuestionCard({ question, index }: { question: Question; index: number }) {
  return (
    <div className="rounded-xl border border-border/60 p-4 space-y-3 hover:border-brand/30 transition-colors">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
          {index + 1}
        </span>
        <div className="flex-1 space-y-3">
          <p className="text-sm font-medium leading-relaxed">{question.question}</p>
          <div className="grid grid-cols-2 gap-2">
            {question.options.map((opt, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                  i === question.correctAnswer
                    ? "border-emerald-400/60 bg-emerald-50 text-emerald-800"
                    : "border-border/60 bg-muted/30 text-muted-foreground"
                }`}
              >
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                  i === question.correctAnswer ? "bg-emerald-500 text-white" : "bg-border text-muted-foreground"
                }`}>
                  {Q_LABELS[i]}
                </span>
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

// ─── edit course dialog ───────────────────────────────────────────────────────

function EditCourseDialog({ course, onUpdate }: { course: Course; onUpdate: (updates: Partial<Course>) => void }) {
  const [title, setTitle]           = useState(course.title);
  const [description, setDesc]      = useState(course.description);
  const [contentText, setContent]   = useState(course.contentText);
  const [pdfUrl, setPdf]            = useState(course.pdfUrl);
  const [videoUrl, setVideo]        = useState(course.videoUrl);
  const [passing, setPassing]       = useState(course.passingPercentage);
  const [status, setStatus]         = useState<"PUBLISHED" | "DRAFT">(course.status);
  const [saving, setSaving]         = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    await onUpdate({ title, description, contentText, pdfUrl, videoUrl, passingPercentage: passing, status });
    setSaving(false);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Course</DialogTitle>
        <DialogDescription>Update course details.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4 pt-2">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Course Content *</Label>
            <Textarea rows={5} value={contentText} onChange={(e) => setContent(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>PDF URL</Label>
            <Input value={pdfUrl} onChange={(e) => setPdf(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Video URL</Label>
            <Input value={videoUrl} onChange={(e) => setVideo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Passing %</Label>
            <Input type="number" min={1} max={100} value={passing} onChange={(e) => setPassing(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <div className="flex rounded-lg border overflow-hidden">
              {(["PUBLISHED", "DRAFT"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 text-xs font-medium transition ${
                    status === s
                      ? s === "PUBLISHED" ? "bg-emerald-500 text-white" : "bg-amber-400 text-black"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={saving} className="bg-brand text-white hover:bg-brand/90">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// ─── add question dialog (unchanged) ──────────────────────────────────────────

function AddQuestionDialog({
  courseId,
  onAdd,
}: {
  courseId: string;
  onAdd: (payload: Omit<Question, "_id" | "createdAt" | "updatedAt">) => Promise<void>;
}) {
  const [qText, setQText]       = useState("");
  const [options, setOptions]   = useState(["", "", "", ""]);
  const [correct, setCorrect]   = useState(0);
  const [marks, setMarks]       = useState(1);
  const [saving, setSaving]     = useState(false);

  const updateOpt = (i: number, v: string) =>
    setOptions((p) => p.map((o, idx) => (idx === i ? v : o)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) { toast.error("Question text is required"); return; }
    if (options.some((o) => !o.trim())) { toast.error("All 4 options are required"); return; }
    setSaving(true);
    await onAdd({ courseId, question: qText, options, correctAnswer: correct, marks });
    setSaving(false);
  };

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add Question</DialogTitle>
        <DialogDescription>
          Enter the MCQ question. Click a letter circle to mark the correct answer.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-5 pt-2">
        <div className="space-y-1.5">
          <Label>Question *</Label>
          <Textarea
            rows={3}
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="e.g. What is the full form of POS?"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Answer Options * <span className="text-muted-foreground font-normal">(click letter to mark correct)</span></Label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCorrect(i)}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                    correct === i
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-brand"
                  }`}
                >
                  {Q_LABELS[i]}
                </button>
                <Input
                  value={opt}
                  onChange={(e) => updateOpt(i, e.target.value)}
                  placeholder={`Option ${Q_LABELS[i]}`}
                  className={correct === i ? "border-emerald-400 focus-visible:ring-emerald-500" : ""}
                  required
                />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground bg-muted/40 rounded px-2 py-1">
            ✓ Correct answer set to Option <strong>{Q_LABELS[correct]}</strong>
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Marks for this question</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={marks}
            onChange={(e) => setMarks(Math.max(1, Number(e.target.value)))}
            className="w-28"
          />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={saving} className="bg-brand text-white hover:bg-brand/90">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Saving…</> : "Add Question"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// ─── new course dialog (unchanged) ────────────────────────────────────────────

function NewCourseDialog({ onCreate }: { onCreate: (c: Partial<Course>) => void }) {
  const [title, setTitle]           = useState("");
  const [description, setDesc]      = useState("");
  const [contentText, setContent]   = useState("");
  const [pdfUrl, setPdf]            = useState("");
  const [videoUrl, setVideo]        = useState("");
  const [passing, setPassing]       = useState(70);
  const [status, setStatus]         = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [saving, setSaving]         = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!contentText.trim()) { toast.error("Course content is required"); return; }
    setSaving(true);
    await onCreate({ title, description, contentText, pdfUrl, videoUrl, passingPercentage: passing, status });
    setSaving(false);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl">Create New Course</DialogTitle>
        <DialogDescription>Add a course to the LMS catalogue.</DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-4 pt-2">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sofa Sales Masterclass" required />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDesc(e.target.value)} placeholder="Short summary shown on the card" />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label>Course Content *</Label>
            <Textarea
              rows={5}
              value={contentText}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full lesson content / training material"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>PDF URL</Label>
            <Input value={pdfUrl} onChange={(e) => setPdf(e.target.value)} placeholder="https://…" />
          </div>

          <div className="space-y-1.5">
            <Label>Video URL</Label>
            <Input value={videoUrl} onChange={(e) => setVideo(e.target.value)} placeholder="https://…" />
          </div>

          <div className="space-y-1.5">
            <Label>Passing Percentage</Label>
            <Input type="number" min={1} max={100} value={passing} onChange={(e) => setPassing(Number(e.target.value))} />
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <div className="flex rounded-lg border overflow-hidden">
              {(["PUBLISHED", "DRAFT"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 text-xs font-medium transition ${
                    status === s
                      ? s === "PUBLISHED" ? "bg-emerald-500 text-white" : "bg-amber-400 text-black"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" disabled={saving} className="bg-brand text-white hover:bg-brand/90">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Creating…</> : "Create Course"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}