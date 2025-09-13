import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Category, CreateCategoryData, PaginatedResponse } from '@/types';

interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  currentCategory: null,
  total: 0,
  isLoading: false,
  error: null,
};

// Basic async thunks (will be implemented with actual API calls)
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    // Placeholder - will implement actual API call
    return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.isLoading = false;
        state.error = 'Failed to fetch categories';
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;