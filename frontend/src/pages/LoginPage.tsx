import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '@/store/slices/authSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { AppDispatch } from '@/store';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await dispatch(login({ email, password }));
      
      if (login.fulfilled.match(result)) {
        dispatch(addNotification({
          type: 'success',
          title: 'Login Successful',
          message: 'Welcome back to the admin panel!'
        }));
        navigate('/dashboard');
      } else {
        dispatch(addNotification({
          type: 'error',
          title: 'Login Failed',
          message: result.payload as string || 'Please check your credentials'
        }));
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Login Error',
        message: 'An unexpected error occurred'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Admin Panel Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              E-commerce Management System
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner w-4 h-4 mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <p><strong>Email:</strong> admin@example.com</p>
              <p><strong>Password:</strong> password123</p>
              <p className="mt-1 text-xs text-gray-500">
                Use these credentials to access the admin panel
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;