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
      className="fixed top-0 left-0 right-0 z-[100] bg-brand-cream/80 backdrop-blur-xl h-20 md:h-24 grid grid-cols-3 items-center px-4 md:px-8 lg:px-12 border-b border-brand-red/10 shadow-sm"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* LEFT SECTION: Language & Status */}
      <div className="flex items-center justify-start gap-2 md:gap-4">
         {/* Language Toggle */}
         <button 
           onClick={toggleLanguage}
           className="flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-red/10 text-[10px] font-black uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all active:scale-95 bg-brand-cream/50 shadow-sm"
         >
           <Globe size={14} className="text-brand-red" />
           <span className="md:inline">{language === 'ar' ? 'EN' : 'عربي'}</span>
         </button>

         {/* Store Status Dot */}
         {!isStoreOpen && (
           <div className="flex items-center justify-center p-2 md:px-4 md:py-2 rounded-full bg-rose-50 border border-rose-100 shadow-sm animate-pulse">
             <div className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.6)]" />
             <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-rose-600 ml-2">
               {language === 'ar' ? 'المطعم مغلق' : 'Store Closed'}
             </span>
           </div>
         )}
      </div>

      {/* CENTER SECTION: Logo */}
      <div className="flex items-center justify-center">
        <Link href="/" className="relative w-32 h-10 md:w-60 md:h-20 lg:w-72 lg:h-24 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center">
          <Image src={BRANDING.logo.url} alt={BRANDING.nameEn} fill className="object-contain mix-blend-multiply" priority sizes="(max-width: 768px) 128px, 288px" />
        </Link>
      </div>

      {/* RIGHT SECTION: Auth & Cart */}
      <div className="flex items-center justify-end gap-2 md:gap-4 lg:gap-6">
         {/* Auth Section - Only Orders/User on desktop icons */}
         <div className="flex items-center gap-2">
           {session ? (
             <>
               <Link href="/my-orders" className="p-2.5 md:p-3 text-brand-red bg-brand-cream rounded-full border border-brand-red/10 shadow-sm transition-all active:scale-95">
                 <ShoppingBag size={18} className="md:w-5 md:h-5" />
               </Link>
               <div className="hidden sm:flex items-center gap-2 bg-brand-red/5 p-1 rounded-full border border-brand-red/10">
                  <button onClick={() => signOut()} className="p-2 text-brand-black/40 hover:text-brand-red transition-all">
                    <LogOut size={16} /> 
                  </button>
               </div>
             </>
           ) : (
             <button onClick={() => signIn('google')} className="hidden md:flex p-3 text-brand-red bg-brand-cream rounded-full border border-brand-red/10 shadow-sm transition-all active:scale-95">
               <User size={18} />
             </button>
           )}
         </div>

         {/* CART BUTTON */}
         <button onClick={onCartOpen} className="relative p-3 md:p-4 bg-brand-red text-white rounded-full transition-all hover:scale-110 shadow-lg shadow-brand-red/30 active:scale-90 flex-shrink-0">
           <ShoppingCart size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
           <AnimatePresence>
              {cartCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-1 -right-1 bg-white text-brand-red text-[9px] md:text-[10px] font-black w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border-2 border-brand-red">
                  {cartCount}
                </motion.span>
              )}
           </AnimatePresence>
         </button>
      </div>
    </header>
  );
}