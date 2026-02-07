import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, TrendingUp, BarChart3, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarketCard } from '@/components/markets/MarketCard';
import { MarketDetailModal } from '@/components/markets/MarketDetailModal';
import type { KalshiMarket, MarketCategory, MarketSortOption } from '@/types/kalshi';
import { fetchMarkets, ALL_CATEGORIES, CATEGORY_CONFIG } from '@/services/kalshiService';
import { useAppStore } from '@/store/appStore';

const SORT_OPTIONS: { value: MarketSortOption; label: string; icon: React.ElementType }[] = [
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'volume', label: 'Volume', icon: BarChart3 },
    { value: 'ending_soon', label: 'Ending Soon', icon: Clock },
    { value: 'new', label: 'New', icon: Sparkles },
];

export default function Explorer() {
    const [markets, setMarkets] = useState<KalshiMarket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'all'>('all');
    const [sortBy, setSortBy] = useState<MarketSortOption>('trending');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMarket, setSelectedMarket] = useState<KalshiMarket | null>(null);
    const [showSavedOnly, setShowSavedOnly] = useState(false);

    const { savedMarkets } = useAppStore();

    useEffect(() => {
        loadMarkets();
    }, [selectedCategory, sortBy, searchQuery]);

    const loadMarkets = async () => {
        setLoading(true);
        const data = await fetchMarkets({
            category: selectedCategory,
            sortBy,
            search: searchQuery,
        });
        setMarkets(data);
        setLoading(false);
    };

    const displayedMarkets = showSavedOnly
        ? markets.filter(m => savedMarkets.some(s => s.ticker === m.ticker))
        : markets;

    return (
        <main className="container py-8">
            {/* Header */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        Market Explorer
                    </h1>
                    <p className="text-muted-foreground">
                        Discover prediction markets and find your next winning trade
                    </p>
                </motion.div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4 mb-8">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search markets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />

                    {/* Saved Markets Toggle */}
                    <button
                        onClick={() => setShowSavedOnly(!showSavedOnly)}
                        className={cn(
                            'absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                            showSavedOnly
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Star className={cn('w-4 h-4', showSavedOnly && 'fill-current')} />
                        <span>Saved ({savedMarkets.length})</span>
                    </button>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={cn(
                            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                            selectedCategory === 'all'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                        )}
                    >
                        All Markets
                    </button>
                    {ALL_CATEGORIES.map((category) => {
                        const config = CATEGORY_CONFIG[category];
                        return (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={cn(
                                    'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                                    selectedCategory === category
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <span>{config.icon}</span>
                                <span>{config.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    {SORT_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.value}
                                onClick={() => setSortBy(option.value)}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                    sortBy === option.value
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Markets Grid */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl border border-border p-5 animate-pulse"
                        >
                            <div className="h-6 w-24 bg-muted rounded-full mb-4" />
                            <div className="h-5 w-full bg-muted rounded mb-2" />
                            <div className="h-5 w-3/4 bg-muted rounded mb-4" />
                            <div className="flex gap-3 mb-4">
                                <div className="flex-1 h-20 bg-muted rounded-lg" />
                                <div className="flex-1 h-20 bg-muted rounded-lg" />
                            </div>
                            <div className="h-4 w-full bg-muted rounded" />
                        </div>
                    ))}
                </div>
            ) : displayedMarkets.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No markets found</h3>
                    <p className="text-muted-foreground">
                        {showSavedOnly
                            ? "You haven't saved any markets yet"
                            : 'Try adjusting your search or filters'}
                    </p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {displayedMarkets.map((market, index) => (
                        <motion.div
                            key={market.ticker}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <MarketCard
                                market={market}
                                onViewDetails={setSelectedMarket}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Market Detail Modal */}
            {selectedMarket && (
                <MarketDetailModal
                    market={selectedMarket}
                    onClose={() => setSelectedMarket(null)}
                />
            )}
        </main>
    );
}
