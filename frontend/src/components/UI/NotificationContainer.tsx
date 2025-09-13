import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { removeNotification } from '@/store/slices/uiSlice';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useEffect } from 'react';

const NotificationContainer: React.FC = () => {
  const notifications = useSelector((state: RootState) => state.ui.notifications);
  const dispatch = useDispatch();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-success-400" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-error-400" />;
      case 'warning':
        return <ExclamationCircleIcon className="w-5 h-5 text-warning-400" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-primary-400" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200 text-success-800';
      case 'error':
        return 'bg-error-50 border-error-200 text-error-800';
      case 'warning':
        return 'bg-warning-50 border-warning-200 text-warning-800';
      case 'info':
        return 'bg-primary-50 border-primary-200 text-primary-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => dispatch(removeNotification(notification.id))}
          getIcon={getIcon}
          getStyles={getStyles}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: any;
  onRemove: () => void;
  getIcon: (type: string) => JSX.Element;
  getStyles: (type: string) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
  getIcon,
  getStyles,
}) => {
  useEffect(() => {
    if (!notification.persistent && notification.duration !== 0) {
      const timer = setTimeout(() => {
        onRemove();
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, onRemove]);

  return (
    <div
      className={`
        max-w-sm w-full rounded-lg border p-4 shadow-lg transform transition-all duration-300 
        animate-slide-in-right ${getStyles(notification.type)}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon(notification.type)}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{notification.title}</h3>
          {notification.message && (
            <p className="mt-1 text-sm opacity-90">{notification.message}</p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onRemove}
            className="rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationContainer;