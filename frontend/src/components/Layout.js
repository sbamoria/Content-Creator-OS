import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChartLine, Users, Envelope, VideoCamera, Folders, Plus, SignOut, ChartBar } from '@phosphor-icons/react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: ChartLine },
    { label: 'Landing Pages', path: '/builder', icon: Plus },
    { label: 'Leads', path: '/leads', icon: Users },
    { label: 'Segments', path: '/segments', icon: Folders },
    { label: 'Campaigns', path: '/campaigns', icon: Envelope },
    { label: 'Webinars', path: '/webinars', icon: VideoCamera },
    { label: 'Analytics', path: '/analytics', icon: ChartBar },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="flex min-h-screen bg-background-dashboard">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-surface-border fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-heading font-bold text-primary">MonetizeFlow</h1>
          <p className="text-xs text-zinc-500 mt-1">Creator Growth Platform</p>
        </div>

        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-surface-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-heading font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">{user?.name}</p>
              <p className="text-xs text-zinc-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            data-testid="logout-button"
            className="w-full flex items-center gap-2 px-4 py-2 rounded-full text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <SignOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
