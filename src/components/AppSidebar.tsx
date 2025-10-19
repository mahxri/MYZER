import { LayoutDashboard, Receipt, TrendingUp, Settings, Moon, Sun, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Add Transactions', url: '/transactions', icon: Receipt },
  { title: 'Analytics', url: '/analytics', icon: TrendingUp },
];

export function AppSidebar() {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center">
            <span className="text-lg font-bold text-sidebar-primary-foreground">M¥</span>
          </div>
          <h1 className="text-xl font-bold text-sidebar-primary">MYƵER</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'hover:bg-sidebar-accent/50'
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-medium">{user?.username.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-sm font-medium">{user?.username}</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex-1"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={logout}
              className="flex-1"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
