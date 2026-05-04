import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import RegisterWithOTP from "./components/RegisterWithOTP";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import VerifyEmail from "./components/VerifyEmail";
import { DashboardProvider } from "./context/DashboardContext";
import LandingPage from './components/LandingPage';
import UserDashboard from './components/dashboard/user/UserDashboard';
import AdminDashboard from './components/dashboard/admin/AdminDashboard';
import SellerDashboard from './components/dashboard/seller/SellerDashboard';
import AuthLayout from './components/layouts/AuthLayout';
import Toast from './components/ui/Toast';

function AppContent() {
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingVerification, setPendingVerification] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Check authentication status on app load and route changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const savedCurrentUser = localStorage.getItem('currentUser');
      
      if (token && savedCurrentUser) {
        try {
          const user = JSON.parse(savedCurrentUser);
          setCurrentUser(user);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthChecked(true);
    };

    checkAuthStatus();
  }, [location]);

  const handleRegister = async (userData) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // If email verification is required
      if (data.requiresVerification) {
        setPendingVerification({
          email: userData.email,
          userId: data.userId,
          tempToken: data.tempToken
        });
        navigate("/verify-email");
        showToast('Registration successful! Please verify your email.', 'success');
      } else {
        // If no verification needed
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setCurrentUser(data.user);
        
        // Redirect to appropriate dashboard
        const redirectPath = getDashboardPath(data.user.role);
        navigate(redirectPath);
        showToast('Registration successful!', 'success');
      }
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userCredentials) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userCredentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (!data.token) {
        throw new Error('No token received from server');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setCurrentUser(data.user);
      
      // Redirect to appropriate dashboard
      const redirectPath = getDashboardPath(data.user.role);
      navigate(redirectPath);
      showToast('Login successful!', 'success');
    } catch (error) {
      showToast(error.message);
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate("/");
    // showToast('Logged out successfully', 'success');
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: pendingVerification.email,
          userId: pendingVerification.userId 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      showToast('Verification email sent!', 'success');
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    setCurrentUser(data.user);
    setPendingVerification(null);
    
    const redirectPath = getDashboardPath(data.user.role);
    navigate(redirectPath);
    showToast('Email verified successfully! Welcome to your dashboard.', 'success');
  };

  // Helper function to get dashboard path based on role
  const getDashboardPath = (role) => {
    switch (role) {
      case "admin": return "/admin";
      case "seller": return "/seller";
      case "user": return "/user";
      default: return "/";
    }
  };

  // Protected Route component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    return children;
  };

  // Public Route component (redirect if already logged in)
  const PublicRoute = ({ children }) => {
    if (currentUser) {
      const redirectPath = getDashboardPath(currentUser.role);
      return <Navigate to={redirectPath} replace />;
    }
    return children;
  };

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="w-8 h-8 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="text-surface-700 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardProvider>
      <Toast notification={notification} onClose={() => setNotification(null)} />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex items-center gap-4 animate-scale-in">
            <div className="w-8 h-8 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-surface-900 font-semibold">Please wait...</p>
          </div>
        </div>
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
            <AuthLayout>
              <Login onLogin={handleLogin} />
            </AuthLayout>
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <AuthLayout>
              <RegisterWithOTP onRegister={handleRegister} />
            </AuthLayout>
          </PublicRoute>
        } />
        
        <Route path="/forgot-password" element={
          <PublicRoute>
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          </PublicRoute>
        } />

        <Route path="/verify-email" element={
          <PublicRoute>
            <AuthLayout>
              <VerifyEmail 
                userEmail={pendingVerification?.email} 
                onVerificationComplete={handleVerificationComplete}
                onResendEmail={handleResendVerification}
                tempToken={pendingVerification?.tempToken}
              />
            </AuthLayout>
          </PublicRoute>
        } />

        {/* Protected Dashboard Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        
        <Route path="/seller/*" element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        
        <Route path="/user/*" element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* Utility Routes */}
        <Route path="/unauthorized" element={
          <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full animate-scale-in">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-surface-900 mb-2 tracking-tight">Access Denied</h2>
              <p className="text-surface-500 mb-8">You don't have permission to view this page.</p>
              <button 
                onClick={() => navigate("/")}
                className="w-full bg-surface-900 hover:bg-surface-800 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-200"
              >
                Return to Home
              </button>
            </div>
          </div>
        } />

        {/* 404 Route */}
        <Route path="*" element={
          <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full animate-scale-in">
              <h2 className="text-4xl font-black text-surface-200 mb-2">404</h2>
              <h3 className="text-xl font-bold text-surface-900 mb-2">Page not found</h3>
              <p className="text-surface-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
              <button 
                onClick={() => navigate("/")}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-200"
              >
                Return to Home
              </button>
            </div>
          </div>
        } />
      </Routes>
    </DashboardProvider>
  );
}

// Main App component with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;