import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight, Clock3, Menu, ShieldCheck, ShoppingBag, Sparkles, Star, Store, Utensils, X, Zap } from 'lucide-react';

const fallbackMenu = [
  { _id: '1', name: 'Masala Dosa', category: 'South Indian', price: 75, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop' },
  { _id: '2', name: 'Chicken Biryani', category: 'Main course', price: 145, image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop' },
  { _id: '3', name: 'Paneer Wrap', category: 'Quick bites', price: 90, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&auto=format&fit=crop' }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menu, setMenu] = useState(fallbackMenu);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/food-items?available=true&limit=3`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => {
        const items = payload.data || payload;
        if (Array.isArray(items) && items.length) setMenu(items.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileOpen(false); };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#faf9f6] text-[#17211b]">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#e7e3dc] bg-[#faf9f6]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center px-5 sm:px-8">
          <button onClick={() => scrollTo('home')} className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#17211b] text-white"><Utensils className="h-5 w-5" /></span><span className="text-lg font-black tracking-tight">Campus Canteen</span></button>
          <div className="mx-auto hidden items-center gap-8 text-sm font-bold text-slate-500 md:flex">
            <button onClick={() => scrollTo('how')}>How it works</button><button onClick={() => scrollTo('menu')}>Today’s menu</button><button onClick={() => scrollTo('benefits')}>Benefits</button>
          </div>
          <div className="ml-auto hidden items-center gap-2 md:flex"><button onClick={() => navigate('/login')} className="rounded-xl px-4 py-2.5 text-sm font-extrabold hover:bg-white">Sign in</button><button onClick={() => navigate('/register')} className="rounded-xl bg-[#17211b] px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-slate-900/10 hover:bg-[#29382f]">Get started</button></div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="ml-auto rounded-xl p-2 md:hidden" aria-label="Toggle menu">{mobileOpen ? <X /> : <Menu />}</button>
        </div>
        {mobileOpen && <div className="border-t border-[#e7e3dc] bg-[#faf9f6] p-5 md:hidden"><div className="grid gap-2">{[['How it works','how'],['Today’s menu','menu'],['Benefits','benefits']].map(([label,id]) => <button key={id} onClick={() => scrollTo(id)} className="rounded-xl px-3 py-3 text-left font-bold hover:bg-white">{label}</button>)}<button onClick={() => navigate('/login')} className="mt-2 rounded-xl border border-[#ded8cf] bg-white py-3 font-extrabold">Sign in</button><button onClick={() => navigate('/register')} className="rounded-xl bg-[#17211b] py-3 font-extrabold text-white">Get started</button></div></div>}
      </nav>

      <section id="home" className="relative overflow-hidden pb-24 pt-32 sm:pt-40">
        <div className="absolute -right-40 top-12 h-[500px] w-[500px] rounded-full bg-orange-200/45 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-black uppercase tracking-[.14em] text-orange-700"><Sparkles className="h-3.5 w-3.5" /> Made for campus life</div>
            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[.98] tracking-[-.055em] sm:text-6xl lg:text-7xl">Lunch break,<br/><span className="text-[#ed6938]">minus the queue.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">One simple workspace to browse today’s food, order ahead, track preparation, and collect exactly when it’s ready.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><button onClick={() => navigate('/register')} className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#17211b] px-6 py-4 font-extrabold text-white shadow-xl shadow-slate-900/15 hover:bg-[#29382f]">Start ordering <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button><button onClick={() => scrollTo('menu')} className="rounded-2xl border border-[#ddd7cd] bg-white px-6 py-4 font-extrabold shadow-sm hover:border-orange-300">Explore today’s menu</button></div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-slate-500">{['No platform fee','Live order status','Secure checkout'].map((item) => <span key={item} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-3 w-3" /></span>{item}</span>)}</div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rotate-3 rounded-[2.5rem] bg-[#17211b]" />
            <img src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1000&auto=format&fit=crop" alt="Fresh colourful campus meal" className="relative aspect-[4/5] w-full rounded-[2.25rem] object-cover shadow-2xl" />
            <div className="absolute -bottom-5 -left-4 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur sm:-left-8"><p className="text-xs font-bold text-slate-400">Average pickup</p><p className="mt-1 flex items-center gap-2 text-xl font-black"><Clock3 className="h-5 w-5 text-orange-500" /> 12 minutes</p></div>
            <div className="absolute -right-4 top-7 rounded-2xl bg-orange-500 p-4 text-white shadow-xl sm:-right-8"><ShoppingBag className="h-5 w-5" /><p className="mt-4 text-2xl font-black">1,000+</p><p className="text-xs font-bold text-white/70">student orders</p></div>
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-[#e8e3da] bg-white py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[.18em] text-orange-600">A smoother lunch break</p><h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">From hungry to ready in three steps.</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3">{[[Store,'01','Choose your meal','See what is available now, with clear prices and preparation times.'],[Zap,'02','Order ahead','Pay securely and send your order straight to the kitchen.'],[ShieldCheck,'03','Collect with confidence','Follow live status updates and arrive when your food is ready.']].map(([Icon,num,title,body]) => <article key={num} className="rounded-[1.75rem] border border-[#e9e4dc] bg-[#fbfaf7] p-7"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#17211b] text-white"><Icon className="h-5 w-5" /></span><span className="text-sm font-black text-slate-300">{num}</span></div><h3 className="mt-8 text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-slate-500">{body}</p></article>)}</div></div></section>

      <section id="menu" className="py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-600">Fresh today</p><h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">Popular right now.</h2></div><button onClick={() => navigate('/register')} className="flex items-center gap-2 font-extrabold text-orange-600">View full menu <ChevronRight className="h-4 w-4" /></button></div><div className="mt-12 grid gap-6 md:grid-cols-3">{menu.map((item) => <article key={item._id || item.id} className="group overflow-hidden rounded-[1.75rem] border border-[#e6e0d7] bg-white shadow-[0_18px_60px_rgba(32,38,34,.07)]"><div className="relative overflow-hidden"><img src={item.image || fallbackMenu[0].image} alt={item.name} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black backdrop-blur">{item.category}</span></div><div className="flex items-center justify-between p-5"><div><h3 className="text-lg font-black">{item.name}</h3><div className="mt-1 flex items-center gap-1 text-xs font-bold text-amber-500"><Star className="h-3.5 w-3.5 fill-current" /> 4.8 <span className="text-slate-400">· Ready in 15 min</span></div></div><span className="text-xl font-black text-orange-600">₹{item.price}</span></div></article>)}</div></div></section>

      <section id="benefits" className="px-5 pb-24 sm:px-8"><div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-[#17211b] px-6 py-16 text-center text-white sm:px-12 sm:py-20"><p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Your campus. Your canteen.</p><h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-[-.045em] sm:text-5xl">Spend less time waiting.<br/>More time living campus life.</h2><p className="mx-auto mt-6 max-w-xl leading-7 text-white/55">Join students already ordering smarter between classes, labs, and everything else.</p><button onClick={() => navigate('/register')} className="mt-9 rounded-2xl bg-orange-500 px-7 py-4 font-extrabold shadow-xl shadow-black/20 hover:bg-orange-400">Create your free account</button></div></section>

      <footer className="border-t border-[#e7e3dc] py-8"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm font-medium text-slate-400 sm:flex-row sm:px-8"><div className="flex items-center gap-2 font-black text-[#17211b]"><Utensils className="h-4 w-4" /> Campus Canteen</div><p>Fresh food. Smarter campus days.</p><p>© {new Date().getFullYear()} Campus Canteen</p></div></footer>
    </main>
  );
}
