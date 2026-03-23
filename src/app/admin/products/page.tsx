'use client';
import { useEffect, useState } from 'react';
import {
  Plus, Edit2, Trash2, Camera, DollarSign, Package,
  Check, X, Save, LayoutGrid,
  Layers, Search, ArrowLeft,
  Folder, ChevronRight, ChevronUp, ChevronDown, ListOrdered,
  CheckSquare, Square, MoveRight, Box, User, Printer, Store, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  descriptionAr?: string;
  descriptionEn?: string;
}

export default function ProductsDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: '',
    price: '',
    category: 'Sushi',
    imageUrl: '',
    descriptionAr: '',
    descriptionEn: ''
  });

  const existingCategories = Array.from(new Set(
    products.flatMap(p => p.category ? p.category.split(',').map((c: string) => c.trim()).filter(Boolean) : [])
  )).sort();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.categoryOrder) {
        setCategoryOrder(JSON.parse(data.categoryOrder));
      }
    } catch (e) {
      console.error("Failed to fetch settings", e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, []);

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });
      if (res.ok) {
        setProducts(products.map(p => p.id === id ? { ...p, isAvailable: !currentStatus } : p));
        toast.success(currentStatus ? 'تم إخفاء المنتج' : 'المنتج متوفر الآن', {
          style: { borderRadius: '20px', background: '#1A1A1A', color: '#fff' }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        toast.success('تم حذف المنتج بنجاح');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct ? 'PATCH' : 'POST';
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsPanelOpen(false);
        setEditingProduct(null);
        setFormData({ nameEn: '', nameAr: '', price: '', category: selectedCategory || existingCategories[0] || 'Sushi', imageUrl: '', descriptionAr: '', descriptionEn: '' });
        fetchProducts();
        toast.success(editingProduct ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح', {
          style: { borderRadius: '20px', background: '#922724', color: '#fff' }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openEditPanel = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      price: product.price.toString(),
      category: product.category,
      imageUrl: product.imageUrl || '',
      descriptionAr: product.descriptionAr || '',
      descriptionEn: product.descriptionEn || ''
    });
    setIsPanelOpen(true);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nameAr.includes(searchQuery) ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'الكل' || (p.category && p.category.split(',').map(c => c.trim()).includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });

  const getProductCountByCategory = (category: string) => {
    return products.filter(p => p.category && p.category.split(',').map(c => c.trim()).includes(category)).length;
  };

  const stats = {
    total: products.length,
    outOfStock: products.filter(p => !p.isAvailable).length,
    categories: existingCategories.length
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex flex-col md:flex-row font-body" dir="rtl">
      <Toaster position="bottom-center" />

      {/* SIDEBAR - Consistent with main Admin page */}
      <div className="w-full md:w-72 bg-brand-black text-white flex flex-col p-6 sticky top-0 md:h-screen z-50 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-4 mb-20 px-2 mt-4">
          <div className="bg-brand-red p-3 rounded-2xl shadow-xl"><ShieldCheck size={28} /></div>
          <div>
            <h1 className="font-serif text-2xl font-black tracking-tight leading-none mb-1">إدارة شيان</h1>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">Control Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {[
            { id: 'ORDERS', label: 'الطلبات الحالية', icon: Box, color: 'text-brand-red', href: '/admin' },
            { id: 'PRODUCTS', label: 'إدارة القائمة', icon: LayoutGrid, color: 'text-brand-red', active: true },
            { id: 'COUPONS', label: 'الكوبونات', icon: Printer, color: 'text-purple-400', href: '/admin/coupons' },
            { id: 'CUSTOMERS', label: 'الزبائن', icon: User, color: 'text-green-400', href: '/admin' },
            { id: 'SYSTEM', label: 'النظام', icon: Store, color: 'text-orange-400', href: '/admin' },
          ].map((item) => (
             item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all text-white/30 hover:bg-white/5 hover:text-white"
                >
                  <item.icon size={20} className="text-current" />
                  <span className="text-sm">{item.label}</span>
                </Link>
             ) : (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all bg-white/10 text-white shadow-lg"
                >
                  <item.icon size={20} className="text-brand-red" />
                  <span className="text-sm">{item.label}</span>
                </button>
             )
          ))}
        </nav>

        <div className="mt-20 pt-10 border-t border-white/5 space-y-6 mb-4">
           <p className="text-[10px] text-white/20 font-medium text-center uppercase tracking-widest pb-4">Xian Ops • Stable 2.5</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6 md:p-12 relative overflow-x-hidden">
        
        {/* PREMIUM HEADER - Matching main admin style */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
          <div>
            <h2 className="text-4xl font-black text-brand-black luxury-heading mb-3 tracking-tighter">
              {(selectedCategory && selectedCategory !== 'الكل') ? `قسم: ${selectedCategory}` : "إدارة الأصناف والقائمة"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-red rounded-full animate-pulse"></span>
              <p className="text-brand-black/40 font-black text-xs uppercase tracking-widest">
                Boutique Inventory Suite • Live Sync
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
             <button
                onClick={() => {
                  const cats = Array.from(new Set(products.flatMap(p => p.category ? p.category.split(',').map(c => c.trim()).filter(Boolean) : []))).sort();
                  setCategoryOrder(cats);
                  setIsReorderModalOpen(true);
                }}
                className="flex-1 md:flex-none bg-white border-2 border-brand-gray text-brand-black px-8 py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-brand-gray transition-all shadow-sm"
              >
                <ListOrdered size={20} />
                <span>ترتيب الأقسام</span>
              </button>
             <button 
                onClick={() => { setEditingProduct(null); setFormData({ nameEn: '', nameAr: '', price: '', category: selectedCategory === 'الكل' ? (existingCategories[0] || 'Sushi') : (selectedCategory || existingCategories[0] || 'Sushi'), imageUrl: '', descriptionAr: '', descriptionEn: '' }); setIsPanelOpen(true); }}
                className="flex-1 md:flex-none bg-brand-black text-white px-10 py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all group"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                <span>إضافة منتج</span>
             </button>
          </div>
        </div>

        {/* STATS & QUICK ACTIONS */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
           <div className="flex items-center gap-4">
              {selectedCategory && (
                <button
                  onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
                  className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-brand-gray/50 text-brand-black/40 hover:text-brand-red transition-all shadow-sm group font-bold text-sm"
                >
                  <ArrowLeft size={18} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                  <span>الرجوع للمجلدات</span>
                </button>
              )}
              {selectedCategory && (
                <div className="hidden md:flex items-center gap-4 text-brand-black/20 text-[10px] font-black uppercase tracking-[0.2em] bg-brand-cream/30 px-6 py-4 rounded-2xl">
                  <span>القائمة</span>
                  <ChevronRight size={14} className="rotate-180" />
                  <span className="text-brand-red">{selectedCategory}</span>
                </div>
              )}
           </div>

           <div className="flex items-center gap-6">
              <div className="bg-white px-8 py-5 rounded-[2rem] border border-brand-gray/40 shadow-sm flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-black/20">إجمالي الأصناف</span>
                  <span className="text-2xl font-black font-serif text-brand-black leading-none mt-1">{stats.total}</span>
                </div>
                <div className="w-px h-8 bg-brand-gray" />
                <div className="flex flex-col">
                   <span className="text-[9px] font-black uppercase tracking-widest text-brand-red/40">نواقص</span>
                   <span className="text-2xl font-black font-serif text-brand-red leading-none mt-1">{stats.outOfStock}</span>
                </div>
              </div>
           </div>
        </div>

        {/* SEARCH & BULK TOGGLE */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-black/20 group-focus-within:text-brand-red transition-colors" />
            <input
              type="text"
              placeholder={(selectedCategory && selectedCategory !== 'الكل') ? `البحث في ${selectedCategory}...` : "البحث في جميع المنتجات..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-brand-gray/40 rounded-[2rem] py-5 pr-14 pl-8 outline-none focus:border-brand-red/20 transition-all font-bold text-sm shadow-sm"
            />
          </div>

          {(selectedCategory || searchQuery) && (
            <button
              onClick={() => {
                const ids = filteredProducts.map(p => p.id);
                if (selectedIds.length === ids.length) setSelectedIds([]);
                else setSelectedIds(ids);
              }}
              className="flex items-center gap-3 bg-brand-black text-white px-8 py-5 rounded-[2rem] shadow-xl hover:scale-[1.02] active:scale-95 transition-all font-black text-xs"
            >
              {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                <CheckSquare size={18} className="text-brand-red" />
              ) : (
                <Square size={18} />
              )}
              <span>تحديد الكل ({selectedIds.length})</span>
            </button>
          )}
        </div>

        {/* DYNAMIC CONTENT VIEW */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-4 border-brand-red/20 border-t-brand-red rounded-full animate-spin"></div>
            <p className="text-brand-black/40 font-black">جاري تحميل القائمة...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!selectedCategory && !searchQuery ? (
              /* FOLDER VIEW */
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {existingCategories.map((cat, i) => (
                  <motion.button
                    key={cat}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedCategory(cat)}
                    className="group relative h-64 bg-white rounded-[3rem] p-10 border-2 border-brand-gray/30 shadow-sm hover:border-brand-red/20 hover:shadow-2xl transition-all text-right flex flex-col justify-between overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-12 text-brand-red/5 -mr-8 -mt-8 rotate-12 transition-transform group-hover:rotate-0">
                      <Folder size={180} strokeWidth={1} />
                    </div>

                    <div className="relative z-10 w-16 h-16 bg-brand-cream rounded-[1.5rem] flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all duration-500 shadow-inner">
                      <Folder size={28} strokeWidth={1.5} />
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-3xl font-black text-brand-black mb-1 font-serif group-hover:text-brand-red transition-colors">{cat}</h3>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-black/20">
                        {getProductCountByCategory(cat)} {getProductCountByCategory(cat) === 1 ? 'صنف' : 'أصناف'}
                      </p>
                    </div>
                  </motion.button>
                ))}

                <motion.button
                  onClick={() => setSelectedCategory('الكل')}
                  className="bg-brand-black group relative h-64 rounded-[3rem] shadow-2xl hover:scale-[1.02] transition-all text-right flex flex-col justify-between p-10 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-12 text-white/5 -mr-8 -mt-8 rotate-12 transition-transform group-hover:rotate-0">
                    <Layers size={180} strokeWidth={1} />
                  </div>
                  <div className="relative z-10 w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl">
                    <Layers size={28} strokeWidth={1.5} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black text-white mb-1 font-serif">جميع الأصناف</h3>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">مشاهدة القائمة كاملة</p>
                  </div>
                </motion.button>
              </motion.div>
            ) : (
              /* PRODUCTS LIST VIEW */
              <motion.div
                key="products"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="hidden lg:grid grid-cols-12 px-12 py-4 mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-black/20">
                  <div className="col-span-5">المنتج والتصنيف</div>
                  <div className="col-span-2 text-center">السعر</div>
                  <div className="col-span-3 text-center">الحالة</div>
                  <div className="col-span-2 text-left">الإجراءات</div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      onClick={() => setSelectedIds(prev => prev.includes(product.id) ? prev.filter(i => i !== product.id) : [...prev, product.id])}
                      className={`group bg-white rounded-[2.5rem] p-6 lg:p-8 border-2 transition-all duration-500 cursor-pointer
                        ${selectedIds.includes(product.id) ? 'border-brand-red ring-8 ring-brand-red/5 shadow-2xl scale-[1.01]' : 'border-brand-gray hover:border-brand-red/20 shadow-sm'}
                        ${!product.isAvailable ? 'opacity-80' : ''}`}
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 text-right">
                        
                        {/* Selector & Image */}
                        <div className="col-span-1 lg:col-span-5 flex items-center gap-8">
                           <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border-2 flex-shrink-0
                              ${selectedIds.includes(product.id) ? 'bg-brand-red border-brand-red text-white shadow-lg' : 'bg-brand-cream border-brand-gray/50 text-transparent group-hover:border-brand-red/30'}`}>
                             <Check size={18} strokeWidth={4} />
                           </div>
                           <div className="relative w-24 h-24 flex-shrink-0 rounded-[2rem] overflow-hidden border-2 border-brand-gray/50 shadow-inner bg-brand-cream ring-4 ring-white">
                              <Image
                                src={product.imageUrl || '/placeholder.png'}
                                alt={product.nameAr}
                                fill
                                className={`object-cover transition-transform duration-1000 group-hover:scale-110 ${!product.isAvailable ? 'grayscale' : ''}`}
                              />
                           </div>
                           <div>
                              <h4 className="font-black text-2xl text-brand-black mb-1 group-hover:text-brand-red transition-colors">{product.nameAr}</h4>
                              <p className="text-[11px] font-bold text-brand-black/20 uppercase tracking-[0.2em]">{product.nameEn}</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                 {product.category?.split(',').map((c, idx) => (
                                    <span key={idx} className="bg-brand-cream/80 px-4 py-1.5 rounded-full text-[9px] font-black text-brand-black/40 uppercase tracking-widest border border-brand-gray/50">
                                      {c.trim()}
                                    </span>
                                 ))}
                              </div>
                           </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-1 lg:col-span-2 text-right lg:text-center">
                           <div className="text-3xl font-black text-brand-red font-serif tracking-tighter">
                             {product.price.toFixed(2)} <span className="text-[10px] text-brand-black/20 font-sans tracking-normal uppercase">JOD</span>
                           </div>
                        </div>

                        {/* Status Switch */}
                        <div className="col-span-1 lg:col-span-3 flex lg:justify-center items-center gap-4">
                           <button
                              onClick={(e) => { e.stopPropagation(); handleToggleAvailability(product.id, product.isAvailable); }}
                              className="flex items-center gap-5 p-2 rounded-full hover:bg-brand-cream transition-colors group/toggle"
                           >
                              <span className={`text-[11px] font-black uppercase tracking-widest transition-opacity
                                 ${product.isAvailable ? 'text-green-600' : 'text-brand-black/20'}`}>
                                 {product.isAvailable ? 'نشط' : 'معطل'}
                              </span>
                              <div className={`w-14 h-7 rounded-full relative transition-all duration-500 flex items-center px-1 shadow-inner
                                 ${product.isAvailable ? 'bg-green-600' : 'bg-brand-black/10'}`}>
                                 <motion.div
                                   layout
                                   className="w-5 h-5 bg-white rounded-full shadow-xl"
                                   animate={{ x: product.isAvailable ? 28 : 0 }}
                                 />
                              </div>
                           </button>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 lg:col-span-2 flex justify-start lg:justify-end items-center gap-2">
                           <button onClick={(e) => { e.stopPropagation(); openEditPanel(product); }} className="p-4 bg-brand-cream text-brand-black/30 hover:text-brand-red hover:bg-white hover:shadow-lg rounded-2xl transition-all"><Edit2 size={20} /></button>
                           <button onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }} className="p-4 bg-brand-cream text-brand-black/30 hover:text-brand-red hover:bg-white hover:shadow-lg rounded-2xl transition-all"><Trash2 size={20} /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {filteredProducts.length === 0 && (
                    <div className="py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-brand-gray shadow-inner">
                      <Package size={80} className="mx-auto text-brand-black/10 mb-8" strokeWidth={1} />
                      <h3 className="text-4xl font-serif text-brand-black/20 px-8">لا توجد أصناف تطابق بحثك حالياً</h3>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* BULK ACTIONS FLOATING BAR */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
              className="fixed bottom-12 left-1/2 md:left-[calc(50%+144px)] -translate-x-1/2 z-[100] bg-brand-black/95 backdrop-blur-2xl text-white px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-10 border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-red rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-brand-red/20">
                  {selectedIds.length}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest leading-none">أصناف مختارة</span>
                  <span className="text-[10px] text-white/40 font-bold mt-1">Bulk Selection Mode</span>
                </div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <button onClick={() => setIsBulkMoveModalOpen(true)} className="flex items-center gap-4 text-sm font-black hover:text-brand-red transition-all group">
                <MoveRight size={22} className="group-hover:translate-x-2 transition-transform" />
                <span>نقل جماعي</span>
              </button>
              <button onClick={() => setSelectedIds([])} className="text-[11px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">إلغاء</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* REORDER CATEGORIES MODAL */}
      <AnimatePresence>
        {isReorderModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReorderModalOpen(false)} className="absolute inset-0 bg-brand-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-brand-gray/50 flex flex-col max-h-[90vh]">
               <div className="p-10 border-b border-brand-gray/20 bg-brand-red text-white">
                  <h3 className="text-3xl font-black tracking-tighter mb-1 font-serif">ترتيب الأقسام</h3>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Global Menu Sequence Control</p>
               </div>
               <div className="flex-1 overflow-y-auto p-10 space-y-4 no-scrollbar">
                  {categoryOrder.map((cat, idx) => (
                    <div key={cat} className="flex items-center gap-5 bg-brand-cream/50 p-6 rounded-[2rem] border-2 border-brand-gray/30 group hover:border-brand-red/20 transition-all">
                       <span className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-brand-red shadow-sm">{idx + 1}</span>
                       <span className="flex-1 font-black text-brand-black text-lg">{cat}</span>
                       <div className="flex flex-col gap-1">
                          <button 
                             disabled={idx === 0} 
                             onClick={() => { const n = [...categoryOrder]; [n[idx], n[idx-1]] = [n[idx-1], n[idx]]; setCategoryOrder(n); }}
                             className="p-2 bg-white rounded-lg text-brand-black/20 hover:text-brand-red disabled:opacity-0 shadow-sm"
                          ><ChevronUp size={20}/></button>
                          <button 
                             disabled={idx === categoryOrder.length - 1}
                             onClick={() => { const n = [...categoryOrder]; [n[idx], n[idx+1]] = [n[idx+1], n[idx]]; setCategoryOrder(n); }}
                             className="p-2 bg-white rounded-lg text-brand-black/20 hover:text-brand-red disabled:opacity-0 shadow-sm"
                          ><ChevronDown size={20}/></button>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-10 pt-4">
                  <button 
                    onClick={async () => {
                      setIsSavingOrder(true);
                      await fetch('/api/settings', { method: 'PATCH', body: JSON.stringify({ categoryOrder: JSON.stringify(categoryOrder) }) });
                      setIsSavingOrder(false);
                      setIsReorderModalOpen(false);
                      toast.success('تم الحفظ');
                    }}
                    disabled={isSavingOrder}
                    className="w-full bg-brand-black text-white py-6 rounded-3xl font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    {isSavingOrder ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Save size={20}/> حفظ الترتيب الجديد</>}
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK MOVE MODAL */}
      <AnimatePresence>
        {isBulkMoveModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBulkMoveModalOpen(false)} className="absolute inset-0 bg-brand-black/60 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-brand-gray/50 p-10">
                <h3 className="text-2xl font-black text-brand-black mb-8 font-serif">نقل {selectedIds.length} أصناف إلى:</h3>
                <div className="flex flex-wrap gap-2 mb-8 lowercase">
                   {existingCategories.map(cat => (
                     <button
                       key={cat} onClick={() => setBulkCategory(cat)}
                       className={`px-6 py-3 rounded-2xl text-xs font-black transition-all border-2 
                          ${bulkCategory === cat ? 'bg-brand-red border-brand-red text-white shadow-lg' : 'bg-brand-cream border-transparent text-brand-black/40 hover:border-brand-gray'}`}
                     >
                       {cat}
                     </button>
                   ))}
                </div>
                <input 
                  placeholder="أو اكتب قسماً جديداً..." 
                  value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full bg-brand-cream border-2 border-brand-gray rounded-2xl p-5 outline-none focus:border-brand-red/20 font-black mb-8 shadow-inner"
                />
                <button 
                  onClick={async () => {
                    setIsBulkUpdating(true);
                    await fetch('/api/admin/products/bulk', { method: 'PATCH', body: JSON.stringify({ ids: selectedIds, category: bulkCategory }) });
                    fetchProducts();
                    setSelectedIds([]);
                    setIsBulkMoveModalOpen(false);
                    setIsBulkUpdating(false);
                    toast.success('تم النقل بنجاح');
                  }}
                  disabled={isBulkUpdating || !bulkCategory}
                  className="w-full bg-brand-black text-white py-6 rounded-3xl font-black shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all"
                >
                  {isBulkUpdating ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Check size={24}/>}
                  <span>تأكيد النقل الجماعي</span>
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD/EDIT DRAWER */}
      <AnimatePresence>
        {isPanelOpen && (
          <div className="fixed inset-0 z-[200] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPanelOpen(false)} className="absolute inset-0 bg-brand-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30 }} className="relative bg-white w-full lg:w-[500px] h-full shadow-2xl overflow-y-auto no-scrollbar flex flex-col border-r border-brand-gray">
               <div className="p-10 border-b bg-brand-cream/30 flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black text-brand-red font-serif">{editingProduct ? 'تعديل الصنف' : 'إضافة صنف جديد'}</h3>
                    <p className="text-[10px] uppercase font-bold text-brand-black/20 tracking-widest">Inventory Drawer Control</p>
                  </div>
                  <button onClick={() => setIsPanelOpen(false)} className="p-4 bg-white rounded-2xl shadow-sm border border-brand-gray hover:text-brand-red transition-all"><X size={24}/></button>
               </div>
               
               <form onSubmit={handleSubmit} className="p-10 space-y-10 flex-1">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-brand-black/20">Name (English)</label>
                        <input value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="w-full bg-brand-cream/50 border-2 border-brand-gray rounded-2xl p-5 outline-none focus:border-brand-red/20 font-black text-sm" dir="ltr"/>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-brand-black/20">الاسم (عربي)</label>
                        <input value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} className="w-full bg-brand-cream/50 border-2 border-brand-gray rounded-2xl p-5 outline-none focus:border-brand-red/20 font-black text-sm"/>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2 relative">
                        <label className="text-[10px] font-black uppercase text-brand-black/20">السعر (JOD)</label>
                        <DollarSign size={16} className="absolute right-5 top-12 text-brand-black/20"/>
                        <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-brand-cream/50 border-2 border-brand-gray rounded-2xl p-5 pr-12 outline-none focus:border-brand-red/20 font-black text-lg font-serif" dir="ltr"/>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-brand-black/20">التصنيف</label>
                        <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-brand-cream/50 border-2 border-brand-gray rounded-2xl p-5 outline-none focus:border-brand-red/20 font-black text-sm" placeholder="Sushi, Drinks..."/>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-brand-black/20">صورة المنتج</label>
                     <div className="relative group overflow-hidden rounded-[2.5rem] bg-brand-cream border-2 border-dashed border-brand-gray h-64 flex items-center justify-center">
                        <div className="absolute inset-0 bg-brand-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {formData.imageUrl ? (
                           <Image src={formData.imageUrl} alt="Preview" fill className="object-contain p-4 transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                           <div className="flex flex-col items-center gap-4 text-brand-black/10">
                              <Camera size={48} />
                              <span className="text-xs font-black uppercase">Preview Box</span>
                           </div>
                        )}
                     </div>
                     <input placeholder="رابط الصورة (URL)..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-brand-cream/50 border-2 border-brand-gray rounded-2xl p-5 outline-none focus:border-brand-red/20 font-black text-xs" dir="ltr"/>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-brand-black/20">الوصف</label>
                     <textarea rows={4} value={formData.descriptionAr} onChange={e => setFormData({...formData, descriptionAr: e.target.value})} className="w-full bg-brand-cream/50 border-2 border-brand-gray rounded-2xl p-5 outline-none focus:border-brand-red/20 font-black text-xs resize-none" />
                  </div>

                  <div className="pt-10">
                     <button className="w-full bg-brand-black text-white py-6 rounded-3xl font-black shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group">
                        <Save size={20} className="group-hover:rotate-12 transition-transform" />
                        <span>{editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج'}</span>
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
