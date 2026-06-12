import { useEffect, useState } from "react";
import { staffWorkspaceApi } from "@/services/staffWorkspaceApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function StaffNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    staffWorkspaceApi.notices()
      .then(setNotices)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load notices"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand" /> My Notices
        </h1>
        <p className="text-sm text-muted-foreground">Notices relevant to your store and role.</p>
      </header>

      <div className="space-y-3">
        {notices.map((notice) => (
          <Card key={notice.noticeId || notice._id}>
            <CardHeader>
              <div className="flex justify-between gap-3">
                <CardTitle className="text-base">{notice.noticeTitle}</CardTitle>
                <Badge variant="outline">{notice.priority || "NORMAL"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="text-xs text-muted-foreground">
                {notice.noticeNumber} ·{" "}
                {notice.noticeDate
                  ? new Date(notice.noticeDate).toLocaleDateString("en-IN")
                  : ""}
              </div>
              <p>{notice.content?.description}</p>
              {notice.content?.paragraph1 && (
                <p className="text-muted-foreground">{notice.content.paragraph1}</p>
              )}
              {notice.content?.paragraph2 && (
                <p className="text-muted-foreground">{notice.content.paragraph2}</p>
              )}
              {notice.content?.importantInstructions?.length > 0 && (
                <ul className="list-disc pl-5 text-muted-foreground">
                  {notice.content.importantInstructions.map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!notices.length && (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No active notices found.
          </CardContent>
        </Card>
      )}
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
