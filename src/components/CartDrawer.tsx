import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  onClose: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  cartItems,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
  const formatKs = (num: number) => {
    return 'Ks ' + Number(num).toLocaleString();
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer container panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute inset-y-0 right-0 max-w-md w-full bg-white dark:bg-neutral-950 border-l border-neutral-200/50 dark:border-neutral-800/80 shadow-2xl flex flex-col z-10"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold font-serif text-neutral-900 dark:text-neutral-50">
                  Your Shopping Cart
                </h3>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-850 dark:text-neutral-250 hover:text-rose-500 flex items-center justify-center transition-transform active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items list */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              <AnimatePresence initial={false}>
                {cartItems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-20 text-neutral-400 dark:text-neutral-500 space-y-3"
                  >
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900/60 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-neutral-300 dark:text-neutral-600" />
                    </div>
                    <p className="text-sm font-semibold tracking-tight">Your cart is empty</p>
                    <p className="text-xs max-w-[200px] leading-relaxed mx-auto">
                      Explore our drops and discover curated pre-loved sneakers!
                    </p>
                  </motion.div>
                ) : (
                  cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      className="flex gap-4 p-3 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/30 dark:border-neutral-800/40 rounded-2xl relative"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl bg-neutral-100 dark:bg-neutral-900 flex-shrink-0"
                      />
                      
                      <div className="flex-grow min-w-0 pr-4">
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-50 truncate leading-snug">
                          {item.name}
                        </h4>
                        <div className="text-[10px] text-neutral-400 dark:text-neutral-550 mt-0.5">
                          {item.brand && `Brand: ${item.brand}`} {item.size && `• Size: ${item.size}`}
                        </div>
                        <span className="text-xs font-bold text-amber-500 block mt-1.5">
                          {formatKs(item.price)}
                        </span>

                        {/* Quantity picker control layout */}
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <button
                            onClick={() => onUpdateQty(item.id, -1)}
                            className="w-6 h-6 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-350 hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white dark:hover:text-neutral-950 flex items-center justify-center transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <span className="text-xs font-bold w-6 text-center text-neutral-800 dark:text-neutral-100">
                            {item.qty}
                          </span>

                          <button
                            onClick={() => onUpdateQty(item.id, 1)}
                            className="w-6 h-6 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-350 hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white dark:hover:text-neutral-950 flex items-center justify-center transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Remove item button */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="absolute top-3 right-3 text-neutral-400 hover:text-rose-500 transition-colors"
                        title="Remove pair"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer drawer checkout summary */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/40">
                <div className="flex justify-between items-center text-base font-bold text-neutral-900 dark:text-neutral-50 mb-4">
                  <span>Subtotal</span>
                  <span className="text-lg font-serif text-amber-500">{formatKs(subtotal)}</span>
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full py-4 rounded-full text-sm font-bold bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white dark:hover:text-neutral-950 active:scale-95 transition-all shadow-md shadow-neutral-950/15"
                >
                  Proceed to Checkout
                </button>

                <p className="text-[10px] text-center text-neutral-400 mt-3">
                  Restored items have limited stock. Complete check to secure.
                </p>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
