import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const Layout: React.FC = () => {
  const { isOpen: sidebarOpen, isMobile } = useSelector((state: RootState) => state.ui.sidebar);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className={`${
        sidebarOpen && !isMobile ? 'lg:pl-64' : ''
      } transition-all duration-300`}>
        <Header />
        
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"></div>
      )}
    </div>
  );
};

export default Layout;