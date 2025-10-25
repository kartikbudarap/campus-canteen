import React, { useState, useEffect } from "react";
import { ChefHat, ShoppingBag, User, LogOut, LogIn, UserPlus, AlertCircle } from "lucide-react";
import AdminDashboard from "./components/adminDashboard";
import SellerDashboard from "./components/sellerDashboard";
import UserDashboard from "./components/userDashboard";
import Register from "./components/register";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import VerifyEmail from "./components/VerifyEmail";
import RegisterWithOTP from "./components/RegisterWithOTP";
import { DashboardProvider } from "./context/DashboardContext";
import LandingPage from './components/LandingPage';

function App() {
  const [users, setUsers] = useState([]);
  const [mode, setMode] = useState("landing"); // Changed from "login" to "landing"
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // login, register, forgotPassword, verifyEmail
  const [pendingVerification, setPendingVerification] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);

  const showToast = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const savedCurrentUser = localStorage.getItem('currentUser');
      
      console.log('Auth check - Token exists:', !!token, 'User exists:', !!savedCurrentUser);
      
      if (token && savedCurrentUser) {
        try {
          const user = JSON.parse(savedCurrentUser);
          setCurrentUser(user);
          setMode("dashboard");
          console.log('User authenticated:', user.role);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          setMode("landing");
        }
      } else {
        setMode("landing");
      }
      setAuthChecked(true);
    };

    checkAuthStatus();
  }, []);

  const handleRegister = async (userData) => {
    try {
      setLoading(true);
      console.log('Registering user:', userData);
      
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
          tempToken: data.tempToken // Store the temp token
        });
        setAuthMode("verifyEmail");
        showToast('Registration successful! Please verify your email.', 'success');
      } else {
        // If no verification needed (for testing)
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setMode("dashboard");
        showToast('Registration successful!', 'success');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userCredentials) => {
    try {
      setLoading(true);
      console.log('Logging in with:', userCredentials);
      
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

      // ✅ FIX: Verify token exists before storing
      if (!data.token) {
        throw new Error('No token received from server');
      }

      console.log('Login successful, token received:', data.token ? 'YES' : 'NO');
      console.log('User data:', data.user);

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      setCurrentUser(data.user);
      setMode("dashboard");
      showToast('Login successful!', 'success');
    } catch (error) {
      console.error('Login error:', error);
      showToast(error.message);
      // Clear any invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setLoading(true);
    console.log('Logging out...');
    
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setMode("landing"); // Changed from "login" to "landing"
    // showToast('Logged out successfully', 'success');
    setLoading(false);
  };

  // Add new handler functions
  const handleForgotPassword = () => {
    setAuthMode("forgotPassword");
  };

  const handleBackToLogin = () => {
    setAuthMode("login");
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
    // Store the real token and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    setCurrentUser(data.user);
    
    setPendingVerification(null);
    setAuthMode("login");
    setMode("dashboard");
    showToast('Email verified successfully! Welcome to your dashboard.', 'success');
  };

  // Navigation handlers
  const handleShowLogin = () => {
    setMode("auth");
    setAuthMode("login");
  };

  const handleShowRegister = () => {
    setMode("auth");
    setAuthMode("register");
  };

  const handleShowLanding = () => {
    setMode("landing");
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

  let dashboard;
  if (currentUser?.role === "admin") {
    dashboard = <AdminDashboard onLogout={handleLogout} />;
  } else if (currentUser?.role === "seller") {
    dashboard = <SellerDashboard onLogout={handleLogout} />;
  } else if (currentUser?.role === "user") {
    dashboard = <UserDashboard onLogout={handleLogout} />;
  }

  // Render auth components based on authMode
  const renderAuthComponent = () => {
    switch (authMode) {
      case "register":
        return (
          <RegisterWithOTP 
            onBackToLogin={() => setAuthMode("login")}
            onRegister={(data) => {
              // Store token and user data
              localStorage.setItem('token', data.token);
              localStorage.setItem('currentUser', JSON.stringify(data.user));
              setCurrentUser(data.user);
              setMode("dashboard");
              showToast('Registration successful!', 'success');
            }}
            initialData={registrationData}
          />
        );
      case "forgotPassword":
        return <ForgotPassword onBackToLogin={() => setAuthMode("login")} onLogin={handleLogin} />;
      case "verifyEmail":
        return (
          <VerifyEmail 
            userEmail={pendingVerification?.email} 
            onVerificationComplete={handleVerificationComplete}
            onResendEmail={handleResendVerification}
            tempToken={pendingVerification?.tempToken}
          />
        );
      case "login":
      default:
        return (
          <Login 
            onLogin={handleLogin} 
            onForgotPassword={() => setAuthMode("forgotPassword")} 
            onBackToLanding={handleShowLanding}
          />
        );
    }
  };

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

      {/* Render components based on mode */}
      {mode === "landing" && (
        <LandingPage 
          onShowLogin={handleShowLogin}
          onShowRegister={handleShowRegister}
        />
      )}

      {mode === "auth" && renderAuthComponent()}

      {mode === "dashboard" && currentUser && (
        <>
          {/* Dashboard Content */}
          {dashboard}
        </>
      )}
      
      {/* Auth Mode Switcher - Only show on auth pages */}
      {mode === "auth" && (
        <div className="fixed top-5 left-5 flex gap-3">
          <button
            onClick={() => setAuthMode("login")}
            disabled={loading}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 border ${
              authMode === "login" 
                ? "bg-red-500 text-white border-red-500 shadow-sm" 
                : "bg-white border-gray-300 text-gray-700 hover:border-red-300 hover:bg-red-50"
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <LogIn className="w-4 h-4 inline mr-2" />
            Login
          </button>
          <button
            onClick={() => setAuthMode("register")}
            disabled={loading}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 border ${
              authMode === "register" 
                ? "bg-red-500 text-white border-red-500 shadow-sm" 
                : "bg-white border-gray-300 text-gray-700 hover:border-red-300 hover:bg-red-50"
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Register
          </button>
          <button
            onClick={handleShowLanding}
            disabled={loading}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 border bg-white border-gray-300 text-gray-700 hover:border-red-300 hover:bg-red-50 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            ← Back to Home
          </button>
        </div>
      )}

      {/* Show back to home button on landing page when logged out */}
      {mode === "landing" && !currentUser && (
        <div className="fixed top-5 right-5 flex gap-3">
          {/* <button
            onClick={handleShowLogin}
            className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg"
          >
            <LogIn className="w-4 h-4 inline mr-2" />
            Login
          </button> */}
          {/* <button
            onClick={handleShowRegister}
            className="px-6 py-2 border border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Register
          </button> */}
        </div>
      )}
    </DashboardProvider>
  );
}

export default App;