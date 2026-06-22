import React from 'react';
import { motion } from 'motion/react';
import { Tag } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: React.Key | string;
  product: Product;
  index: number;
  onOpenDetail: (id: string) => void;
  onOpenOrder: (id: string) => void;
}

export default function ProductCard({ product, index, onOpenDetail, onOpenOrder }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 2;

  // Format currency
  const formatKs = (num: number) => {
    return 'Ks ' + Number(num).toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4), ease: 'easeOut' }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      onClick={() => onOpenDetail(product.id)}
      className="group relative flex flex-col justify-between h-full bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/60 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl dark:hover:shadow-2xl hover:border-amber-500/50 transition-colors duration-300 backdrop-blur-md"
    >
      {/* Badge / ribbons */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {isOutOfStock ? (
          <span className="bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            Sold Out
          </span>
        ) : isLowStock ? (
          <span className="bg-amber-500 text-neutral-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm animate-pulse">
            Low Stock
          </span>
        ) : null}
        
        <span className="bg-white/80 dark:bg-black/70 text-neutral-800 dark:text-neutral-200 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-neutral-200/30 dark:border-neutral-700/30 shadow-xs flex items-center gap-1">
          <Tag className="w-2.5 h-2.5 text-amber-500" />
          {product.condition}
        </span>
      </div>

      {/* Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-200/40 dark:bg-neutral-900/65 flex items-center justify-center">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {/* Subtle hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info container */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Brand */}
        <span className="text-[10px] tracking-widest font-extrabold text-amber-500 uppercase mb-1">
          {product.brand}
        </span>
        
        {/* Title */}
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mb-2 line-clamp-2 leading-snug group-hover:text-amber-500 transition-colors">
          {product.name}
        </h3>

        {/* Sneaker metadata */}
        <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
          <span className="bg-neutral-100 dark:bg-neutral-800/80 px-2.5 py-0.5 rounded-md font-mono">
            Size: {product.size}
          </span>
          <span className="font-medium">•</span>
          <span>{product.stock > 0 ? `${product.stock} left` : 'Out of stock'}</span>
        </div>

        {/* Short description */}
        <p className="text-xs text-neutral-500 dark:text-muted line-clamp-2 mb-4 leading-relaxed flex-grow">
          {product.description}
        </p>

        {/* Price and checkout action */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-neutral-400 dark:text-neutral-500 tracking-tight">Price</span>
            <span className="text-lg font-bold font-serif text-neutral-900 dark:text-neutral-100">
              {formatKs(product.price)}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenOrder(product.id);
            }}
            disabled={isOutOfStock}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
              isOutOfStock
                ? 'bg-neutral-200 dark:bg-neutral-800/50 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                : 'bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-950 hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white dark:hover:text-neutral-950 active:scale-95'
            }`}
          >
            {isOutOfStock ? 'Sold Out' : 'Buy Now'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
