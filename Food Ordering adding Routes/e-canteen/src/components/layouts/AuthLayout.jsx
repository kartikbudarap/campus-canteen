import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, ArrowLeft, Utensils, ShoppingBag, Users } from 'lucide-react';

export default function AuthLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isLogin = location.pathname === '/login';
  const isRegister = location.pathname === '/register';
  const isForgotPassword = location.pathname === '/forgot-password';
  const isVerifyEmail = location.pathname === '/verify-email';

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Left Panel — Brand / Illustration */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] shrink-0 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-500 to-orange-500" />

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full" />
          <div className="absolute top-1/3 -left-16 w-56 h-56 bg-white/5 rounded-full" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-white/5 rounded-full" />
        </div>

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full text-white">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Campus Canteen</span>
          </div>

          {/* Main Message */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl xl:text-[2.75rem] font-extrabold leading-tight tracking-tight">
                {isLogin && "Welcome back to your campus kitchen"}
                {isRegister && "Join the campus food revolution"}
                {isForgotPassword && "Don't worry, we've got you covered"}
                {isVerifyEmail && "One last step to get started"}
                {!isLogin && !isRegister && !isForgotPassword && !isVerifyEmail && "Your campus kitchen awaits"}
              </h2>
              <p className="text-white/80 text-lg leading-relaxed max-w-sm">
                {isLogin && "Skip the queue. Order from your room. Get hot meals delivered across campus in minutes."}
                {isRegister && "Create your account and start ordering from all campus canteens. No more waiting in lines!"}
                {isForgotPassword && "We'll help you reset your password and get back to ordering your favorite meals."}
                {isVerifyEmail && "Verify your email to unlock all features and start ordering right away."}
                {!isLogin && !isRegister && !isForgotPassword && !isVerifyEmail && "Fresh food, fast delivery, right to your door."}
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-3">
              {[
                { icon: ShoppingBag, text: "Order from multiple canteens" },
                { icon: Users, text: "1000+ students ordering daily" },
                { icon: ChefHat, text: "Fresh campus-made meals" },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-white/90">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/50 text-sm">
            © 2024 Campus Canteen. Made for students, by students.
          </p>
        </div>
      </div>

      {/* Right Panel — Auth Forms */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-surface-200 bg-white">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-surface-900">Campus Canteen</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
        </div>

        {/* Form Area */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-[420px] animate-fade-in-up">
            {children}

            {/* Auth Switch Links */}
            <div className="mt-8 text-center space-y-3">
              {(isLogin || isRegister) && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-surface-200" />
                  <span className="text-sm text-surface-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-surface-200" />
                </div>
              )}

              {isLogin && (
                <p className="text-surface-500 text-sm">
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
                  >
                    Create account
                  </button>
                </p>
              )}

              {isRegister && (
                <p className="text-surface-500 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              )}

              {(isForgotPassword || isVerifyEmail) && (
                <p className="text-surface-500 text-sm">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-brand-500 hover:text-brand-600 font-semibold transition-colors inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
