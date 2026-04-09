'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ShoppingCart, User, LogOut, Globe } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/store/useLanguage';
import { BRANDING } from '@/constants/branding';

export default function Header({ onCartOpen }: { onCartOpen?: () => void }) {
  const { language, toggleLanguage } = useLanguage();
  const { data: session } = useSession();
  const { items } = useCart();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.isStoreOpen === 'boolean') {
          setIsStoreOpen(data.isStoreOpen);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl h-20 md:h-24 flex items-center justify-between px-4 md:px-8 lg:px-12 border-b border-brand-red/5 shadow-sm"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* MOBILE CONTENT (md:hidden) - Centered Logo Layout */}
      <div className="md:hidden w-full h-full grid grid-cols-3 items-center">
        {/* Left Side (Mobile): Auth & Orders in Arabic; Language in English */}
        <div className="flex items-center justify-start gap-2">
           {language === 'ar' ? (
             <>
               <div className="relative w-8 h-8 rounded-full overflow-hidden border border-brand-red ring-1 ring-white">
                 <Image src={session?.user?.image || 'https://placehold.co/100x100/F9F7F2/1A1A1A.png?text=U'} alt="User" fill className="object-cover" />
               </div>
               <Link href="/my-orders" className="w-8 h-8 flex items-center justify-center bg-white border border-brand-red/10 rounded-full shadow-sm">
                 <ShoppingBag size={14} className="text-brand-black/60" />
               </Link>
             </>
           ) : (
             <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-red/10 text-[9px] font-black uppercase tracking-widest bg-white shadow-sm">
               <span>ENGLISH</span>
               <Globe size={12} className="text-brand-red" />
             </button>
           )}
        </div>

        {/* Center Side (Mobile): LOGO */}
        <div className="flex items-center justify-center">
          <Link href="/" className="relative w-28 h-10">
            <Image src={BRANDING.logo.url} alt={BRANDING.nameEn} fill className="object-contain mix-blend-multiply" priority />
          </Link>
        </div>

        {/* Right Side (Mobile): Language in Arabic; Orders & Auth in English */}
        <div className="flex items-center justify-end gap-2">
          {language === 'ar' ? (
             <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-red/10 text-[9px] font-black uppercase tracking-widest bg-white shadow-sm">
               <Globe size={12} className="text-brand-red" />
               <span>عربي</span>
             </button>
          ) : (
            <>
               <Link href="/my-orders" className="w-8 h-8 flex items-center justify-center bg-white border border-brand-red/10 rounded-full shadow-sm">
                 <ShoppingBag size={14} className="text-brand-black/60" />
               </Link>
               <div className="relative w-8 h-8 rounded-full overflow-hidden border border-brand-red ring-1 ring-white">
                 <Image src={session?.user?.image || 'https://placehold.co/100x100/F9F7F2/1A1A1A.png?text=U'} alt="User" fill className="object-cover" />
               </div>
            </>
          )}
        </div>
      </div>

      {/* DESKTOP CONTENT (hidden md:flex) - Side-to-Side Layout */}
      <div className="hidden md:flex w-full h-full items-center justify-between">
        {/* LEFT: All Actions Grouped */}
        <div className="flex items-center gap-1.5 md:gap-3">
           <button onClick={onCartOpen} className="relative p-2.5 md:p-3.5 bg-brand-black text-white rounded-full transition-all hover:scale-110 shadow-lg active:scale-95 flex-shrink-0">
             <ShoppingCart size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
             <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-1 -right-1 bg-brand-red text-white text-[8px] md:text-[9px] font-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center border-2 border-brand-black">
                    {cartCount}
                  </motion.span>
                )}
             </AnimatePresence>
           </button>

           <div className="flex items-center">
             {session ? (
               <div className="flex items-center gap-2 bg-brand-red/5 hover:bg-brand-red/10 p-1.5 pr-4 rounded-full border border-brand-red/10 transition-colors">
                  <button onClick={() => signOut()} className="text-brand-black/30 hover:text-brand-red transition-all">
                    <LogOut size={16} className="md:w-5 md:h-5" /> 
                  </button>
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-brand-red ring-2 ring-white">
                    <Image src={session.user?.image || 'https://placehold.co/100x100/F9F7F2/1A1A1A.png?text=U'} alt="User" fill className="object-cover" />
                  </div>
               </div>
             ) : (
               <button onClick={() => signIn('google')} className="flex items-center gap-2 px-6 py-2.5 bg-brand-red/5 border border-brand-red/10 text-brand-black rounded-full hover:bg-white hover:border-brand-red/30 shadow-sm transition-all active:scale-95 group">
                 <span className="font-black text-xs tracking-tight uppercase">{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                 <div className="bg-white p-1 rounded-full shadow-sm">
                   <User size={14} className="text-brand-red" />
                 </div>
               </button>
             )}
           </div>

           <Link href="/my-orders" className="p-3 text-brand-black/60 bg-brand-red/5 rounded-full border border-brand-red/10 shadow-sm transition-all hover:bg-white active:scale-95 group">
             <ShoppingBag size={18} className="group-hover:text-brand-red transition-colors" />
           </Link>

           <button onClick={toggleLanguage} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-brand-red/10 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 bg-brand-red/5 shadow-sm">
             <span className="text-brand-black/80">{language === 'ar' ? 'ENGLISH' : 'عربي'}</span>
             <Globe size={14} className="text-brand-red" />
           </button>
        </div>

        {/* RIGHT: Logo */}
        <div className="flex items-center justify-end">
          <Link href="/" className="relative md:w-56 md:h-16 lg:w-64 lg:h-20 transition-transform hover:scale-105 active:scale-95">
            <Image src={BRANDING.logo.url} alt={BRANDING.nameEn} fill className="object-contain object-right mix-blend-multiply" priority />
          </Link>
        </div>
      </div>
    </header>
  );
}