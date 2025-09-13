import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DashboardData, SalesAnalytics, ProductAnalytics } from '@/types';

interface AnalyticsState {
  dashboardData: DashboardData | null;
  salesAnalytics: SalesAnalytics | null;
  productAnalytics: ProductAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  dashboardData: null,
  salesAnalytics: null,
  productAnalytics: null,
  isLoading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  'analytics/fetchDashboardData',
  async () => {
    // Placeholder
    return null;
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state) => {
        state.isLoading = false;
        state.error = 'Failed to fetch dashboard data';
      });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;