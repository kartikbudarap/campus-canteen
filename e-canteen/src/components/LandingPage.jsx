import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, ChefHat, ChevronRight, Clock3, Menu, QrCode,
  ShieldCheck, ShoppingBag, Sparkles, Star, Store, TimerReset,
  TrendingUp, Utensils, X, Zap
} from 'lucide-react';

const FALLBACK_MENU = [
  { _id: '1', name: 'Masala Dosa', category: 'South Indian', price: 75, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=900&auto=format&fit=crop' },
  { _id: '2', name: 'Chicken Biryani', category: 'Main course', price: 145, image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=900&auto=format&fit=crop' },
  { _id: '3', name: 'Paneer Wrap', category: 'Quick bites', price: 90, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=900&auto=format&fit=crop' }
];

const money = (value) => `\u20B9${Number(value || 0).toLocaleString('en-IN')}`;

const steps = [
  { number: '01', icon: Store, outcome: 'Browse', title: 'Pick your meal', body: 'Browse what is actually available now, with clear prices and categories.' },
  { number: '02', icon: Zap, outcome: 'Pay securely', title: 'Order before the break', body: 'Pay securely and send the order directly to the canteen kitchen.' },
  { number: '03', icon: QrCode, outcome: 'Verify', title: 'Collect with your pass', body: 'Show the unique QR code or fallback PIN when your order is ready.' }
];

const benefits = [
  { icon: Clock3, title: 'Know exactly when to arrive', body: 'Follow every stage from accepted to preparing and ready for pickup.' },
  { icon: ShieldCheck, title: 'The right order, every time', body: 'Secure pickup verification protects both the student and the canteen.' },
  { icon: TrendingUp, title: 'A smarter canteen operation', body: 'Live demand, menu performance, and revenue insights help teams plan better.' }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuItems, setMenuItems] = useState(FALLBACK_MENU);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/food-items?available=true&limit=3`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => {
        const items = payload.data || payload;
        if (Array.isArray(items) && items.length) setMenuItems(items.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <main className="landing-premium min-h-screen overflow-x-hidden bg-[#f8f6f1] text-[#17211b]">
      <nav className="fixed inset-x-0 top-3 z-50 px-3 sm:px-5">
        <div className="relative mx-auto flex h-[68px] max-w-7xl items-center rounded-[1.35rem] border border-white/80 bg-[#fbfaf7]/90 px-3 shadow-[0_12px_40px_rgba(23,33,27,.10)] backdrop-blur-2xl sm:px-4">
          <button onClick={() => scrollTo('home')} className="flex items-center gap-3" aria-label="Campus Canteen home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20"><Utensils className="h-5 w-5" /></span>
            <span><span className="block text-[15px] font-black tracking-tight">Campus Canteen</span><span className="block text-[9px] font-black uppercase tracking-[.2em] text-slate-400">Order ahead</span></span>
          </button>
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-xl border border-[#e9e4dc] bg-[#f2efe9]/80 p-1 text-sm font-bold text-slate-500 md:flex">
            <button onClick={() => scrollTo('how')} className="rounded-lg px-4 py-2 transition hover:bg-white hover:text-[#17211b] hover:shadow-sm">How it works</button>
            <button onClick={() => scrollTo('menu')} className="rounded-lg px-4 py-2 transition hover:bg-white hover:text-[#17211b] hover:shadow-sm">Menu</button>
            <button onClick={() => scrollTo('why')} className="rounded-lg px-4 py-2 transition hover:bg-white hover:text-[#17211b] hover:shadow-sm">Why it works</button>
          </div>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <button onClick={() => navigate('/login')} className="rounded-xl px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-[#f2efe9] hover:text-[#17211b]">Sign in</button>
            <button onClick={() => navigate('/register')} className="group inline-flex items-center gap-2 rounded-xl bg-[#17211b] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#17211b]/15 transition hover:-translate-y-0.5 hover:bg-orange-500">Create account <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button>
          </div>
          <button onClick={() => setMobileOpen((open) => !open)} className="ml-auto rounded-xl border border-[#e4ded4] bg-white p-2.5 md:hidden" aria-label="Toggle navigation">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
        {mobileOpen && <div className="mx-auto mt-2 max-w-7xl rounded-[1.35rem] border border-white/80 bg-[#fbfaf7]/95 p-3 shadow-[0_18px_45px_rgba(23,33,27,.14)] backdrop-blur-2xl md:hidden"><div className="grid gap-1">{[['How it works', 'how'], ['Menu', 'menu'], ['Why it works', 'why']].map(([label, id]) => <button key={id} onClick={() => scrollTo(id)} className="rounded-xl px-4 py-3 text-left text-sm font-black hover:bg-[#f2efe9]">{label}</button>)}<div className="my-2 h-px bg-[#e8e2d8]" /><button onClick={() => navigate('/login')} className="rounded-xl border border-[#ddd7cd] bg-white py-3 text-sm font-black">Sign in</button><button onClick={() => navigate('/register')} className="rounded-xl bg-[#17211b] py-3 text-sm font-black text-white">Create account</button></div></div>}
      </nav>

      <section id="home" className="relative mx-4 mt-24 overflow-hidden rounded-[2rem] bg-[#17211b] pb-20 pt-16 text-white shadow-[0_32px_90px_rgba(23,33,27,.2)] sm:mx-6 sm:rounded-[2.5rem] sm:pb-24 sm:pt-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.07) 1px, transparent 0)', backgroundSize: '30px 30px' }}>
        <div className="absolute left-[-10rem] top-32 h-96 w-96 rounded-full bg-orange-500/25 blur-3xl" />
        <div className="absolute right-[-8rem] top-10 h-[32rem] w-[32rem] rounded-full bg-[#e6b85c]/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.02fr_.98fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-2 text-[11px] font-black uppercase tracking-[.16em] text-orange-700"><Sparkles className="h-3.5 w-3.5" /> Built for busy campus days</span>
            <h1 className="mt-7 max-w-3xl text-[3.4rem] font-black leading-[.95] tracking-[-.06em] !text-white sm:text-6xl lg:text-[4.6rem]">Good food.<br /><span className="text-orange-500">Zero queue.</span></h1>
            <p className="mt-7 max-w-xl text-lg font-medium leading-8 text-white/60">Choose lunch before the bell, watch the kitchen prepare it live, and collect securely the moment it is ready.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate('/register')} className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f36f3d] px-6 py-4 text-sm font-black text-white shadow-xl shadow-black/20 hover:bg-[#ff8456]">Order your next meal <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button>
              <button onClick={() => scrollTo('menu')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-sm font-black text-white shadow-sm backdrop-blur hover:bg-white/15">See today's menu <ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">{['No waiting in line', 'Secure pickup pass', 'Live order updates'].map((item) => <span key={item} className="flex items-center gap-2 text-xs font-bold text-white/50"><span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><Check className="h-3 w-3" /></span>{item}</span>)}</div>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem]">
            <div className="absolute -inset-5 rotate-2 rounded-[2.5rem] border border-white/10 bg-white/[.07] backdrop-blur" />
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-white text-[#17211b] shadow-2xl">
              <div className="relative h-64 overflow-hidden sm:h-72"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&auto=format&fit=crop" alt="Fresh canteen meal" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#17211b]/75 via-transparent to-transparent" /><div className="absolute bottom-5 left-5 text-white"><p className="text-xs font-bold text-white/65">Today's popular meal</p><p className="mt-1 text-2xl font-black">Fresh campus lunch</p></div><span className="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-emerald-700 backdrop-blur">Available now</span></div>
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between"><div><p className="text-xs font-bold text-slate-400">Order #CC-2048</p><p className="mt-1 text-lg font-black">Ready in 15 minutes</p></div><span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-orange-600"><ChefHat className="h-5 w-5" /></span></div>
                <div className="mt-5 grid grid-cols-4 gap-2">{[['Placed', true], ['Accepted', true], ['Preparing', true], ['Ready', false]].map(([label, active]) => <div key={label}><div className={`h-1.5 rounded-full ${active ? 'bg-orange-500' : 'bg-slate-100'}`} /><p className={`mt-2 text-[9px] font-black uppercase tracking-wider ${active ? 'text-orange-600' : 'text-slate-300'}`}>{label}</p></div>)}</div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-white bg-white p-4 shadow-xl sm:-left-8"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><QrCode className="h-5 w-5" /></span><div><p className="text-xs font-bold text-slate-400">Secure collection</p><p className="text-sm font-black">QR + pickup PIN</p></div></div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e6e0d7] bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-[#ece7df] px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          {[['15 min', 'average pickup'], ['98%', 'successful collections'], ['4.8 / 5', 'student experience']].map(([value, label]) => <div key={label} className="py-7 text-center"><p className="text-2xl font-black tracking-[-.04em]">{value}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[.16em] text-slate-400">{label}</p></div>)}
        </div>
      </section>

      <section id="how" className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[.78fr_1.22fr] lg:items-center lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-orange-700"><Sparkles className="h-3.5 w-3.5" /> One simple workflow</span>
            <h2 className="mt-5 max-w-lg text-4xl font-black leading-[1.02] tracking-[-.05em] sm:text-5xl">Lunch ordering that feels effortless.</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-500">Browse the live menu, place your order, and collect it with a secure pass—all from one clean workspace.</p>
            <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#e4ded4] bg-white p-4"><Clock3 className="h-5 w-5 text-orange-600" /><p className="mt-4 text-2xl font-black tracking-[-.04em]">15 min</p><p className="mt-1 text-xs font-bold text-slate-400">Average pickup</p></div>
              <div className="rounded-2xl border border-[#e4ded4] bg-white p-4"><ShieldCheck className="h-5 w-5 text-emerald-600" /><p className="mt-4 text-2xl font-black tracking-[-.04em]">Secure</p><p className="mt-1 text-xs font-bold text-slate-400">QR or PIN pass</p></div>
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-[#ded8ce] bg-white shadow-[0_28px_80px_rgba(31,38,33,.12)]">
            <div className="flex items-center justify-between border-b border-[#ebe6de] bg-[#fbfaf7] px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#17211b] text-white"><ShoppingBag className="h-4 w-4" /></span><div><p className="text-sm font-black">Order journey</p><p className="text-[10px] font-bold text-slate-400">Order #CC-2048</p></div></div><span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-orange-700"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" /> In progress</span></div>
            <div className="p-5 sm:p-6">
              <div className="mb-6 grid grid-cols-3 gap-2">{['Menu', 'Payment', 'Pickup'].map((label, index) => <div key={label}><div className={`h-1.5 rounded-full ${index < 2 ? 'bg-orange-500' : 'bg-[#e9e4dc]'}`} /><p className={`mt-2 text-[9px] font-black uppercase tracking-[.12em] ${index < 2 ? 'text-orange-600' : 'text-slate-300'}`}>{label}</p></div>)}</div>
              <div className="space-y-2">{steps.map(({ number, icon, outcome, title, body }, index) => <article key={number} className={`grid grid-cols-[2.75rem_1fr] items-center gap-3 rounded-2xl border p-3.5 sm:grid-cols-[3rem_1fr_auto] sm:gap-4 sm:p-4 ${index === 1 ? 'border-orange-200 bg-orange-50/55' : 'border-[#ebe6de] bg-white'}`}><span className={`grid h-11 w-11 place-items-center rounded-xl ${index === 1 ? 'bg-orange-500 text-white' : index === 2 ? 'bg-[#f1eee8] text-[#17211b]' : 'bg-[#17211b] text-white'}`}>{React.createElement(icon, { className: 'h-5 w-5' })}</span><div><div className="flex items-center gap-2"><p className="text-[9px] font-black uppercase tracking-[.16em] text-slate-400">Step {number}</p>{index === 1 && <span className="rounded-full bg-white px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-orange-700">Current</span>}</div><h3 className="mt-1 text-sm font-black sm:text-base">{title}</h3><p className="mt-1 hidden text-xs leading-5 text-slate-400 sm:block">{body}</p></div><span className={`col-start-2 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider sm:col-start-auto ${index === 0 ? 'bg-emerald-50 text-emerald-700' : index === 1 ? 'bg-orange-100 text-orange-700' : 'bg-[#f3f0eb] text-slate-500'}`}>{index === 0 ? <Check className="h-3 w-3" /> : index === 1 ? <Clock3 className="h-3 w-3" /> : <QrCode className="h-3 w-3" />}{index === 0 ? 'Complete' : index === 1 ? 'Preparing' : outcome}</span></article>)}</div>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#17211b] px-4 py-3.5 text-white"><div><p className="text-[10px] font-bold text-white/45">Estimated pickup</p><p className="mt-0.5 text-sm font-black text-white">Today, 1:15 PM</p></div><span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black text-[#ffd998]">15 min</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="border-y border-[#e6e0d7] bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-600">From today's kitchen</p><h2 className="mt-4 text-4xl font-black tracking-[-.05em] sm:text-5xl">Popular right now.</h2><p className="mt-4 max-w-xl text-base leading-7 text-slate-500">Fresh campus favourites, prepared after you order and ready around your schedule.</p></div><button onClick={() => navigate('/register')} className="group inline-flex w-fit items-center gap-2 rounded-xl border border-[#ded8ce] bg-[#fbfaf7] px-5 py-3 text-sm font-black text-[#17211b] transition hover:border-[#17211b] hover:bg-[#17211b] hover:text-white">Explore full menu <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" /></button></div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">{menuItems.map((item, index) => <article key={item._id || item.id} className="group overflow-hidden rounded-[1.75rem] border border-[#e4ded4] bg-[#fbfaf7] shadow-[0_18px_50px_rgba(31,38,33,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(31,38,33,.12)]"><div className="relative overflow-hidden"><img src={item.image || FALLBACK_MENU[0].image} alt={item.name} className="aspect-[5/3] w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" /><span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#17211b] shadow-sm backdrop-blur">{item.category}</span><span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-[#17211b]/80 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur"><Clock3 className="h-3 w-3 text-[#ffd998]" /> Ready in 15 min</span>{index === 0 && <span className="absolute right-4 top-4 rounded-full bg-orange-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">Most ordered</span>}</div><div className="p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-black tracking-[-.025em]">{item.name}</h3><p className="mt-2 flex items-center gap-1 text-xs font-black text-amber-500"><Star className="h-3.5 w-3.5 fill-current" /> 4.8 <span className="font-bold text-slate-400">student rating</span></p></div><span className="whitespace-nowrap text-xl font-black text-orange-600">{money(item.price)}</span></div><button onClick={() => navigate('/register')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#17211b] py-3.5 text-sm font-black text-white transition hover:bg-orange-500"><ShoppingBag className="h-4 w-4" /> Order after sign up</button></div></article>)}</div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-bold text-slate-400"><span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Live availability</span><span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Secure collection</span><span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> No counter queue</span></div>
        </div>
      </section>

      <section id="why" className="py-24 sm:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[.92fr_1.08fr]">
          <div className="relative overflow-hidden rounded-[2.25rem] bg-[#17211b] p-7 text-white sm:p-9">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-orange-500/25 blur-3xl" />
            <div className="relative"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500"><QrCode className="h-6 w-6" /></span><p className="mt-8 text-xs font-black uppercase tracking-[.18em] text-orange-300">Secure pickup built in</p><h2 className="mt-4 text-4xl font-black tracking-[-.045em] !text-white">Only the right student gets the order.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-white/55">Every ready order receives a short-lived QR pass and six-digit fallback PIN. Counter staff verify it before the order can be completed.</p><div className="mt-8 rounded-2xl bg-white/10 p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-white/45">Pickup PIN</p><p className="mt-1 font-mono text-3xl font-black tracking-[.22em]">482 915</p></div><ShieldCheck className="h-8 w-8 text-emerald-400" /></div><p className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-300"><Check className="h-4 w-4" /> One-time verification active</p></div></div>
          </div>
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-600">Better for everyone</p><h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">A smoother break. A smarter kitchen.</h2><div className="mt-8 space-y-4">{benefits.map(({ icon, title, body }) => <article key={title} className="flex gap-4 rounded-2xl border border-[#e6e0d7] bg-white p-5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">{React.createElement(icon, { className: 'h-5 w-5' })}</span><div><h3 className="font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{body}</p></div></article>)}</div></div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[2.5rem] bg-[#17211b] px-6 py-12 text-white shadow-[0_28px_70px_rgba(23,33,27,.18)] sm:px-12 sm:py-14 lg:grid-cols-[1fr_.72fr] lg:items-center lg:gap-16" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.07) 1px, transparent 0)', backgroundSize: '28px 28px' }}>
          <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-orange-500/25 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-[10px] font-black uppercase tracking-[.18em] text-[#ffd998]"><TimerReset className="h-3.5 w-3.5" /> Skip the lunch rush</span>
            <h2 className="mt-6 max-w-2xl text-4xl font-black leading-[1.02] tracking-[-.045em] !text-white sm:text-5xl">Your next lunch break can be <span className="text-[#f36f3d]">queue-free.</span></h2>
            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-white/60">Order before the bell, follow preparation live, and collect your meal securely when it is ready.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate('/register')} className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f36f3d] px-7 py-4 text-sm font-black text-white shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#ff8456]">Create your account <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button>
              <button onClick={() => navigate('/login')} className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-7 py-4 text-sm font-black text-white backdrop-blur transition hover:bg-white/15">Already a member? Sign in</button>
            </div>
          </div>
          <div className="relative mt-10 rounded-[1.75rem] border border-white/10 bg-white/[.08] p-5 backdrop-blur-xl lg:mt-0">
            <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/45">Pickup preview</p><p className="mt-1 font-black text-white">Lunch order #C24</p></div><span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">Ready soon</span></div>
            <div className="grid grid-cols-2 gap-3 py-5"><div className="rounded-2xl bg-white/[.07] p-4"><Clock3 className="h-5 w-5 text-[#ffd998]" /><p className="mt-4 text-xs font-bold text-white/45">Pickup in</p><p className="mt-1 text-xl font-black text-white">15 min</p></div><div className="rounded-2xl bg-white/[.07] p-4"><QrCode className="h-5 w-5 text-[#f36f3d]" /><p className="mt-4 text-xs font-bold text-white/45">Collection</p><p className="mt-1 text-xl font-black text-white">QR secure</p></div></div>
            <div className="flex items-center gap-3 rounded-2xl bg-[#ffd998] px-4 py-3 text-[#17211b]"><ShieldCheck className="h-5 w-5 shrink-0" /><p className="text-xs font-black">Only you can collect your order.</p></div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e6e0d7] bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm text-slate-400 sm:flex-row sm:px-8"><div className="flex items-center gap-2 font-black text-[#17211b]"><span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-500 text-white"><Utensils className="h-4 w-4" /></span>Campus Canteen</div><p className="font-medium">Fresh food. Smarter campus days.</p><p className="text-xs">(c) {new Date().getFullYear()} Campus Canteen</p></div>
      </footer>
    </main>
  );
}



