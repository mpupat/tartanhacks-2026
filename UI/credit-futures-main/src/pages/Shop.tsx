import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, PRODUCTS, Product } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { Plus, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['ALL', 'INFRASTRUCTURE', 'SECURITY', 'CONSULTING', 'HARDWARE', 'DESIGN', 'DIGITAL'];

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useAppStore();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} ADDED TO CART`, {
      description: 'Proceed to checkout to complete your crypto-backed purchase',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-grid-line bg-card hover:border-profit/50 transition-colors group"
    >
      <div className="p-4">
        {/* Type Badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={cn(
              'text-[10px] px-1.5 py-0.5 uppercase tracking-wider font-semibold',
              product.type === 'SERVICE' && 'bg-profit/20 text-profit',
              product.type === 'DIGITAL' && 'bg-blue-500/20 text-blue-400',
              product.type === 'PHYSICAL' && 'bg-purple-500/20 text-purple-400'
            )}
          >
            {product.type}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-sm font-semibold tracking-wide mb-2 group-hover:text-profit transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Price & Add */}
        <div className="flex items-center justify-between pt-3 border-t border-grid-line">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
              PRICE
            </div>
            <div className="text-lg font-bold mono-number text-profit">
              ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1 px-3 py-2 bg-profit/10 border border-profit/30 text-profit text-xs font-semibold uppercase tracking-wider hover:bg-profit hover:text-primary-foreground transition-colors"
          >
            <Plus className="w-3 h-3" />
            ADD
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<'ALL' | 'LOW' | 'MID' | 'HIGH'>('ALL');

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesPrice = true;
    if (priceRange === 'LOW') matchesPrice = product.price < 500;
    else if (priceRange === 'MID') matchesPrice = product.price >= 500 && product.price < 1500;
    else if (priceRange === 'HIGH') matchesPrice = product.price >= 1500;
    
    return matchesCategory && matchesSearch && matchesPrice;
  });

  return (
    <main className="container py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold tracking-widest text-profit mb-1">
          MARKETPLACE
        </h1>
        <p className="text-xs text-muted-foreground">
          CRYPTO-BACKED CREDIT SETTLEMENT | ALL PURCHASES BECOME TRADING POSITIONS
        </p>
      </div>

      {/* Filters */}
      <div className="border border-grid-line bg-card p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted border border-grid-line pl-10 pr-4 py-2 text-xs uppercase tracking-wider placeholder:text-muted-foreground focus:outline-none focus:border-profit"
            />
          </div>

          {/* Price Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              PRICE:
            </span>
            {(['ALL', 'LOW', 'MID', 'HIGH'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setPriceRange(range)}
                className={cn(
                  'px-2 py-1 text-[10px] uppercase tracking-wider font-semibold border transition-colors',
                  priceRange === range
                    ? 'bg-profit border-profit text-primary-foreground'
                    : 'border-grid-line text-muted-foreground hover:border-profit/50 hover:text-foreground'
                )}
              >
                {range}
                {range === 'LOW' && ' <$500'}
                {range === 'MID' && ' $500-1.5K'}
                {range === 'HIGH' && ' >$1.5K'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest mr-2">
            CATEGORY:
          </span>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold border transition-colors',
                selectedCategory === category
                  ? 'bg-profit border-profit text-primary-foreground'
                  : 'border-grid-line text-muted-foreground hover:border-profit/50 hover:text-foreground'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-4 gap-4">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="border border-grid-line bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            NO PRODUCTS MATCH YOUR FILTERS
          </p>
        </div>
      )}

      {/* Credit Notice */}
      <div className="mt-6 border border-profit/30 bg-profit/5 p-3">
        <p className="text-[10px] text-profit leading-relaxed text-center">
          ALL PURCHASES ARE COMPLETED VIA CRYPTO-BACKED CREDIT. UPON CHECKOUT, YOUR PURCHASE WILL
          BECOME A TRADING POSITION VISIBLE IN THE TERMINAL. CONFIGURE YOUR SETTLEMENT STRATEGY
          AFTER PURCHASE.
        </p>
      </div>
    </main>
  );
};

export default Shop;
