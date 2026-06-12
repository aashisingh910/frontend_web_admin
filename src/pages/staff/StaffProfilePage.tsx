import { useEffect, useState } from "react";
import { staffWorkspaceApi } from "@/services/staffWorkspaceApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Store, UserCog, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function StaffProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    staffWorkspaceApi.profile()
      .then(setProfile)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-display font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">Staff, manager and store details assigned to you.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-brand" /> Staff Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
          <Row label="Employee Code"     value={profile.staff.employeeCode} />
          <Row label="Name"              value={profile.staff.name} />
          <Row label="Email"             value={profile.staff.email} />
          <Row label="Contact"           value={profile.staff.contactNumber || "-"} />
          <Row label="Designation"       value={profile.staff.designation || "-"} />
          <Row label="Department"        value={profile.staff.department || "-"} />
          <Row label="Weekly Off"        value={profile.staff.weeklyOff || "-"} />
          <Row label="Status"            value={profile.staff.status || "-"} />
          <Row label="Courses Completed" value={String(profile.staff.coursesCompleted || 0)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCog className="h-4 w-4 text-brand" /> Reporting Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
          <Row label="Manager Code"  value={profile.manager.employeeCode || "-"} />
          <Row label="Name"          value={profile.manager.name || "-"} />
          <Row label="Email"         value={profile.manager.email || "-"} />
          <Row label="Contact"       value={profile.manager.contactNumber || "-"} />
          <Row label="Designation"   value={profile.manager.designation || "Store Manager"} />
          <Row label="Department"    value={profile.manager.department || "OPERATIONS"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4 text-brand" /> Assigned Store
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
          <Row label="Store Code"    value={profile.store.storeCode || "-"} />
          <Row label="Store Name"    value={profile.store.storeName || "-"} />
          <Row label="City"          value={profile.store.city || "-"} />
          <Row label="State"         value={profile.store.state || "-"} />
          <Row label="Region"        value={profile.store.region || "-"} />
          <Row label="Zone"          value={profile.store.zone || "-"} />
          <Row label="Opening Time"  value={profile.store.openingTime || "-"} />
          <Row label="Closing Time"  value={profile.store.closingTime || "-"} />
          <Row label="Geofence"      value={`${profile.store.geofenceRadiusMeters || 0} meters`} />
          <Row label="Status"        value={profile.store.status || "-"} />
          <div className="md:col-span-2">
            <Row label="Address"     value={profile.store.address || "-"} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-brand" /> Badges
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {profile.staff.badges?.map((badge: any) => (
            <div
              key={`${badge.badgeId}-${badge.courseId}`}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <span className="mr-1">{badge.badgeIcon}</span>
              {badge.badgeName}
            </div>
          ))}
          {!profile.staff.badges?.length && (
            <div className="text-sm text-muted-foreground">No badges earned yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium break-all">{value}</span>
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
