import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, addPosition } = useAppStore();

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const processingFee = subtotal * 0.01; // 1% fee
  const total = subtotal + processingFee;

  const handleCheckout = () => {
    // Create positions for each cart item
    cart.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addPosition({
          id: `purch-${Date.now()}-${i}`,
          item_name: item.product.name,
          item_icon: item.product.icon,
          purchase_amount: item.product.price,
          purchase_date: new Date().toISOString(),
        });
      }
    });

    clearCart();

    toast.success('Purchase complete!', {
      description: 'Head to Positions to configure your predictions.',
    });

    navigate('/terminal');
  };

  if (cart.length === 0) {
    return (
      <main className="container py-8">
        <div className="bg-white rounded-xl border border-border p-12 text-center shadow-card max-w-lg mx-auto">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add items from the store to get started
          </p>
          <Button onClick={() => navigate('/shop')}>
            Browse Store
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Checkout
        </h1>
        <p className="text-muted-foreground">
          Review your order • {cart.reduce((sum, item) => sum + item.quantity, 0)} items
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, index) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-border p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-2xl">
                    {item.product.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium border',
                          item.product.type === 'SERVICE' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          item.product.type === 'DIGITAL' && 'bg-blue-50 text-blue-700 border-blue-200',
                          item.product.type === 'PHYSICAL' && 'bg-purple-50 text-purple-700 border-purple-200'
                        )}
                      >
                        {item.product.type}
                      </span>
                    </div>
                    <h3 className="font-semibold">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.product.description}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2.5 hover:bg-muted transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold border-x border-border w-12 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2.5 hover:bg-muted transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right w-28">
                    <div className="text-lg font-bold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${item.product.price.toFixed(2)} each
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-border p-6 shadow-card">
            <h3 className="font-semibold mb-4 pb-4 border-b border-border">
              Order Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee (1%)</span>
                <span className="font-medium">${processingFee.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* How It Works Notice */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">
                How Winback Works
              </span>
            </div>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Make a prediction on Kalshi markets</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Set your reward & loss thresholds</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Get cashback if your prediction wins!</span>
              </li>
            </ul>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            className="w-full h-12"
            size="lg"
          >
            Complete Purchase
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By completing this purchase, you agree to the Terms of Service
          </p>
        </div>
      </div>
    </main>
  );
};

export default Cart;
