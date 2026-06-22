import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  onOpenOrder: (id: string) => void;
}

export default function ProductDetailModal({ product, onClose, onAddToCart, onOpenOrder }: ProductDetailModalProps) {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const isOutOfStock = product.stock <= 0;

  const formatKs = (num: number) => {
    return 'Ks ' + Number(num).toLocaleString();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal content body */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative max-w-4xl w-full bg-white dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-800/80 rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
        >
          {/* Close trigger button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/85 dark:bg-black/60 border border-neutral-200/50 dark:border-neutral-800/80 text-neutral-800 dark:text-neutral-200 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center justify-center shadow-lg transition-all active:scale-95 duration-200"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="overflow-y-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image side content */}
              <div className="bg-neutral-100 dark:bg-neutral-900/60 p-4 md:p-6 flex flex-col justify-center items-center gap-4">
                <div 
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-200/50 dark:bg-neutral-950/60 flex items-center justify-center cursor-zoom-in"
                >
                  <motion.img
                    src={images[activeImageIndex]}
                    alt={product.name}
                    animate={{ scale: isZoomed ? 1.6 : 1 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className={`w-full h-full object-cover select-none ${isZoomed ? 'cursor-zoom-out' : ''}`}
                  />
                  
                  {isZoomed && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white">
                      Click to minimize
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto py-2 w-full justify-start md:justify-center">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setActiveImageIndex(i);
                          setIsZoomed(false);
                        }}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-opacity ${
                          i === activeImageIndex 
                            ? 'border-amber-500 opacity-100' 
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`thumbnail-${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text metadata info side */}
              <div className="p-6 md:p-10 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] tracking-widest font-extrabold text-amber-500 uppercase">
                    {product.brand}
                  </span>
                  
                  <h2 className="text-2xl md:text-3xl font-extrabold font-serif text-neutral-900 dark:text-neutral-50 mt-1 mb-4 leading-tight">
                    {product.name}
                  </h2>

                  <div className="text-3xl font-bold font-serif text-amber-500 mb-6">
                    {formatKs(product.price)}
                  </div>

                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
                    {product.description}
                  </p>

                  {/* Detail spec grid layout */}
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center py-2.5 border-b border-neutral-100 dark:border-neutral-800/80">
                      <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase">Size</span>
                      <span className="text-sm font-bold font-mono text-neutral-950 dark:text-neutral-100">US {product.size}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2.5 border-b border-neutral-100 dark:border-neutral-800/80">
                      <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase">Condition Grade</span>
                      <span className="text-sm font-semibold text-neutral-950 dark:text-neutral-100">{product.condition}</span>
                    </div>

                    <div className="flex justify-between items-center py-2.5 border-b border-neutral-100 dark:border-neutral-800/80">
                      <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase">In-stock Status</span>
                      <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {product.stock > 0 ? `In Stock (${product.stock} pair)` : 'Sold Out'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom actions */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3.5">
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={isOutOfStock}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full text-sm font-bold tracking-wide transition-all ${
                      isOutOfStock
                        ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                        : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500 hover:text-amber-500 active:scale-95 cursor-pointer'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </button>

                  <button
                    onClick={() => onOpenOrder(product.id)}
                    disabled={isOutOfStock}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full text-sm font-bold tracking-wide transition-all ${
                      isOutOfStock
                        ? 'bg-neutral-200 dark:bg-neutral-800/40 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                        : 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white dark:hover:text-neutral-950 active:scale-95 cursor-pointer shadow-lg hover:shadow-xl shadow-neutral-950/20'
                    }`}
                  >
                    Order Instantly
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Security confidence badge */}
                <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>100% Authen-Verification Checklist Checked</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
