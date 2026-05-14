import { useEffect, useState } from "react";
import { Bell, ChevronDown, ChevronRight, Menu, School } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

import { NAVIGATION_BY_ROLE, ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/constants/navigation";
import { APP_ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

const defaultRootPaths = new Set([
  APP_ROUTES.home,
  APP_ROUTES.staffDashboard,
  APP_ROUTES.lecturerDashboard,
  APP_ROUTES.employeeDashboard,
  APP_ROUTES.studentDashboard,
]);

export const AppLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(APP_ROUTES.login);
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const menuItems = NAVIGATION_BY_ROLE[user.role];

  const isItemActive = (path: string) => {
    if (defaultRootPaths.has(path)) {
      return location.pathname === path;
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    logout();
    navigate(APP_ROUTES.login);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {isSidebarOpen && (
        <button
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-200 ease-in-out lg:transform-none
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="h-16 flex items-center px-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">CSMS</span>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">Scheduling System</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-gray-100">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE_CLASSES[user.role]}`}>
            {ROLE_LABELS[user.role]}
          </span>
          <p className="text-xs text-gray-400 mt-1.5 truncate">{user.department}</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <ul className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.path);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full" />
                    )}
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        active ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-white">
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight className="w-3 h-3 text-blue-300" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400">{user.code}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 leading-none">
                Hệ thống Quản lý Phòng học & Thời khóa biểu
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Học kỳ 1 — Năm học 2024-2025</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{user.name.charAt(0)}</span>
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-gray-900 leading-none">{user.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{ROLE_LABELS[user.role]}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-900">{user.name}</p>
                  <p className="text-[11px] text-gray-500">{user.email}</p>
                </div>
                <DropdownMenuItem>Hồ sơ cá nhân</DropdownMenuItem>
                <DropdownMenuItem>Đổi mật khẩu</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
