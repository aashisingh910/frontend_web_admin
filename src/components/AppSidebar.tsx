import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Users2, GraduationCap,
  Target, CalendarCheck, Megaphone, Award, LogOut, User,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { clearSession, type Session } from "@/lib/session";

type NavItem = { title: string; url: string; icon: typeof LayoutDashboard; roles: Session["role"][] };

const nav: NavItem[] = [
  // Admin + manager
  { title: "Dashboard",  url: "/dashboard",        icon: LayoutDashboard, roles: ["admin", "manager"] },
  { title: "People",     url: "/people",           icon: Users2,          roles: ["admin"] },
  { title: "Staff",      url: "/staff",            icon: Users,           roles: ["manager"] },
  { title: "Courses",    url: "/courses",          icon: GraduationCap,   roles: ["admin", "manager"] },
  { title: "Targets",    url: "/targets",          icon: Target,          roles: ["admin", "manager"] },
  { title: "Attendance", url: "/attendance",       icon: CalendarCheck,   roles: ["admin", "manager"] },
  { title: "Notices",    url: "/notices",          icon: Megaphone,       roles: ["admin", "manager"] },
  { title: "Incentives", url: "/incentives",       icon: Award,           roles: ["admin", "manager"] },
  // Staff workspace
  { title: "Dashboard",  url: "/staff/dashboard",  icon: LayoutDashboard, roles: ["staff"] },
  { title: "Courses",    url: "/staff/courses",    icon: GraduationCap,   roles: ["staff"] },
  { title: "Targets",    url: "/staff/targets",    icon: Target,          roles: ["staff"] },
  { title: "Attendance", url: "/staff/attendance", icon: CalendarCheck,   roles: ["staff"] },
  { title: "Notices",    url: "/staff/notices",    icon: Megaphone,       roles: ["staff"] },
  { title: "Incentives", url: "/staff/incentives", icon: Award,           roles: ["staff"] },
  { title: "Profile",    url: "/staff/profile",    icon: User,            roles: ["staff"] },
];

export function AppSidebar({ session }: { session: Session }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const items = nav.filter((i) => i.roles.includes(session.role));

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="px-2 py-2">
          {collapsed ? <Logo size={28} withWordmark={false} /> : <Logo size={32} />}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-2 py-2">
            <div className="text-xs text-sidebar-foreground/70">Signed in as</div>
            <div className="text-sm font-medium text-sidebar-foreground">{session.name}</div>
            <div className="text-[11px] uppercase tracking-wider text-brand">{session.role}</div>
            {session.role === "manager" && session.storeName && (
              <div className="mt-2 rounded-md bg-sidebar-accent px-2 py-1.5 text-xs">
                <div className="font-semibold truncate">{session.storeName}</div>
                <div className="text-sidebar-foreground/60">Store #{session.storeCode}</div>
              </div>
            )}
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Log out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
