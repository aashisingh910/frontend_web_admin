import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminCourseApi } from "@/services/courseApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

export default function AdminAssignCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading]                 = useState(false);
  const [assignmentMode, setAssignmentMode]   = useState("STORE");
  const [values, setValues]                   = useState("");
  const [dueDate, setDueDate]                 = useState("2026-07-31");
  const [mandatory, setMandatory]             = useState(true);
  const [remarks, setRemarks]                 = useState("");

  const getTarget = () => {
    const arr = values.split(",").map((v) => v.trim()).filter(Boolean);
    if (assignmentMode === "ALL_STAFF")           return { assignmentMode: "ALL_STAFF" };
    if (assignmentMode === "STORE")               return { assignmentMode: "STORE",               storeCodes: arr };
    if (assignmentMode === "MANAGER_TEAM")        return { assignmentMode: "MANAGER_TEAM",        managerIds: arr };
    if (assignmentMode === "DEPARTMENT")          return { assignmentMode: "DEPARTMENT",          departments: arr };
    if (assignmentMode === "SPECIFIC_EMPLOYEES")  return { assignmentMode: "SPECIFIC_EMPLOYEES",  employeeCodes: arr };
    if (assignmentMode === "ROLE")                return { assignmentMode: "ROLE",                roles: arr };
    return { assignmentMode: "STORE", storeCodes: arr };
  };

  const placeholder =
    assignmentMode === "STORE"               ? "6068, 6095, 6352" :
    assignmentMode === "MANAGER_TEAM"        ? "MGR6068, 338092" :
    assignmentMode === "DEPARTMENT"          ? "FURNITURE, HOMEWARE" :
    assignmentMode === "SPECIFIC_EMPLOYEES"  ? "RC000439, 700415" :
    assignmentMode === "ROLE"                ? "STAFF" :
    "Not required";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) { toast.error("Course ID missing"); return; }
    if (assignmentMode !== "ALL_STAFF" && !values.trim()) {
      toast.error("Assignment values are required");
      return;
    }
    setLoading(true);
    try {
      const result = await adminCourseApi.assign({
        courseId,
        target: getTarget(),
        dueDate: dueDate ? `${dueDate}T23:59:59.000Z` : null,
        mandatory,
        remarks,
      });
      toast.success(`Course assigned to ${result.assignedStaffCount} staff`);
      navigate("/courses/manage");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to assign course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 pb-8">
      <header>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Send className="h-5 w-5 text-brand" />
          Assign Course
        </h1>
        <p className="text-sm text-muted-foreground">
          Course ID: <b>{courseId}</b>
        </p>
      </header>

      <Card>
        <CardHeader><CardTitle className="text-base">Assignment Target</CardTitle></CardHeader>
        <CardContent className="space-y-4">

          <div className="space-y-2">
            <Label>Assignment Mode</Label>
            <select
              value={assignmentMode}
              onChange={(e) => setAssignmentMode(e.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="ALL_STAFF">All Staff</option>
              <option value="STORE">Store</option>
              <option value="MANAGER_TEAM">Manager Team</option>
              <option value="DEPARTMENT">Department</option>
              <option value="SPECIFIC_EMPLOYEES">Specific Employees</option>
              <option value="ROLE">Role</option>
            </select>
          </div>

          {assignmentMode !== "ALL_STAFF" && (
            <div className="space-y-2">
              <Label>Values (comma-separated)</Label>
              <Input
                value={values}
                onChange={(e) => setValues(e.target.value)}
                placeholder={placeholder}
              />
              <p className="text-xs text-muted-foreground">Example: {placeholder}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={mandatory}
              onChange={(e) => setMandatory(e.target.checked)}
            />
            Mandatory course
          </label>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="min-h-24 w-full rounded-md border bg-background p-3 text-sm"
              placeholder="Assigned for July sales training..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate("/courses/manage")}>
          Cancel
        </Button>
        <Button disabled={loading} type="submit" className="bg-brand text-brand-foreground">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Assign Course
        </Button>
      </div>
    </form>
  );
}
