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
  Plus, GraduationCap, ArrowLeft, Loader2,
  FileText, Video, BookOpen, Target,
} from "lucide-react";
import { toast } from "sonner";

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
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const COVERS = [
  "linear-gradient(135deg, var(--brand), var(--golden))",
  "linear-gradient(135deg, var(--info), var(--brand))",
  "linear-gradient(135deg, var(--brown), var(--golden))",
  "linear-gradient(135deg, var(--golden), var(--brand))",
  "linear-gradient(135deg, #b45309, #ea580c)",
  "linear-gradient(135deg, #1e3a8a, #b45309)",
];

const coverFor = (id: string) =>
  COVERS[id.charCodeAt(id.length - 1) % COVERS.length];

// ─── main component ───────────────────────────────────────────────────────────

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Course | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${LMS_API_URL}/course`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCourses(data.data);
      } else {
        toast.error(data.message || "Failed to load courses");
      }
    } catch {
      toast.error("Network error — could not load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleCreate = async (payload: Partial<Course>) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${LMS_API_URL}/course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Course "${payload.title}" created`);
        setCourses((prev) => [data.data, ...prev]);
        setOpenDialog(false);
      } else {
        toast.error(data.message || "Creation failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  if (selected) {
    return <CourseDetail course={selected} onBack={() => setSelected(null)} />;
  }

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <h1 className="text-2xl font-display font-bold">Courses</h1>
          <Button disabled><Plus className="h-4 w-4 mr-1" /> New course</Button>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4 h-48" /></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Courses</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} course{courses.length !== 1 ? "s" : ""} in LMS
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[200px]"
          />
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="bg-brand text-brand-foreground hover:bg-brand/90 shadow-warm">
                <Plus className="h-4 w-4 mr-1" /> New course
              </Button>
            </DialogTrigger>
            <NewCourseDialog onCreate={handleCreate} />
          </Dialog>
        </div>
      </div>

      {!filtered.length && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-40" />
            {search ? "No courses match your search." : "No courses yet."}
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <CourseCard key={c._id} course={c} onOpen={() => setSelected(c)} />
        ))}
      </div>
    </div>
  );
}

// ─── course card ──────────────────────────────────────────────────────────────

function CourseCard({ course, onOpen }: { course: Course; onOpen: () => void }) {
  return (
    <Card className="overflow-hidden hover:shadow-warm transition group cursor-pointer" onClick={onOpen}>
      <div className="h-24 relative" style={{ background: coverFor(course._id) }}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-3 left-3">
          <Badge className={`text-[10px] ${course.status === "PUBLISHED" ? "bg-emerald-500/90 text-white" : "bg-amber-500/90 text-white"}`}>
            {course.status}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="text-white font-display text-base font-semibold leading-tight drop-shadow line-clamp-1">
            {course.title}
          </div>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {course.pdfUrl && (
            <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> PDF</span>
          )}
          {course.videoUrl && (
            <span className="flex items-center gap-1"><Video className="h-3 w-3" /> Video</span>
          )}
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" /> Pass: {course.passingPercentage}%
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-muted-foreground">
            {new Date(course.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
            Open →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── course detail ────────────────────────────────────────────────────────────

function CourseDetail({ course, onBack }: { course: Course; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
      </Button>

      <Card className="overflow-hidden">
        <div className="relative p-6 sm:p-8" style={{ background: coverFor(course._id) }}>
          <div className="absolute inset-0 bg-black/15" />
          <div className="relative text-white space-y-3">
            <div className="flex gap-2">
              <Badge className={course.status === "PUBLISHED" ? "bg-emerald-500/90 text-white" : "bg-amber-500/90 text-white"}>
                {course.status}
              </Badge>
              <Badge className="bg-white/20 border-white/30 text-white">
                Pass: {course.passingPercentage}%
              </Badge>
            </div>
            <h1 className="text-3xl font-display font-bold">{course.title}</h1>
            <p className="text-white/80 text-sm">{course.description}</p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand" /> Course Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{course.contentText}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {course.pdfUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-brand" /> PDF Material
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={course.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand hover:underline break-all"
                >
                  Open PDF →
                </a>
              </CardContent>
            </Card>
          )}

          {course.videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Video className="h-4 w-4 text-brand" /> Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={course.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand hover:underline break-all"
                >
                  Watch video →
                </a>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-brand" /> Passing Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <div>Passing percentage: <b>{course.passingPercentage}%</b></div>
              <div className="text-xs text-muted-foreground">
                Added {new Date(course.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── new course dialog ────────────────────────────────────────────────────────

function NewCourseDialog({ onCreate }: { onCreate: (c: Partial<Course>) => void }) {
  const [title, setTitle]                   = useState("");
  const [description, setDescription]       = useState("");
  const [contentText, setContentText]       = useState("");
  const [pdfUrl, setPdfUrl]                 = useState("");
  const [videoUrl, setVideoUrl]             = useState("");
  const [passingPercentage, setPassing]     = useState(70);
  const [saving, setSaving]                 = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!contentText.trim()) { toast.error("Course content is required"); return; }
    setSaving(true);
    await onCreate({ title, description, contentText, pdfUrl, videoUrl, passingPercentage });
    setSaving(false);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl">Create new course</DialogTitle>
        <DialogDescription>Add a course to the LMS catalogue.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <Label>Title *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sofa Sales Masterclass" required />
        </div>
        <div>
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short summary shown on the card" />
        </div>
        <div>
          <Label>Course content *</Label>
          <Textarea rows={5} value={contentText} onChange={(e) => setContentText(e.target.value)} placeholder="Full content / lesson text" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>PDF URL (optional)</Label>
            <Input value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <Label>Video URL (optional)</Label>
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://…" />
          </div>
        </div>
        <div>
          <Label>Passing percentage</Label>
          <Input type="number" min={1} max={100} value={passingPercentage}
            onChange={(e) => setPassing(Number(e.target.value))} />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={saving} className="bg-brand">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Creating…</> : "Create course"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
