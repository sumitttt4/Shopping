import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Customer } from '@/types';

interface CustomerState {
  customers: Customer[];
  currentCustomer: Customer | null;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customers: [],
  currentCustomer: null,
  total: 0,
  isLoading: false,
  error: null,
};

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async () => {
    // Placeholder
    return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }
);

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchCustomers.rejected, (state) => {
        state.isLoading = false;
        state.error = 'Failed to fetch customers';
      });
  },
});

export const { clearError } = customerSlice.actions;
export default customerSlice.reducer;