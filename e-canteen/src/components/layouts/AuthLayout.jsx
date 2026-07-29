import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Clock3, MapPin, Sparkles, Utensils } from 'lucide-react';

const pageCopy = {
  '/login': {
    eyebrow: 'Welcome back',
    title: 'Good food is only a few taps away.',
    body: 'Sign in, choose your favourites, and collect your meal without waiting in the canteen queue.'
  },
  '/register': {
    eyebrow: 'Join the community',
    title: 'Make every campus break taste better.',
    body: 'Create your account to discover today’s menu, order ahead, and know exactly when your meal is ready.'
  },
  '/forgot-password': {
    eyebrow: 'Account recovery',
    title: 'We’ll get you back to your next meal.',
    body: 'Verify your campus email and set a new password in three quick, secure steps.'
  },
  '/verify-email': {
    eyebrow: 'Almost there',
    title: 'Confirm your email. Unlock the canteen.',
    body: 'One quick verification keeps your account safe and your orders connected to you.'
  }
};

export default function AuthLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const copy = pageCopy[location.pathname] || pageCopy['/login'];
  const isLogin = location.pathname === '/login';
  const isRegister = location.pathname === '/register';
  const isRecovery = ['/forgot-password', '/verify-email'].includes(location.pathname);

  return (
    <main className="min-h-screen bg-[#f7f5f0] lg:grid lg:grid-cols-[minmax(420px,0.9fr)_minmax(520px,1.1fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#17211b] p-10 text-white lg:flex lg:flex-col xl:p-14">
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.35) 1px, transparent 0)',
          backgroundSize: '30px 30px'
        }} />
        <div className="pointer-events-none absolute -right-40 -top-36 h-[460px] w-[460px] rounded-full bg-[#ef6a3a]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-36 h-[420px] w-[420px] rounded-full bg-[#e6b85c]/20 blur-3xl" />

        <button onClick={() => navigate('/')} className="relative z-10 flex w-fit items-center gap-3 rounded-full focus-ring">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f36f3d] shadow-lg shadow-black/20">
            <Utensils className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">Campus Canteen</span>
        </button>

        <div className="relative z-10 my-auto max-w-xl py-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#ffd998]">
            <Sparkles className="h-3.5 w-3.5" /> {copy.eyebrow}
          </div>
          <h1 className="max-w-lg text-5xl font-black leading-[1.04] tracking-[-0.045em] xl:text-6xl">{copy.title}</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-white/65">{copy.body}</p>

          <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Today’s pick</p>
                <p className="mt-1 text-lg font-bold">Masala dosa combo</p>
              </div>
              <span className="rounded-full bg-[#f36f3d] px-3 py-1.5 text-sm font-black">₹75</span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4 text-sm">
              <div className="rounded-2xl bg-black/15 p-3"><Clock3 className="mb-2 h-4 w-4 text-[#ffd998]" /><b>12 min</b><span className="mt-0.5 block text-xs text-white/45">Ready in</span></div>
              <div className="rounded-2xl bg-black/15 p-3"><MapPin className="mb-2 h-4 w-4 text-[#ffd998]" /><b>Block A</b><span className="mt-0.5 block text-xs text-white/45">Pickup</span></div>
              <div className="rounded-2xl bg-black/15 p-3"><Check className="mb-2 h-4 w-4 text-[#ffd998]" /><b>Fresh</b><span className="mt-0.5 block text-xs text-white/45">Made now</span></div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs font-medium text-white/35">Built for busy campus days.</p>
      </section>

      <section className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#17211b] text-white"><Utensils className="h-4.5 w-4.5" /></span>
            <span className="font-extrabold tracking-tight text-[#17211b]">Campus Canteen</span>
          </button>
          <button onClick={() => navigate('/')} className="ml-auto inline-flex items-center gap-2 rounded-full border border-[#ded9cf] bg-white/70 px-4 py-2 text-sm font-bold text-[#536158] transition hover:border-[#bdb6a9] hover:bg-white focus-ring">
            <ArrowLeft className="h-4 w-4" /> Back home
          </button>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 pt-4 sm:px-8 lg:px-12">
          <div className="w-full max-w-[470px] rounded-[30px] border border-[#e5e0d7] bg-white p-6 shadow-[0_24px_80px_rgba(42,37,28,0.09)] sm:p-9">
            {children}

            <div className="mt-8 border-t border-[#eeeae2] pt-6 text-center text-sm text-[#6d766f]">
              {isLogin && <>New to Campus Canteen? <button onClick={() => navigate('/register')} className="font-extrabold text-[#d9562d] hover:text-[#b9411e]">Create an account</button></>}
              {isRegister && <>Already have an account? <button onClick={() => navigate('/login')} className="font-extrabold text-[#d9562d] hover:text-[#b9411e]">Sign in</button></>}
              {isRecovery && <button onClick={() => navigate('/login')} className="inline-flex items-center gap-1.5 font-extrabold text-[#d9562d] hover:text-[#b9411e]"><ArrowLeft className="h-4 w-4" /> Back to sign in</button>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
