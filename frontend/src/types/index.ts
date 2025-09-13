// User and Authentication Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'staff';
  status: 'active' | 'inactive';
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
  message: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  status: 'active' | 'inactive' | 'draft';
  category_id: string;
  attributes: Record<string, any>;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  Category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  attributes: Record<string, any>;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id?: string;
  url: string;
  alt_text?: string;
  sort_order: number;
  created_at: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  sku: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  status: 'active' | 'inactive' | 'draft';
  category_id: string;
  attributes?: Record<string, any>;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  seo_title?: string;
  seo_description?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parent_id?: string;
  status: 'active' | 'inactive';
  sort_order: number;
  image_url?: string;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  children?: Category[];
  parent?: Category;
  product_count?: number;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parent_id?: string;
  status: 'active' | 'inactive';
  sort_order?: number;
  image_url?: string;
  seo_title?: string;
  seo_description?: string;
}

// Customer Types
export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  customer_group: 'regular' | 'vip' | 'wholesale' | 'new';
  status: 'active' | 'inactive' | 'blocked';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  preferences?: Record<string, any>;
  notes?: CustomerNote[];
  created_at: string;
  updated_at: string;
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  note: string;
  created_by: string;
  created_at: string;
  User?: User;
}

export interface CreateCustomerData {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  customer_group: 'regular' | 'vip' | 'wholesale' | 'new';
  status: 'active' | 'inactive' | 'blocked';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  preferences?: Record<string, any>;
}

// Order Types
export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  billing_address: Address;
  shipping_address: Address;
  notes?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  Customer?: Customer;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  Product?: Product;
  ProductVariant?: ProductVariant;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface CreateOrderData {
  customer_id: string;
  items: {
    product_id: string;
    variant_id?: string;
    quantity: number;
    unit_price: number;
  }[];
  billing_address: Address;
  shipping_address: Address;
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  notes?: string;
}

// Analytics Types
export interface DashboardData {
  overview: {
    totalProducts: number;
    totalCategories: number;
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    todayOrders: number;
    todayRevenue: number;
    monthlyRevenue: number;
    lowStockProducts: number;
    pendingOrders: number;
  };
  recentOrders: Order[];
  topProducts: {
    product_id: string;
    total_sold: number;
    total_revenue: number;
    Product: Product;
  }[];
}

export interface SalesAnalytics {
  dailySales: {
    date: string;
    order_count: number;
    revenue: number;
    avg_order_value: number;
  }[];
  salesByStatus: {
    status: string;
    count: number;
    revenue: number;
  }[];
  salesByPayment: {
    payment_method: string;
    count: number;
    revenue: number;
  }[];
  topCustomers: {
    customer_id: string;
    order_count: number;
    total_spent: number;
    Customer: Customer;
  }[];
}

export interface ProductAnalytics {
  bestSellers: {
    product_id: string;
    total_sold: number;
    revenue: number;
    order_frequency: number;
    Product: Product;
  }[];
  lowStockProducts: Product[];
  categoryPerformance: {
    total_sold: number;
    revenue: number;
    order_count: number;
    Product: {
      Category: Category;
    };
  }[];
  variantPerformance: ProductVariant[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: any;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string | number;
}

// UI State Types
export interface LoadingState {
  [key: string]: boolean;
}

export interface UIState {
  loading: LoadingState;
  sidebar: {
    isOpen: boolean;
    isMobile: boolean;
  };
  modals: {
    [key: string]: boolean;
  };
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

// Filter and Search Types
export interface FilterOptions {
  [key: string]: any;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export interface SearchParams {
  query?: string;
  filters?: FilterOptions;
  sort?: SortOptions;
  page?: number;
  limit?: number;
}

// File Upload Types
export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnails?: {
    small: string;
    medium: string;
    large: string;
  };
  created_at: string;
}

export interface FileUploadOptions {
  maxSize?: number;
  acceptedTypes?: string[];
  maxFiles?: number;
  generateThumbnails?: boolean;
}

// Socket Events
export interface SocketEvents {
  // Product events
  'product:created': Product;
  'product:updated': Product;
  'product:deleted': { id: string };
  'product:stock_low': { product: Product; stock: number };
  
  // Order events
  'order:created': Order;
  'order:updated': Order;
  'order:status_changed': { id: string; status: string; previous_status: string };
  
  // Customer events
  'customer:created': Customer;
  'customer:updated': Customer;
  
  // System events
  'system:notification': Notification;
  'system:maintenance': { message: string; start_time: string; duration: number };
}