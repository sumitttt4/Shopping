import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, Notification, LoadingState } from '@/types';

const initialState: UIState = {
  loading: {},
  sidebar: {
    isOpen: true,
    isMobile: false,
  },
  modals: {},
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.isLoading;
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loading[action.payload];
    },
    clearAllLoading: (state) => {
      state.loading = {};
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload;
    },
    setSidebarMobile: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isMobile = action.payload;
    },

    // Modals
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    toggleModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = !state.modals[action.payload];
    },
    closeAllModals: (state) => {
      state.modals = {};
    },

    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.persistent = false;
      }
    },

    // Bulk UI operations
    resetUI: (state) => {
      state.loading = {};
      state.modals = {};
      state.notifications = [];
      // Keep sidebar state as user preference
    },
  },
});

export const {
  setLoading,
  clearLoading,
  clearAllLoading,
  toggleSidebar,
  setSidebarOpen,
  setSidebarMobile,
  openModal,
  closeModal,
  toggleModal,
  closeAllModals,
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationAsRead,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectIsLoading = (state: { ui: UIState }, key: string): boolean => {
  return state.ui.loading[key] || false;
};

export const selectAnyLoading = (state: { ui: UIState }): boolean => {
  return Object.values(state.ui.loading).some(Boolean);
};

export const selectIsModalOpen = (state: { ui: UIState }, modalKey: string): boolean => {
  return state.ui.modals[modalKey] || false;
};

export const selectNotifications = (state: { ui: UIState }): Notification[] => {
  return state.ui.notifications;
};

export const selectUnreadNotifications = (state: { ui: UIState }): Notification[] => {
  return state.ui.notifications.filter(n => n.persistent !== false);
};