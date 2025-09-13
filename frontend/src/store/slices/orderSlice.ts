import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Order } from '@/types';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  total: 0,
  isLoading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async () => {
    // Placeholder
    return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchOrders.rejected, (state) => {
        state.isLoading = false;
        state.error = 'Failed to fetch orders';
      });
  },
});

export const { clearError } = orderSlice.actions;
export default orderSlice.reducer;