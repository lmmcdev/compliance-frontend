import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated, account, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1>Compliance Management System</h1>
          
          {isAuthenticated && account && (
            <div className="user-info">
              <span>Welcome, {account.name}</span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {isAuthenticated && (
        <nav className="sidebar">
          <ul className="nav-menu">
            <li>
              <Link 
                to="/dashboard" 
                className={isActive('/dashboard') ? 'active' : ''}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/licenses" 
                className={isActive('/licenses') ? 'active' : ''}
              >
                License Management
              </Link>
            </li>
            <li>
              <Link 
                to="/upload" 
                className={isActive('/upload') ? 'active' : ''}
              >
                Upload License
              </Link>
            </li>
            <li>
              <Link 
                to="/compliance" 
                className={isActive('/compliance') ? 'active' : ''}
              >
                Compliance Cases
              </Link>
            </li>
          </ul>
        </nav>
      )}

      <main className={isAuthenticated ? 'main-content' : 'main-content-full'}>
        {children}
      </main>
    </div>
  );
};

export default Layout;