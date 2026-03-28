import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ChefHat, ShoppingBag, User, LogOut, LogIn, UserPlus, AlertCircle } from "lucide-react";
// import AdminDashboard from "./components/adminDashboard";
// import SellerDashboard from "./components/sellerDashboard";
// import UserDashboard from "./components/userDashboard";
import RegisterWithOTP from "./components/RegisterWithOTP";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import VerifyEmail from "./components/VerifyEmail";
import { DashboardProvider } from "./context/DashboardContext";
import LandingPage from './components/LandingPage';
// In App.jsx, replace the direct imports with:
import UserDashboard from './components/dashboard/user/UserDashboard';
import AdminDashboard from './components/dashboard/admin/AdminDashboard';
import SellerDashboard from './components/dashboard/seller/SellerDashboard';

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
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
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
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
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
      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <p className="text-gray-700">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardProvider>
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-down border ${
          notification.type === "success" 
            ? "bg-green-500 text-white border-green-400" 
            : "bg-red-500 text-white border-red-400"
        }`}>
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm">{notification.type === "success" ? "✓" : "!"}</span>
          </div>
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <p className="text-gray-700">Loading...</p>
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
            <Login onLogin={handleLogin} />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <RegisterWithOTP onRegister={handleRegister} />
          </PublicRoute>
        } />
        
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />

        <Route path="/verify-email" element={
          <PublicRoute>
            <VerifyEmail 
              userEmail={pendingVerification?.email} 
              onVerificationComplete={handleVerificationComplete}
              onResendEmail={handleResendVerification}
              tempToken={pendingVerification?.tempToken}
            />
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
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized</h2>
              <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
              <button 
                onClick={() => navigate("/")}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-all duration-200"
              >
                Go Home
              </button>
            </div>
          </div>
        } />

        {/* 404 Route */}
        <Route path="*" element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
              <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
              <button 
                onClick={() => navigate("/")}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-all duration-200"
              >
                Go Home
              </button>
            </div>
          </div>
        } />
      </Routes>

      {/* Auth Navigation - Show on auth pages */}
      {(location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname === '/verify-email') && (
        <div className="fixed top-5 left-5 flex gap-3">
          {location.pathname !== '/login' && (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-xl font-medium transition-all duration-200 border bg-white border-gray-300 text-gray-700 hover:border-red-300 hover:bg-red-50"
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Login
            </button>
          )}
          {location.pathname !== '/register' && (
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 rounded-xl font-medium transition-all duration-200 border bg-white border-gray-300 text-gray-700 hover:border-red-300 hover:bg-red-50"
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Register
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl font-medium transition-all duration-200 border bg-white border-gray-300 text-gray-700 hover:border-red-300 hover:bg-red-50"
          >
            ← Back to Home
          </button>
        </div>
      )}
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