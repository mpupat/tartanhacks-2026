import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, PRODUCTS, Product } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { Plus, Filter, Search, ShoppingBag, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const CATEGORIES = ['All', 'Infrastructure', 'Security', 'Consulting', 'Hardware', 'Design', 'Digital'];

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useAppStore();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`Added to cart`, {
      description: `${product.name} • Set up your prediction after checkout`,
    });
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'SERVICE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DIGITAL': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PHYSICAL': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-card-hover hover:border-primary/20 transition-all duration-200 group"
    >
      {/* Product Image Placeholder */}
      <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
        <ShoppingBag className="w-10 h-10 text-gray-300" />
      </div>

      <div className="p-5">
        {/* Type Badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={cn(
              'text-xs px-2 py-1 rounded-full font-medium border',
              getTypeStyles(product.type)
            )}
          >
            {product.type}
          </span>
          <span className="text-xs text-muted-foreground">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Price & Add */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              Price
            </div>
            <div className="text-xl font-bold mono-number text-foreground">
              ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<'All' | 'Low' | 'Mid' | 'High'>('All');

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category.toUpperCase() === selectedCategory.toUpperCase();
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesPrice = true;
    if (priceRange === 'Low') matchesPrice = product.price < 500;
    else if (priceRange === 'Mid') matchesPrice = product.price >= 500 && product.price < 1500;
    else if (priceRange === 'High') matchesPrice = product.price >= 1500;

    return matchesCategory && matchesSearch && matchesPrice;
  });

  return (
    <main className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Store
        </h1>
        <p className="text-muted-foreground">
          Every purchase becomes a prediction opportunity
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-5 mb-8 shadow-card">
        <div className="flex items-center gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Price Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Price:
            </span>
            {(['All', 'Low', 'Mid', 'High'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setPriceRange(range)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg border transition-all',
                  priceRange === range
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                {range}
                {range === 'Low' && ' <$500'}
                {range === 'Mid' && ' $500-1.5K'}
                {range === 'High' && ' >$1.5K'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-4 h-4 text-muted-foreground" />
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-full border transition-all',
                selectedCategory === category
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-4 gap-6">
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
        <div className="bg-white rounded-xl border border-border p-12 text-center shadow-card">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No products match your filters
          </p>
        </div>
      )}

      {/* Info Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Tag className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-sm text-blue-700 leading-relaxed">
            All purchases are made with your Winback card. After checkout, you'll set up your
            prediction in the Positions tab. Make the right call and win cashback!
          </p>
        </div>
      </div>
    </main>
  );
};

export default Shop;
