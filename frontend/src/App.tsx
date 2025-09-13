import { Routes, Route } from 'react-router-dom';

// Customer Components
import CustomerHomepage from './pages/Customer/Homepage';
import ProductCatalog from './pages/Customer/ProductCatalog';
import ProductDetail from './pages/Customer/ProductDetail';
import Cart from './pages/Customer/Cart';
import Checkout from './pages/Customer/Checkout';
import CustomerLogin from './pages/Customer/Login';
import CustomerRegister from './pages/Customer/Register';
import CustomerProfile from './pages/Customer/Profile';
import OrderSuccess from './pages/Customer/OrderSuccess';
import OrderTracking from './pages/Customer/OrderTracking';
import CustomerLayout from './components/Customer/Layout/CustomerLayout';

// Admin Components
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<CustomerHomepage />} />
          <Route path="products" element={<ProductCatalog />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<CustomerLogin />} />
          <Route path="register" element={<CustomerRegister />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="orders" element={<CustomerProfile />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="orders/:orderNumber" element={<OrderTracking />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;