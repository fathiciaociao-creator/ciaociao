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
      className="fixed top-0 left-0 right-0 z-[100] bg-brand-cream/80 backdrop-blur-xl h-20 md:h-24 flex items-center justify-between px-4 md:px-12 border-b border-brand-red/10 shadow-sm"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* START SECTION: Logo */}
      <div className="flex items-center">
        <Link href="/" className="relative w-48 h-12 md:w-72 md:h-24 transition-transform active:scale-95">
          <Image src={BRANDING.logo.url} alt={BRANDING.nameEn} fill className="object-contain object-right md:object-left mix-blend-multiply" priority sizes="(max-width: 768px) 192px, 288px" />
        </Link>
      </div>

      {/* END SECTION: Actions */}
      <div className="flex items-center justify-end gap-2 md:gap-6 flex-1">
         {/* Store Status Badge */}
         {!isStoreOpen && (
           <div className="flex items-center gap-1.5 md:gap-2 bg-rose-50 text-rose-600 px-2 py-1 md:px-3 md:py-2 rounded-full border border-rose-200 shadow-sm animate-pulse">
             <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.6)]" />
             <span className="text-[7px] md:text-[10px] font-black tracking-widest uppercase hidden md:block">
               {language === 'ar' ? 'المطعم مغلق' : 'Store Closed'}
             </span>
             <span className="text-[7px] font-black tracking-widest uppercase md:hidden">
               {language === 'ar' ? 'مغلق' : 'Closed'}
             </span>
           </div>
         )}

         {/* Language Toggle */}
         <button 
           onClick={toggleLanguage}
           className="flex items-center gap-1 md:gap-2 px-2 py-1.5 md:px-3 md:py-2 rounded-xl border border-brand-red/20 text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all active:scale-95 bg-brand-cream shadow-sm"
         >
           <Globe size={12} className="text-brand-red md:w-3.5 md:h-3.5" />
           <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
         </button>

         {/* Auth Section */}
         <div className="flex items-center gap-2 md:gap-4">
           {session ? (
             <div className="flex items-center gap-2 md:gap-3">
               <Link 
                 href="/my-orders" 
                 className="p-2 md:p-3 text-brand-red bg-brand-cream rounded-full border border-brand-red/10 shadow-sm transition-all active:scale-95" 
               >
                 <ShoppingBag size={18} className="md:w-5 md:h-5" />
               </Link>
               <div className="hidden sm:flex items-center gap-2 bg-brand-red/5 p-1 rounded-full border border-brand-red/10">
                  <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-brand-gray/50">
                    <Image src={session.user?.image || 'https://placehold.co/100x100/F9F7F2/1A1A1A.png?text=U'} alt="User" fill className="object-cover" />
                  </div>
                  <button onClick={() => signOut()} className="p-2 text-brand-black/40 hover:text-brand-red transition-all">
                    <LogOut size={16} /> 
                  </button>
               </div>
             </div>
           ) : (
             <button onClick={() => signIn('google')} className="p-2 md:px-6 md:py-3 bg-brand-cream border border-brand-red/20 text-brand-red rounded-full hover:bg-brand-red hover:text-white shadow-sm transition-all active:scale-95">
               <User size={18} className="md:w-5 md:h-5" />
               <span className="hidden md:inline ml-2 font-black text-sm">{language === 'ar' ? 'دخول' : 'Sign In'}</span>
             </button>
           )}
         </div>

         {/* CART BUTTON */}
         <button onClick={onCartOpen} className="relative p-2.5 md:p-3 bg-brand-red text-white rounded-full transition-all hover:scale-105 shadow-lg shadow-brand-red/20 active:scale-90 flex-shrink-0">
           <ShoppingCart size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
           <AnimatePresence>
              {cartCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-1 -right-1 bg-white text-brand-red text-[8px] md:text-[9px] font-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center border-2 border-brand-red">
                  {cartCount}
                </motion.span>
              )}
           </AnimatePresence>
         </button>
      </div>
    </header>
  );
}