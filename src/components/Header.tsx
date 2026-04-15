'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ShoppingCart, User, LogOut, Globe } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn, signOut } from 'next-auth/react';

import { useLanguage } from '@/store/useLanguage';
import { BRANDING } from '@/constants/branding';

export default function Header({ onCartOpen, isStoreOpen = true }: { onCartOpen?: () => void; isStoreOpen?: boolean | null }) {
  const { language, toggleLanguage } = useLanguage();
  const { data: session } = useSession();
  const { items } = useCart();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] bg-brand-cream/90 backdrop-blur-xl h-20 md:h-24 flex items-center justify-between px-4 md:px-8 lg:px-12 border-b border-brand-red/5 shadow-sm transition-all duration-500"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* MOBILE CONTENT (md:hidden) - Centered Logo Layout */}
      <div className="md:hidden w-full h-full grid grid-cols-3 items-center">
        {/* START COLUMN (Right in AR, Left in EN): Language Pill */}
        <div className="flex items-center justify-start">
           <button 
             onClick={toggleLanguage} 
             className="flex items-center gap-2 px-4 py-2 rounded-full border border-brand-red/10 text-[10px] font-black uppercase tracking-widest bg-white shadow-sm active:scale-95 transition-all"
           >
             {language === 'ar' ? (
               <> <span>ENGLISH</span> <Globe size={14} className="text-brand-red" /> </>
             ) : (
               <> <Globe size={14} className="text-brand-red" /> <span>عربي</span> </>
             )}
           </button>
        </div>

        {/* CENTER COLUMN: LOGO */}
        <div className="flex flex-col items-center justify-center gap-1">
          <Link href="/" className="relative w-28 h-8 transition-transform active:scale-95">
            <Image src={BRANDING.logo.url} alt={BRANDING.nameEn} fill className="object-contain mix-blend-multiply" priority />
          </Link>
          {!isStoreOpen && (
            <motion.div 
               initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
               className="flex items-center gap-1.5 px-2.5 py-0.5 bg-brand-red text-white rounded-full shadow-lg shadow-brand-red/20"
            >
              <div className="w-1 h-1 bg-white rounded-full animate-ping" />
              <span className="text-[8px] font-black uppercase tracking-tighter whitespace-nowrap">
                {language === 'ar' ? 'مغلق' : 'Closed'}
              </span>
            </motion.div>
          )}
        </div>

        {/* END COLUMN (Left in AR, Right in EN): Auth & Orders */}
        <div className="flex items-center justify-end gap-3">
           <Link href="/my-orders" className="w-10 h-10 flex items-center justify-center bg-white border border-brand-red/10 rounded-full shadow-sm active:scale-95 transition-all">
             <ShoppingBag size={18} className="text-brand-black/60" />
           </Link>
           
           <button 
             onClick={() => session ? signOut() : signIn('google')}
             className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-brand-red ring-2 ring-white shadow-md active:scale-90 transition-all group"
           >
             {session ? (
               <Image src={session.user?.image || ''} alt="User" fill className="object-cover group-hover:opacity-75" />
             ) : (
               <div className="w-full h-full bg-brand-red/5 flex items-center justify-center">
                 <User size={18} className="text-brand-red" />
               </div>
             )}
           </button>
        </div>
      </div>

      {/* DESKTOP CONTENT (hidden md:flex) - Side-to-Side Layout */}
      <div className="hidden md:flex w-full h-full items-center justify-between">
        {/* LEFT (Desktop): Actions Grouped */}
        <div className="flex items-center gap-1.5 md:gap-3">
           <button onClick={onCartOpen} className="relative p-2.5 md:p-3.5 bg-brand-black text-white rounded-full transition-all hover:scale-110 shadow-lg active:scale-95 flex-shrink-0">
             <ShoppingCart size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
             <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-1 -right-1 bg-white text-brand-red text-[8px] md:text-[9px] font-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center border-2 border-brand-black">
                    {cartCount}
                  </motion.span>
                )}
             </AnimatePresence>
           </button>

           <div className="flex items-center">
               <button 
                 onClick={() => session ? signOut() : signIn('google')}
                 className="flex items-center gap-2 bg-brand-red/5 hover:bg-brand-red/10 p-1.5 pr-4 rounded-full border border-brand-red/10 transition-colors active:scale-95"
               >
                  {session ? (
                    <>
                      <div className="text-brand-black/30 hover:text-brand-red transition-all">
                        <LogOut size={20} /> 
                      </div>
                      <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-brand-red ring-2 ring-white shadow-sm">
                        <Image src={session.user?.image || ''} alt="User" fill className="object-cover" />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-1.5">
                      <span className="font-black text-sm tracking-tight uppercase">{language === 'ar' ? 'دخول' : 'Sign In'}</span>
                      <div className="bg-white p-2 rounded-full shadow-sm">
                        <User size={18} className="text-brand-red" />
                      </div>
                    </div>
                  )}
               </button>
           </div>

           <Link href="/my-orders" className="p-3.5 text-brand-black/60 bg-brand-red/5 rounded-full border border-brand-red/10 shadow-sm transition-all hover:bg-white active:scale-95 group">
             <ShoppingBag size={20} className="group-hover:text-brand-red transition-colors" />
           </Link>

           <button onClick={toggleLanguage} className="flex items-center gap-2 px-5 py-3 rounded-full border border-brand-red/10 text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 bg-brand-red/5 shadow-sm">
             <span className="text-brand-black/80">{language === 'ar' ? 'English' : 'عربي'}</span>
             <Globe size={16} className="text-brand-red" />
           </button>
        </div>

        {/* RIGHT (Desktop): Logo */}
        <div className="flex items-center justify-end gap-6">
          {!isStoreOpen && (
            <motion.div 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-3 px-5 py-2.5 bg-brand-red/5 border-2 border-brand-red/20 rounded-2xl shadow-sm"
            >
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-brand-red rounded-full" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-brand-red rounded-full animate-ping" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] leading-none font-black text-brand-red uppercase tracking-widest mb-0.5">
                   {language === 'ar' ? 'المطعم مغلق' : 'Restaurant Closed'}
                 </span>
                 <span className="text-[8px] leading-none font-bold text-brand-black/40 uppercase tracking-tighter">
                   {language === 'ar' ? 'نعتذر عن استقبال الطلبات' : 'Not accepting orders now'}
                 </span>
              </div>
            </motion.div>
          )}
          <Link href="/" className="relative md:w-64 md:h-16 lg:w-72 lg:h-20 transition-transform hover:scale-105 active:scale-95">
            <Image src={BRANDING.logo.url} alt={BRANDING.nameEn} fill className="object-contain object-right mix-blend-multiply" priority />
          </Link>
        </div>
      </div>
    </header>
  );
}