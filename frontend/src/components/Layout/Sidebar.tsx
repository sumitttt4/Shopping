import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon,
  CubeIcon,
  TagIcon,
  ShoppingCartIcon,
  UsersIcon,
  ChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import { RootState, AppDispatch } from '@/store';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Categories', href: '/categories', icon: TagIcon },
  { name: 'Orders', href: '/orders', icon: ShoppingCartIcon },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
];

const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isOpen: sidebarOpen, isMobile } = useSelector((state: RootState) => state.ui.sidebar);

  return (
    <>
      {/* Desktop sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-900">E-Commerce</h2>
          </div>
          
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={() => dispatch(setSidebarOpen(false))}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>Version 1.0.0</p>
            <p>&copy; 2024 E-Commerce Admin</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;