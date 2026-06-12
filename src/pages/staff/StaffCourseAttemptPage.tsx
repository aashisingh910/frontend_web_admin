import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { staffWorkspaceApi } from "@/services/staffWorkspaceApi";
import { adminCourseApi } from "@/services/courseApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function StaffCourseAttemptPage() {
  const { progressId } = useParams<{ progressId: string }>();
  const navigate = useNavigate();

  const [progress, setProgress]     = useState<any>(null);
  const [course, setCourse]         = useState<any>(null);
  const [answers, setAnswers]       = useState<Record<string, string>>({});
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!progressId) return;
    setLoading(true);

    staffWorkspaceApi.courses()
      .then(async (result) => {
        const record = result.records?.find((c: any) => c.progressId === progressId);
        if (!record) throw new Error("Course progress not found");
        setProgress(record);

        const courseData = await adminCourseApi.getById(record.courseId);
        setCourse(courseData);

        const prev: Record<string, string> = {};
        record.answers?.forEach((a: any) => { prev[a.questionId] = a.submittedAnswer; });
        setAnswers(prev);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load course"))
      .finally(() => setLoading(false));
  }, [progressId]);

  const startCourse = async () => {
    if (!progressId) return;
    try {
      const updated = await staffWorkspaceApi.startCourse(progressId);
      setProgress(updated);
      toast.success("Course started");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start course");
    }
  };

  const submit = async () => {
    if (!progressId || !course) return;
    setSubmitting(true);
    const payload = course.questions.map((q: any) => ({
      questionId: q.questionId,
      answer: answers[q.questionId] || "",
    }));
    try {
      const result = await staffWorkspaceApi.submitCourse(progressId, payload);
      setProgress(result);
      if (result.score?.passed) toast.success("Course passed. Badge awarded.");
      else toast.error("Course submitted, but passing score was not achieved.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit course");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  if (!progress || !course) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">Course not found.</CardContent>
      </Card>
    );
  }

  const isCompleted = progress.status === "COMPLETED" || progress.status === "FAILED";

  return (
    <div className="space-y-6 pb-8">
      <header className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold">{course.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>
          </div>
          <Badge variant="outline">{progress.status}</Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">{course.category}</Badge>
          <Badge variant="outline">{course.level}</Badge>
          <Badge variant="outline">{course.estimatedMinutes} mins</Badge>
          <Badge variant="outline">Pass {course.passingScorePercent}%</Badge>
        </div>
      </header>

      <Card>
        <CardHeader><CardTitle className="text-base">Reading Material</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {course.readingContent}
          </p>
          {progress.status === "ASSIGNED" && (
            <Button onClick={startCourse} className="mt-4 bg-brand text-brand-foreground">
              Start Course
            </Button>
          )}
        </CardContent>
      </Card>

      {progress.status !== "ASSIGNED" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Assessment</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {course.questions.map((q: any, index: number) => (
              <div key={q.questionId} className="rounded-lg border p-4 space-y-3">
                <div className="font-medium text-sm">{index + 1}. {q.question}</div>

                {q.type === "MCQ" && (
                  <div className="space-y-2">
                    {q.options.map((option: string) => (
                      <label key={option} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name={q.questionId}
                          value={option}
                          disabled={isCompleted}
                          checked={answers[q.questionId] === option}
                          onChange={(e) => setAnswers({ ...answers, [q.questionId]: e.target.value })}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "TRUE_FALSE" && (
                  <div className="space-y-2">
                    {["true", "false"].map((option) => (
                      <label key={option} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name={q.questionId}
                          value={option}
                          disabled={isCompleted}
                          checked={answers[q.questionId] === option}
                          onChange={(e) => setAnswers({ ...answers, [q.questionId]: e.target.value })}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "DESCRIPTIVE" && (
                  <textarea
                    disabled={isCompleted}
                    value={answers[q.questionId] || ""}
                    onChange={(e) => setAnswers({ ...answers, [q.questionId]: e.target.value })}
                    className="min-h-24 w-full rounded-md border bg-background p-3 text-sm"
                    placeholder="Write your answer..."
                  />
                )}
              </div>
            ))}

            {!isCompleted && (
              <Button disabled={submitting} onClick={submit} className="bg-brand text-brand-foreground">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Course
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {isCompleted && (
        <Card>
          <CardHeader><CardTitle className="text-base">Result</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3 text-center">
              <ResultStat label="Score"  value={`${progress.score?.scorePercent || 0}%`} />
              <ResultStat label="Marks"  value={`${progress.score?.obtainedMarks || 0}/${progress.score?.totalMarks || 0}`} />
              <ResultStat label="Passed" value={progress.score?.passed ? "Yes" : "No"} />
            </div>
            {progress.badgeAwarded && (
              <div className="rounded-lg border p-4 flex items-center gap-3">
                <Trophy className="h-6 w-6 text-brand" />
                <div>
                  <div className="font-semibold">
                    {progress.awardedBadge?.badgeIcon} {progress.awardedBadge?.badgeName}
                  </div>
                  <div className="text-sm text-muted-foreground">{progress.awardedBadge?.description}</div>
                </div>
              </div>
            )}
            <Button variant="outline" onClick={() => navigate("/staff/courses")}>
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
