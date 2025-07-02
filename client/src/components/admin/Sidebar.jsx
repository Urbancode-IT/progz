import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  UserPlus,
  Users,
  UserCheck,
  ClipboardCheck,
  CreditCard,
  Menu,
  X,
  ChevronLeft,
 RefreshCcw,
  ChevronRight
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/admin/overview" },
    { name: "Courses", icon: BookOpen, path: "/admin/all-courses" },
    { name: "Enroll Student", icon: UserPlus, path: "/admin/create-enrollment" },
    { name: "Instructors", icon: Users, path: "/admin/all-instructors" },
    { name: "Students", icon: UserCheck, path: "/admin/all-students" },
    { name: "Approve Users", icon: ClipboardCheck, path: "/admin/approve-users" },
    // { name: "Payments", icon: CreditCard, path: "/admin/payments" }
    
  ];

  return (
    <div 
      className={`h-screen bg-gradient-to-b from-gray-800  to-gray-800 border-l border-5 border-white text-white transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-64"} relative`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700">
        {!collapsed && (
          <span className="text-lg text-gray-400 font-semibold">
            Admin Portal
          </span>
        )}
        <button 
          onClick={toggleSidebar} 
          className={`p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors ${hovered ? 'opacity-100' : 'opacity-70'}`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex flex-col mt-2 p-2">
        {navItems.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 mx-1 rounded-lg transition-all ${
                isActive 
                  ? 'bg-blue-600/20 text-blue-100 border-l-4 border-blue-400' 
                  : 'hover:bg-gray-700/50 text-gray-300'
              }`
            }
          >
            <div className={`p-1.5 rounded-lg ${collapsed ? 'mx-auto' : ''} ${
              collapsed ? 'bg-gray-700/30' : 'bg-gray-700/20'
            }`}>
              <Icon size={18} className="flex-shrink-0" />
            </div>
            {!collapsed && (
              <span className="text-sm font-medium">{name}</span>
            )}
          </NavLink>
        ))}
      {/* sync zen Button */}
  <button
    onClick={() => {
      localStorage.removeItem('token');
      window.location.href = "/login"; // or use navigate("/login");
    }}
    className="flex items-center gap-3 px-3 py-3 mx-1 mt-2 rounded-lg hover:bg-gray-600/30 text-gray-300 transition-all"
  >
    <div className={`p-1.5 rounded-lg ${collapsed ? 'mx-auto' : ''} ${collapsed ? 'bg-gray-700/30' : 'bg-gray-700/20'}`}>
      <RefreshCcw size={18} className="flex-shrink-0" />
    </div>
    {!collapsed && (
      <span className="text-sm font-medium">Sync from Zen</span>
    )}
  </button>
        {/* Logout Button */}
  <button
    onClick={() => {
      localStorage.removeItem('token');
      window.location.href = "/login"; // or use navigate("/login");
    }}
    className="flex items-center gap-3 px-3 py-3 mx-1 mt-2 rounded-lg hover:bg-red-600/30 text-red-300 transition-all"
  >
    <div className={`p-1.5 rounded-lg ${collapsed ? 'mx-auto' : ''} ${collapsed ? 'bg-red-800/30' : 'bg-red-800/20'}`}>
      <X size={18} className="flex-shrink-0" />
    </div>
    {!collapsed && (
      <span className="text-sm font-medium">Logout</span>
    )}
  </button>
      </nav>
      
      {/* Sidebar footer */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 text-xs text-gray-400 border-t border-gray-700">
          <p>© {new Date().getFullYear()} UrbanCode</p>
          <p className="mt-1">v2.0.0</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;