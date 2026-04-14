'use client';
import { useCart } from '@/store/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MenuItemCard, { Product } from '@/components/MenuItemCard';
import CartSidebar from '@/components/CartSidebar';
import { useLanguage } from '@/store/useLanguage';

export default function HomeClient({ 
  initialData = [], 
  initialSettings = null 
}: { 
  initialData?: Product[], 
  initialSettings?: { categoryOrder?: string } | null 
}) {
  const { language } = useLanguage();
  const { items, getTotalPrice } = useCart();
  const products = initialData;
  const categoryOrder = (() => {
    if (initialSettings?.categoryOrder) {
      try {
        const parsed = JSON.parse(initialSettings.categoryOrder);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  })();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuLoading = false; 
  
  // Calculate categories from CURRENT products and categoryOrder
  const allCategoriesSet = new Set<string>();
  products.forEach(p => {
    if (p.category) {
      p.category.split(',').forEach((c: string) => {
        const trimmed = c.trim();
        if (trimmed) allCategoriesSet.add(trimmed);
      });
    }
  });

  const categories = Array.from(allCategoriesSet).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const activeCategory = selectedCategory || categories[0] || '';

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const filteredData = products.filter((item) => {
    return (item.category && activeCategory)
      ? item.category.split(',').map((c: string) => c.trim()).includes(activeCategory)
      : false;
  });

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = getTotalPrice();

  // Effect to set initial category if we have data from server
  if (!mounted) return null;

  return (
    <div className="bg-brand-cream min-h-screen font-body" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header onCartOpen={() => setIsSidebarOpen(true)} />
      
      <main className="pt-24 pb-32">
        <div className="sticky top-20 z-40 bg-brand-cream/80 backdrop-blur-md border-b border-brand-red/10 mb-8">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-6">


             <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-10 py-6">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-sm font-bold uppercase whitespace-nowrap relative py-2 transition-all
                      ${activeCategory === cat ? 'text-black' : 'text-gray-400 hover:text-black'}`}
                  >
                    {cat}
                    {activeCategory === cat && (
                      <motion.div 
                        layoutId="activeUnderline"
                        className="absolute -bottom-[2px] left-0 right-0 h-1 bg-brand-red rounded-full"
                      />
                    )}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
           <h2 className="text-3xl font-bold text-black luxury-heading mb-2">{activeCategory}</h2>
           <p className="text-gray-500 text-sm font-medium">
             {language === 'ar' ? 'أطباق مختارة بعناية خصيصاً لك' : 'Carefully selected premium dishes just for you'}
           </p>
        </div>

        <section className="max-w-7xl mx-auto px-6">
          {menuLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
               {[1,2,3,4].map(i => (
                 <div key={i} className="space-y-4 animate-pulse">
                    <div className="aspect-square bg-gray-100 rounded-2xl" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                 </div>
               ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
               <AnimatePresence mode="popLayout">
                {filteredData.map((item, index) => (
                  <MenuItemCard key={item.id} item={item} priority={index < 4} />
                ))}
               </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {totalPrice > 0 && !isSidebarOpen ? (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[110] bg-brand-cream border-t border-brand-red/10 p-6 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.05)]"
          >
            <div className={`flex-1 flex flex-col ${language === 'ar' ? 'text-right' : 'text-left'}`}>
               <span className="text-xs font-bold text-gray-400">
                 {language === 'ar' ? 'إجمالي الطلب' : 'Current Order Total'}
               </span>
               <span className="text-xl font-bold text-black">{totalPrice.toFixed(2)} {language === 'ar' ? 'د.أ' : 'JOD'}</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="bg-brand-red text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-brand-red/20"
            >
              <ShoppingCart size={20} />
              <span>{language === 'ar' ? `عرض السلة (${cartCount})` : `View Cart (${cartCount})`}</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <CartSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
}
