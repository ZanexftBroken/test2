import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Sun, 
  Moon, 
  ShoppingBag, 
  Menu, 
  X, 
  ChevronUp, 
  Sparkles,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  ThumbsUp,
  Award,
  Truck
} from 'lucide-react';

import { Product, CartItem, ToastMessage } from './types';
import { FALLBACK_PRODUCTS } from './data';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import OrderFormModal from './components/OrderFormModal';
import CartDrawer from './components/CartDrawer';
import ToastContainer from './components/Toast';

export default function App() {
  // State managers
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Interface visibility states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeDetailProductId, setActiveDetailProductId] = useState<string | null>(null);
  const [activeOrderProductId, setActiveOrderProductId] = useState<string | null>(null); // if null, checkout cart
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Load theme and cart initially
  useEffect(() => {
    // Theme sync
    const storedTheme = localStorage.getItem('cc_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = storedTheme === 'dark' || (!storedTheme && prefersDark);
    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Cart sync
    const storedCart = localStorage.getItem('cc_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (err) {
        console.error('Failed to parse cart localstorage', err);
      }
    }

    // Scroll listeners
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hydrate catalog from RTDB
  useEffect(() => {
    setIsLoading(true);
    fetch('https://coolchips-default-rtdb.asia-southeast1.firebasedatabase.app/products.json')
      .then((res) => {
        if (!res.ok) throw new Error('Database response not OK');
        return res.json();
      })
      .then((data) => {
        if (data && typeof data === 'object') {
          const loaded: Product[] = Object.entries(data).map(([id, val]: [string, any]) => ({
            id,
            ...val
          }));
          if (loaded.length > 0) {
            setProducts(loaded);
          } else {
            setProducts(FALLBACK_PRODUCTS);
          }
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      })
      .catch((err) => {
        console.warn('Firebase loading timed out, loading local premium preset store catalog', err);
        setProducts(FALLBACK_PRODUCTS);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Sync cart edits with localstorage
  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('cc_cart', JSON.stringify(updatedCart));
  };

  // Toast notifier triggers
  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Theme changing trigger
  const toggleTheme = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    if (newVal) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cc_theme', 'light');
    }
    addToast(`${newVal ? 'Dark' : 'Light'} visual scheme loaded`, 'info');
  };

  // Cart action triggers
  const handleAddToCart = (product: Product) => {
    const targetItem = cart.find((item) => item.id === product.id);
    if (targetItem) {
      if (targetItem.qty >= product.stock) {
        addToast(`Only ${product.stock} pair in stock for this grail!`, 'error');
        return;
      }
      const updated = cart.map((item) => 
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      );
      saveCartToStorage(updated);
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand,
        size: product.size,
        qty: 1
      };
      saveCartToStorage([...cart, newItem]);
    }
    addToast('Secured in your visual cart!');
  };

  const handleUpdateQty = (id: string, delta: number) => {
    const item = cart.find((c) => c.id === id);
    if (!item) return;
    
    // Check stock if incrementing
    if (delta > 0) {
      const targetProduct = products.find((p) => p.id === id);
      if (targetProduct && item.qty >= targetProduct.stock) {
        addToast(`Maximum stock limit reached!`, 'error');
        return;
      }
    }

    const updated = cart.map((c) => {
      if (c.id === id) {
        const newQty = c.qty + delta;
        return newQty > 0 ? { ...c, qty: newQty } : null;
      }
      return c;
    }).filter(Boolean) as CartItem[];

    saveCartToStorage(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = cart.filter((c) => c.id !== id);
    saveCartToStorage(updated);
    addToast('Pair removed from cart', 'info');
  };

  // Checkout handling
  const handleOpenDirectOrder = (id: string) => {
    setActiveOrderProductId(id);
    setIsOrderModalOpen(true);
  };

  const handleOpenCartCheckout = () => {
    setActiveOrderProductId(null);
    setIsOrderModalOpen(true);
  };

  const handleOrderSuccess = () => {
    addToast('Your cash-on-delivery order was registered successfully!', 'success');
    if (!activeOrderProductId) {
      // Cart checkout succeeds, flush cart
      saveCartToStorage([]);
    }
  };

  // Extract distinct selectors dynamically from products catalog list
  const distinctBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort();
  const distinctSizes = Array.from(new Set(products.map((p) => p.size).filter(Boolean))).sort(
    (a, b) => Number(a) - Number(b)
  );

  // Dynamic filter lists logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch = searchQuery.trim() === '' || 
      `${p.name} ${p.brand} ${p.size} ${p.price}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBrand = selectedBrand === '' || p.brand === selectedBrand;
    const matchesSize = selectedSize === '' || String(p.size) === String(selectedSize);
    const matchesCondition = selectedCondition === '' || p.condition === selectedCondition;

    return matchesSearch && matchesBrand && matchesSize && matchesCondition;
  });

  // Sorts
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (selectedSort === 'priceLow') return a.price - b.price;
    if (selectedSort === 'priceHigh') return b.price - a.price;
    if (selectedSort === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  // Latest Drops (Fresh newarrivals)
  const freshDrops = [...products]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 4);

  // Active product detail searcher
  const activeDetailProduct = products.find((p) => p.id === activeDetailProductId) || null;

  // Formatting currency
  const formatKs = (num: number) => {
    return 'Ks ' + Number(num).toLocaleString();
  };

  const cartTotalQty = cart.reduce((acc, c) => acc + c.qty, 0);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 selection:bg-amber-500 selection:text-neutral-950 transition-colors duration-500">
      
      {/* Toast floating system overlays */}
      <ToastContainer toasts={toasts} onRemove={handleRemoveToast} />

      {/* FIXED FLOATING CORE NAVIGATION HEADER */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/60 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          
          {/* Logo brand */}
          <a href="#home" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              CC
            </div>
            <span className="font-serif font-extrabold text-2xl tracking-tight leading-none bg-gradient-to-r from-neutral-950 via-neutral-850 to-amber-500 dark:from-neutral-50 dark:via-neutral-200 dark:to-amber-400 bg-clip-text text-transparent">
              Cool<span className="text-amber-500 font-sans font-medium text-xl ml-0.5">Chips</span>
            </span>
          </a>

          {/* Desktop link directories */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
            <li>
              <a href="#home" className="hover:text-amber-500 transition-colors">Home</a>
            </li>
            <li>
              <a href="#shop" className="hover:text-amber-500 transition-colors">Featured Drop</a>
            </li>
            <li>
              <a href="#new" className="hover:text-amber-500 transition-colors">New Arrivals</a>
            </li>
            <li>
              <a href="#why-us" className="hover:text-amber-500 transition-colors">Our Standard</a>
            </li>
            <li>
              <a href="#contact" className="hover:text-amber-500 transition-colors">Flagship Store</a>
            </li>
          </ul>

          {/* Nav interactive buttons controls list */}
          <div className="flex items-center gap-3">
            
            {/* Dynamic Search Expand panel input */}
            <div className={`relative flex items-center transition-all duration-300 origin-right ${isSearchOpen ? 'w-48 sm:w-64' : 'w-0 overflow-hidden opacity-0'}`}>
              <input
                type="text"
                placeholder="Search kicks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs px-4 py-2 pl-9 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/40 text-neutral-900 dark:text-neutral-50 outline-none focus:border-amber-500 transition-all"
              />
              <Search className="w-4.5 h-4.5 absolute left-3 text-neutral-400 pointer-events-none" />
            </div>

            {/* Collapsed Search toggler trigger */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-10 h-10 rounded-full border border-neutral-200/50 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-center text-neutral-800 dark:text-neutral-250 hover:text-amber-500 hover:scale-105 active:scale-95 transition-all outline-none"
              title="Search Drop catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Visual Scheme Switcher icon-btn */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full border border-neutral-200/50 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-center text-neutral-800 dark:text-neutral-250 hover:text-amber-500 hover:scale-105 active:scale-95 transition-all outline-none"
              title="Switch light/dark design theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Shopping Cart Trigger icon-btn with animated bubble */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-10 h-10 rounded-full border border-neutral-200/50 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-center text-neutral-800 dark:text-neutral-250 hover:text-amber-500 hover:scale-105 active:scale-95 transition-all relative outline-none"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {cartTotalQty > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-amber-500 text-neutral-950 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce"
                  >
                    {cartTotalQty}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Mobile directory drawer trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-full border border-neutral-200/50 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-center text-neutral-800 dark:text-neutral-250 hover:text-amber-500 transition-all outline-none"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </nav>

      {/* MOBILE FLOATING MENU DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-[73px] inset-x-0 bg-neutral-55 dark:bg-neutral-950/95 backdrop-blur-2xl border-b border-neutral-200/50 dark:border-neutral-800/80 z-30 shadow-xl p-6"
          >
            <ul className="flex flex-col gap-4 text-base font-bold text-center">
              <li>
                <a 
                  href="#home" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-neutral-600 dark:text-neutral-300 hover:text-amber-500"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#shop" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-neutral-600 dark:text-neutral-300 hover:text-amber-500"
                >
                  Featured Drop
                </a>
              </li>
              <li>
                <a 
                  href="#new" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-neutral-600 dark:text-neutral-300 hover:text-amber-500"
                >
                  New Arrivals
                </a>
              </li>
              <li>
                <a 
                  href="#why-us" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-neutral-600 dark:text-neutral-300 hover:text-amber-500"
                >
                  Our Standard
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-neutral-600 dark:text-neutral-300 hover:text-amber-500"
                >
                  Flagship Store
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IMMERSIVE HEADER HERO INTERFACE */}
      <header id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 px-5">
        {/* Background art and light ambient nodes */}
        <div className="absolute inset-0 z-0 bg-neutral-100 dark:bg-neutral-950 transition-colors duration-500">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
          {/* Subtle line background mask */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>

        {/* Hero sneaker preview photo background element */}
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-10 dark:opacity-[0.14]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80')" }} />

        {/* Hero content container layout */}
        <div className="relative max-w-4xl mx-auto text-center z-10 space-y-6 px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-300/30 dark:border-neutral-800/40 px-3.5 py-1.5 rounded-full shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-neutral-800 dark:text-neutral-200">
              Curated Thrift Sneakers Drop
            </span>
          </motion.div>

          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl sm:text-6xl md:text-8xl font-serif font-extrabold tracking-tight leading-[1.05] text-neutral-900 dark:text-neutral-50"
          >
            Step into <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 font-medium">icons</em><br className="hidden sm:inline" /> that click.
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-base sm:text-xl text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto font-sans leading-relaxed"
          >
            Authenticated, professionally refreshed grails at a fraction of stock prices. High-end sneakers restored and ready to wear.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="pt-6"
          >
            <a 
              href="#shop" 
              className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-amber-500 dark:bg-white dark:hover:bg-amber-500 text-white dark:text-neutral-950 dark:hover:text-neutral-950 px-8 py-4.5 rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 active:scale-95"
            >
              Explore the drop
              <span className="text-xl">➔</span>
            </a>
          </motion.div>
        </div>
      </header>

      {/* CORE PRODUCTS CATALOG / SHOP SECTION */}
      <section id="shop" className="max-w-7xl mx-auto px-5 py-24 scroll-mt-20">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500">The Drop</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-neutral-900 dark:text-neutral-50 mt-1.5 mb-3 leading-tight tracking-tight">
            Featured Catalogue
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
            Authenticated, sized pairs. Selected on condition, depth-cleaned with steam and sanitization packs.
          </p>
        </div>

        {/* FILTERS OVERLAYS CONTROL STRIP */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 max-w-4xl mx-auto bg-neutral-100/50 dark:bg-neutral-900/10 border border-neutral-200/50 dark:border-neutral-800/40 p-4 rounded-3xl backdrop-blur-md">
          {/* Brand option select */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-4 py-2.5 text-xs font-semibold rounded-2xl bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-350 border border-neutral-200/50 dark:border-neutral-800/80 outline-none focus:border-amber-500 hover:border-amber-500/40 transition-colors"
          >
            <option value="">All Brands</option>
            {distinctBrands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Size option select */}
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="px-4 py-2.5 text-xs font-semibold rounded-2xl bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-350 border border-neutral-200/50 dark:border-neutral-800/80 outline-none focus:border-amber-500 hover:border-amber-500/40 transition-colors"
          >
            <option value="">All Sizes</option>
            {distinctSizes.map((s) => (
              <option key={s} value={s}>US {s}</option>
            ))}
          </select>

          {/* Condition option select */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-4 py-2.5 text-xs font-semibold rounded-2xl bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-350 border border-neutral-200/50 dark:border-neutral-800/80 outline-none focus:border-amber-500 hover:border-amber-500/40 transition-colors"
          >
            <option value="">All Conditions</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>

          {/* Sorter choice option */}
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="px-4 py-2.5 text-xs font-semibold rounded-2xl bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-350 border border-neutral-200/50 dark:border-neutral-800/80 outline-none focus:border-amber-500 hover:border-amber-500/40 transition-colors ml-auto"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priceLow">Price: Low ➔ High</option>
            <option value="priceHigh">Price: High ➔ Low</option>
          </select>
        </div>

        {/* PRODUCTS DYNAMIC GRID RENDER */}
        {isLoading ? (
          /* Loading skeletons frame list */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8).fill(null).map((_, i) => (
              <div 
                key={i} 
                className="bg-neutral-100 dark:bg-white/5 border border-neutral-200/35 dark:border-white/5 rounded-3xl aspect-[3/4] animate-pulse"
              />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          /* Empty filters results search placeholder */
          <div className="text-center py-20 bg-neutral-100/50 dark:bg-neutral-900/10 border border-neutral-200/40 dark:border-neutral-800/60 rounded-3xl max-w-xl mx-auto">
            <ShoppingBag className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
            <span className="text-lg font-bold block mb-1">No matches found</span>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-sm mx-auto leading-relaxed">
              We couldn't locate any pre-loved sneaker pairs matching your selected filtering options. Try clearing filters or broaden search input keys!
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBrand('');
                setSelectedSize('');
                setSelectedCondition('');
              }}
              className="mt-5 px-5 py-2.5 rounded-full text-xs font-bold bg-neutral-950 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Display catalog cards list grid layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <AnimatePresence>
              {sortedProducts.map((p, index) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={index}
                  onOpenDetail={setActiveDetailProductId}
                  onOpenOrder={handleOpenDirectOrder}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* NEW ARRIVALS DROPS SLIDE ROW SECTION */}
      <section id="new" className="bg-neutral-100/40 dark:bg-neutral-900/20 border-t border-b border-neutral-200/50 dark:border-neutral-800/40 py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-5">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500">Fresh In</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-neutral-900 dark:text-neutral-50 mt-1 leading-tight tracking-tight">
                New Arrivals
              </h2>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
              The latest restorations uploaded this week. Once sold, they're gone!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array(4).fill(null).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-neutral-200/40 dark:bg-white/5 border border-neutral-350 dark:border-white/5 rounded-3xl aspect-[3/4] animate-pulse"
                />
              ))
            ) : freshDrops.length === 0 ? (
              <div className="col-span-full text-center py-12 text-neutral-450 dark:text-neutral-500">
                No new drops uploaded yet. Stay tuned!
              </div>
            ) : (
              freshDrops.map((p, index) => (
                <ProductCard
                  key={`new-${p.id}`}
                  product={p}
                  index={index}
                  onOpenDetail={setActiveDetailProductId}
                  onOpenOrder={handleOpenDirectOrder}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* OUR STANDARD STANDARD EXCELLENCE SECTION (Bento grid style) */}
      <section id="why-us" className="max-w-7xl mx-auto px-5 py-24 scroll-mt-20">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500">Our Standard</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-neutral-900 dark:text-neutral-50 mt-1.5 mb-3 leading-tight tracking-tight">
            Why Cool Chips?
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Changing the game of vintage pre-loved sneakers. Here are our strict quality check guarantees.
          </p>
        </div>

        {/* Bento grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/80 p-8 rounded-3xl text-left hover:border-amber-500 hover:shadow-xl hover:shadow-neutral-950/5 dark:hover:shadow-none transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">100% Authentic Checking</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Every single silhouette passes an advanced multi-point authentication inspection covering size tags, stitching precision, and materials structure alignment. No flips or replica errors.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/80 p-8 rounded-3xl text-left hover:border-amber-500 hover:shadow-xl hover:shadow-neutral-950/5 dark:hover:shadow-none transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Multi-step Restorations</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Each pair undergoes a high-end deep hygienic clean. We sanitize using active steam, re-condition worn meshes, treat outsoles properly, and deodorize with organic bamboo coal inserts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/80 p-8 rounded-3xl text-left hover:border-amber-500 hover:shadow-xl hover:shadow-neutral-950/5 dark:hover:shadow-none transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
              <ThumbsUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Honest Grading Specs</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              No hidden scuffs or sudden wear. We list detailed zoom photos and precise condition grades (Excellent, Like New, Good) so there are no surprises upon final box delivery.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/80 p-8 rounded-3xl text-left hover:border-amber-500 hover:shadow-xl hover:shadow-neutral-950/5 dark:hover:shadow-none transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Collector Boxing</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              We bundle each purchase inside premium, sturdy collection packaging sheets to protect against friction. Includes high-end spare lace packs where noted in descriptions!
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/80 p-8 rounded-3xl text-left hover:border-amber-500 hover:shadow-xl hover:shadow-neutral-950/5 dark:hover:shadow-none transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Express Cash Local Drop</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Guaranteed nationwide delivery securely wrapped and monitored. Fully cashless checkups — pay exclusively on final box handover via Cash on Delivery networks.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/80 p-8 rounded-3xl text-left hover:border-amber-500 hover:shadow-xl hover:shadow-neutral-950/5 dark:hover:shadow-none transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">24/7 Hotline Support</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Need active sizing advice or want to discuss pre-owned material conditions? Call our Yangon store directly or contact us on Telegram, Viber, or Email!
            </p>
          </div>
          
        </div>
      </section>

      {/* CONTACT PIN / FLAGSHIP HUB GEOLOCATION MODULE */}
      <section id="contact" className="scroll-mt-20 py-24 bg-neutral-150/40 dark:bg-neutral-950/40 border-t border-neutral-200/50 dark:border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-5">
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500">Get In Touch</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-neutral-900 dark:text-neutral-50 mt-1.5 mb-3 leading-tight tracking-tight">
              Flagship Headquarter Hub
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Stop by our cozy physical showroom, inspect our kicks live, or dial our active service.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto items-stretch">
            
            {/* Contact text grid indices */}
            <div className="flex flex-col gap-4">
              
              <div className="flex items-center gap-4 p-5 bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/85 rounded-2xl shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-neutral-950" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-neutral-400 block">Phone Hotline</span>
                  <a href="tel:09963222874" className="text-base font-bold text-neutral-900 dark:text-neutral-50 hover:text-amber-500 transition-colors">
                    09963222874
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/85 rounded-2xl shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-neutral-950" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-neutral-400 block">Viber Hotline</span>
                  <a href="viber://chat?number=%2B9509963222874" className="text-base font-bold text-neutral-900 dark:text-neutral-50 hover:text-amber-500 transition-colors">
                    +95 09963222874
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/85 rounded-2xl shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center flex-shrink-0">
                  <Send className="w-5 h-5 text-neutral-950" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-neutral-400 block">Telegram Hub</span>
                  <a href="https://t.me/coolchips" target="_blank" rel="noopener noreferrer" className="text-base font-bold text-neutral-900 dark:text-neutral-50 hover:text-amber-500 transition-colors">
                    @coolchips
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/85 rounded-2xl shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-neutral-950" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-neutral-400 block">Open Store Hours</span>
                  <span className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                    Open Daily: 10:00 AM – 9:00 PM
                  </span>
                </div>
              </div>

            </div>

            {/* Geolocation virtual representation map card */}
            <div className="bg-gradient-to-br from-amber-550/15 via-amber-500/5 to-transparent border border-neutral-200/55 dark:border-neutral-800/80 p-8 sm:p-10 rounded-3xl flex flex-col justify-center items-center text-center gap-5 min-h-[350px] relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 to-transparent pointer-events-none" />
              
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 rounded-full flex items-center justify-center shadow-lg relative z-10 animate-bounce">
                <MapPin className="w-9 h-9" />
              </div>

              <div className="space-y-2 relative z-10">
                <h3 className="text-2xl font-serif font-extrabold">Cool Chips Flagship</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed mx-auto">
                  No. 128B, Pyay Road, Kamayut Township,<br />
                  Yangon, Myanmar
                </p>
              </div>

              <div className="flex gap-2 flex-wrap justify-center relative z-10 pt-3">
                <a
                  href="tel:09963222874"
                  className="px-5 py-2.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold rounded-full hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-neutral-950 transition-all active:scale-95"
                >
                  Call Showroom
                </a>
                <a
                  href="viber://chat?number=%2B9509963222874"
                  className="px-5 py-2.5 bg-neutral-100 dark:bg-neutral-900 text-neutral-850 dark:text-neutral-255 text-xs font-bold rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 transition-all active:scale-95"
                >
                  Viber Live
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER DIRECTORIES AND COPYRIGHT INFO */}
      <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-800/40 py-16 px-5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          <div className="space-y-4">
            <h4 className="font-serif font-extrabold text-2xl text-white">
              Cool<span className="text-amber-500 font-sans font-medium text-lg ml-0.5">Chips</span>
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
              Yangon's premier boutique drops on vintage pre-loved kicks. We inspect, clean, and restore icons to last, so they don't break your bank.
            </p>
            <div className="flex gap-3 text-xs text-neutral-400 pt-2">
              <span className="bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-md">COD Supported</span>
              <span className="bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-md">Verified Authentic</span>
            </div>
          </div>

          <div className="space-y-3 mr-auto md:mr-0">
            <h5 className="font-bold text-xs uppercase tracking-widest text-[#d4af37]">Quick Links</h5>
            <ul className="text-xs space-y-2.5 text-neutral-400">
              <li><a href="#home" className="hover:text-amber-500">Home Directory</a></li>
              <li><a href="#shop" className="hover:text-amber-500">Drop Catalogue</a></li>
              <li><a href="#new" className="hover:text-amber-500">New Additions</a></li>
              <li><a href="#why-us" className="hover:text-amber-500">Our Standard</a></li>
              <li><a href="#contact" className="hover:text-amber-500">Yangon Flagship Pin</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-widest text-[#d4af37]">Support Help</h5>
            <ul className="text-xs space-y-2.5 text-neutral-400">
              <li><a href="#about" className="hover:text-amber-500">Size Alignment Guide</a></li>
              <li><a href="#about" className="hover:text-amber-500">Condition Categories</a></li>
              <li><a href="#about" className="hover:text-amber-500">Delivery Guidelines</a></li>
              <li><a href="#about" className="hover:text-amber-500">Authen-Verification Checklist</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-widest text-[#d4af37]">Get Connected</h5>
            <p className="text-xs text-neutral-400">
              Email support feedback:<br />
              <strong className="text-neutral-200">officialzane2007@gmail.com</strong>
            </p>
            <p className="text-xs text-neutral-400 pt-1">
              Store direct line:<br />
              <strong className="text-neutral-200">09963222874</strong>
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-neutral-900 text-center text-xs text-neutral-500">
          © 2026 Cool Chips Luxury Thrift. Built with high-fidelity React animations. All rights reserved.
        </div>
      </footer>

      {/* INTERACTIVE SCROLL TO TOP OVERLAY PIN */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg hover:bg-neutral-900 hover:text-amber-500 hover:-translate-y-1 transition-all outline-none"
            title="Scroll back to Top"
          >
            <ChevronUp className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* CORE MODALS DRAWER LIST */}
      
      {/* Product Detail overlay modal */}
      <AnimatePresence>
        {activeDetailProductId && (
          <ProductDetailModal
            product={activeDetailProduct}
            onClose={() => setActiveDetailProductId(null)}
            onAddToCart={(p) => {
              handleAddToCart(p);
              setActiveDetailProductId(null);
            }}
            onOpenOrder={(id) => {
              setActiveDetailProductId(null);
              handleOpenDirectOrder(id);
            }}
          />
        )}
      </AnimatePresence>

      {/* Cash on delivery order confirmation modal */}
      <AnimatePresence>
        {isOrderModalOpen && (
          <OrderFormModal
            productId={activeOrderProductId}
            cartItems={cart}
            allProducts={products}
            onClose={() => setIsOrderModalOpen(false)}
            onSuccess={handleOrderSuccess}
          />
        )}
      </AnimatePresence>

      {/* Slide-over interactive shopping cart */}
      <CartDrawer
        isOpen={isCartOpen}
        cartItems={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          handleOpenCartCheckout();
        }}
      />

    </div>
  );
}
