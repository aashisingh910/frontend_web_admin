import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { adminCourseApi } from "@/services/courseApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Question = {
  questionId: string;
  type: "MCQ" | "TRUE_FALSE" | "DESCRIPTIVE";
  question: string;
  options: string[];
  correctAnswer: string;
  marks: number;
};

const emptyQuestion = (): Question => ({
  questionId: `Q${Date.now()}`,
  type: "MCQ",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  marks: 1,
});

export default function AdminCreateCoursePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editCourseId = params.get("edit");

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    courseId: "",
    title: "",
    category: "SALES",
    level: "BEGINNER",
    description: "",
    readingContent: "",
    estimatedMinutes: 20,
    passingScorePercent: 70,
    status: "ACTIVE",
    badgeId: "",
    badgeName: "",
    badgeIcon: "🏆",
    badgeColor: "gold",
    badgeDescription: "",
  });
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);

  const loadCourse = async () => {
    if (!editCourseId) return;
    setLoading(true);
    try {
      const course = await adminCourseApi.getById(editCourseId);
      setForm({
        courseId: course.courseId || "",
        title: course.title || "",
        category: course.category || "SALES",
        level: course.level || "BEGINNER",
        description: course.description || "",
        readingContent: course.readingContent || "",
        estimatedMinutes: course.estimatedMinutes || 20,
        passingScorePercent: course.passingScorePercent || 70,
        status: course.status || "ACTIVE",
        badgeId: course.completionBadge?.badgeId || "",
        badgeName: course.completionBadge?.badgeName || "",
        badgeIcon: course.completionBadge?.badgeIcon || "🏆",
        badgeColor: course.completionBadge?.badgeColor || "gold",
        badgeDescription: course.completionBadge?.description || "",
      });
      setQuestions(course.questions?.length ? course.questions : [emptyQuestion()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCourse(); }, [editCourseId]);

  const updateQuestion = (index: number, key: keyof Question, value: string | number | string[]) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, [key]: value } : q)));
  };

  const updateOption = (qIndex: number, optionIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((opt, oi) => (oi === optionIndex ? value : opt)) }
          : q
      )
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      courseId: form.courseId || undefined,
      title: form.title,
      category: form.category,
      level: form.level,
      description: form.description,
      readingContent: form.readingContent,
      estimatedMinutes: Number(form.estimatedMinutes),
      passingScorePercent: Number(form.passingScorePercent),
      questions: questions.map((q, index) => ({
        questionId: q.questionId || `Q${index + 1}`,
        type: q.type,
        question: q.question,
        options: q.type === "DESCRIPTIVE" ? [] : q.options.filter(Boolean),
        correctAnswer: q.type === "DESCRIPTIVE" ? null : q.correctAnswer,
        marks: Number(q.marks || 1),
      })),
      completionBadge: {
        badgeId: form.badgeId || `BADGE-${form.courseId || Date.now()}`,
        badgeName: form.badgeName || `${form.title} Completed`,
        badgeIcon: form.badgeIcon,
        badgeColor: form.badgeColor,
        description: form.badgeDescription || `Awarded for completing ${form.title}`,
      },
      status: form.status,
    };
    try {
      if (editCourseId) {
        await adminCourseApi.update(editCourseId, payload);
        toast.success("Course updated successfully");
      } else {
        await adminCourseApi.create(payload);
        toast.success("Course created successfully");
      }
      navigate("/courses/manage");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  if (loading && editCourseId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6 pb-8">
      <header>
        <h1 className="text-2xl font-display font-bold">
          {editCourseId ? "Update Course" : "Create Course"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Add reading material, questions and completion badge.
        </p>
      </header>

      {/* ── course details ── */}
      <Card>
        <CardHeader><CardTitle className="text-base">Course Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Course ID">
            <Input
              value={form.courseId}
              disabled={Boolean(editCourseId)}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              placeholder="COURSE-SALES-001"
            />
          </Field>

          <Field label="Title">
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="HomeTown Sofa Sales Excellence"
            />
          </Field>

          <Field label="Category">
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="SALES"
            />
          </Field>

          <Field label="Level">
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
            </select>
          </Field>

          <Field label="Estimated Minutes">
            <Input
              type="number"
              value={form.estimatedMinutes}
              onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) })}
            />
          </Field>

          <Field label="Passing Score %">
            <Input
              type="number"
              value={form.passingScorePercent}
              onChange={(e) => setForm({ ...form, passingScorePercent: Number(e.target.value) })}
            />
          </Field>

          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </Field>

          <div className="md:col-span-2 space-y-2">
            <Label>Description</Label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="min-h-20 w-full rounded-md border bg-background p-3 text-sm"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Reading Content *</Label>
            <textarea
              required
              value={form.readingContent}
              onChange={(e) => setForm({ ...form, readingContent: e.target.value })}
              className="min-h-40 w-full rounded-md border bg-background p-3 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── badge ── */}
      <Card>
        <CardHeader><CardTitle className="text-base">Completion Badge</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Badge ID">
            <Input value={form.badgeId} onChange={(e) => setForm({ ...form, badgeId: e.target.value })} placeholder="BADGE-SOFA-SALES" />
          </Field>
          <Field label="Badge Name">
            <Input value={form.badgeName} onChange={(e) => setForm({ ...form, badgeName: e.target.value })} placeholder="Sofa Sales Champion" />
          </Field>
          <Field label="Badge Icon">
            <Input value={form.badgeIcon} onChange={(e) => setForm({ ...form, badgeIcon: e.target.value })} placeholder="🏆" />
          </Field>
          <Field label="Badge Color">
            <Input value={form.badgeColor} onChange={(e) => setForm({ ...form, badgeColor: e.target.value })} placeholder="gold" />
          </Field>
          <div className="md:col-span-2 space-y-2">
            <Label>Badge Description</Label>
            <Input value={form.badgeDescription} onChange={(e) => setForm({ ...form, badgeDescription: e.target.value })} placeholder="Awarded for completing sofa sales training." />
          </div>
        </CardContent>
      </Card>

      {/* ── questions ── */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Questions</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => setQuestions((p) => [...p, emptyQuestion()])}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q, index) => (
            <div key={index} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-sm">Question {index + 1}</div>
                {questions.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setQuestions((p) => p.filter((_, i) => i !== index))}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Question ID">
                  <Input value={q.questionId} onChange={(e) => updateQuestion(index, "questionId", e.target.value)} />
                </Field>
                <Field label="Type">
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(index, "type", e.target.value as Question["type"])}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="TRUE_FALSE">TRUE_FALSE</option>
                    <option value="DESCRIPTIVE">DESCRIPTIVE</option>
                  </select>
                </Field>
                <Field label="Marks">
                  <Input type="number" value={q.marks} onChange={(e) => updateQuestion(index, "marks", Number(e.target.value))} />
                </Field>
              </div>

              <Field label="Question">
                <Input value={q.question} onChange={(e) => updateQuestion(index, "question", e.target.value)} placeholder="Enter question" />
              </Field>

              {q.type === "MCQ" && (
                <div className="grid gap-2 md:grid-cols-2">
                  {q.options.map((option, optionIndex) => (
                    <Input
                      key={optionIndex}
                      value={option}
                      onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                  ))}
                </div>
              )}

              {q.type === "TRUE_FALSE" && (
                <div className="grid gap-2 md:grid-cols-2">
                  <Input value="true" disabled />
                  <Input value="false" disabled />
                </div>
              )}

              {q.type !== "DESCRIPTIVE" ? (
                <Field label="Correct Answer">
                  <Input
                    value={q.correctAnswer}
                    onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)}
                    placeholder="Exact correct answer"
                  />
                </Field>
              ) : (
                <p className="text-xs text-muted-foreground">Descriptive answers will not be auto-scored.</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate("/courses/manage")}>
          Cancel
        </Button>
        <Button disabled={loading} type="submit" className="bg-brand text-brand-foreground">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editCourseId ? "Update Course" : "Create Course"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
