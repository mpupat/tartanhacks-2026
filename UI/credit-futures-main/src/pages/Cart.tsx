import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, addPosition, xrpPrice } = useAppStore();

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const processingFee = subtotal * 0.01; // 1% fee
  const total = subtotal + processingFee;

  const handleCheckout = () => {
    // Create positions for each cart item
    cart.forEach((item) => {
      const totalPrice = item.product.price * item.quantity;
      const xrpAmount = totalPrice / xrpPrice;
      
      addPosition({
        productId: item.product.id,
        productName: item.product.name,
        purchaseAmount: totalPrice,
        xrpInvested: xrpAmount,
        xrpEntryPrice: xrpPrice,
        direction: 'UNSET',
        maxPayment: totalPrice * 1.05, // +5% default
        minPayment: totalPrice * 0.8, // -20% default
        timeLimit: 3,
        startTime: Date.now(),
        status: 'UNCONFIGURED',
      });
    });

    clearCart();
    
    toast.success('PURCHASE COMPLETE', {
      description: 'Your positions are now visible in the Terminal. Configure your trading strategy.',
    });

    navigate('/terminal');
  };

  if (cart.length === 0) {
    return (
      <main className="container py-6">
        <div className="border border-grid-line bg-card p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-bold tracking-widest mb-2">CART EMPTY</h2>
          <p className="text-sm text-muted-foreground mb-6">
            ADD ITEMS FROM THE MARKETPLACE TO BEGIN
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-profit text-primary-foreground text-xs font-semibold uppercase tracking-wider hover:bg-profit/80 transition-colors"
          >
            BROWSE MARKETPLACE
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold tracking-widest text-profit mb-1">
          CHECKOUT
        </h1>
        <p className="text-xs text-muted-foreground">
          CRYPTO-BACKED CREDIT SETTLEMENT | REVIEW YOUR ORDER
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="col-span-2 space-y-4">
          {cart.map((item, index) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-grid-line bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 uppercase tracking-wider font-semibold',
                        item.product.type === 'SERVICE' && 'bg-profit/20 text-profit',
                        item.product.type === 'DIGITAL' && 'bg-blue-500/20 text-blue-400',
                        item.product.type === 'PHYSICAL' && 'bg-purple-500/20 text-purple-400'
                      )}
                    >
                      {item.product.type}
                    </span>
                    <h3 className="text-sm font-semibold tracking-wide">
                      {item.product.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.product.description}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-grid-line">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 hover:bg-muted transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-4 py-2 text-sm font-bold mono-number border-x border-grid-line">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 hover:bg-muted transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right w-32">
                    <div className="text-lg font-bold mono-number text-profit">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      ${item.product.price.toFixed(2)} EACH
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-muted-foreground hover:text-loss transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="border border-grid-line bg-card p-4">
            <h3 className="text-xs font-semibold tracking-wider mb-4 pb-3 border-b border-grid-line">
              ORDER SUMMARY
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SUBTOTAL</span>
                <span className="mono-number">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">PROCESSING FEE (1%)</span>
                <span className="mono-number">${processingFee.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-grid-line flex justify-between">
                <span className="font-semibold">TOTAL</span>
                <span className="text-xl font-bold mono-number text-profit">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Settlement Notice */}
          <div className="border border-warning/30 bg-warning/5 p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-warning tracking-wider">
                CRYPTO-BACKED CREDIT
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              This purchase will be settled via crypto-backed credit. Upon checkout:
            </p>
            <ul className="text-[10px] text-muted-foreground mt-2 space-y-1">
              <li>• Purchase amount invested in XRP</li>
              <li>• Position appears on your Terminal</li>
              <li>• Configure LONG or SHORT strategy</li>
              <li>• Final payment based on XRP movement</li>
            </ul>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-profit text-primary-foreground text-sm font-bold uppercase tracking-wider hover:bg-profit/80 transition-colors"
          >
            COMPLETE PURCHASE
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[10px] text-center text-muted-foreground">
            BY COMPLETING THIS PURCHASE, YOU AGREE TO THE CRYPTO CREDIT TERMS
          </p>
        </div>
      </div>
    </main>
  );
};

export default Cart;
