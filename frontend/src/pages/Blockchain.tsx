import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Link2, ExternalLink, Copy, Check, Search, RefreshCw,
    Wallet, Activity, Server, Hash, Clock, Shield, ChevronDown,
    TrendingUp, Users, DollarSign, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    getBlockchainStatus,
    getAllWallets,
    getTransactionFeed,
    verifyTransaction,
    getPlatformAnalytics,
    type BlockchainStatus,
    type AllWalletsResponse,
    type BlockchainTransaction,
    type VerificationResult,
    type XRPLAnalytics,
    shortenTxHash
} from '@/services/xrplService';

// ============================================
// NETWORK STATUS COMPONENT
// ============================================

function NetworkStatus() {
    const [status, setStatus] = useState<BlockchainStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStatus();
        const interval = setInterval(loadStatus, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const loadStatus = async () => {
        const data = await getBlockchainStatus();
        setStatus(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 animate-pulse">
                <div className="h-20 bg-slate-700 rounded"></div>
            </div>
        );
    }

    const connected = status?.connected ?? false;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        connected ? "bg-emerald-500/20" : "bg-red-500/20"
                    )}>
                        <Server className={cn(
                            "w-6 h-6",
                            connected ? "text-emerald-400" : "text-red-400"
                        )} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            XRP Ledger Network
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1",
                                connected ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                            )}>
                                <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                                )}></span>
                                {connected ? 'CONNECTED' : 'OFFLINE'}
                            </span>
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {status?.network || 'Testnet'} • Real-time blockchain data
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadStatus}
                    className="text-slate-400 hover:text-white"
                >
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="text-slate-400 text-sm mb-1">Network</div>
                    <div className="text-white font-semibold">{status?.network || 'Testnet'}</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="text-slate-400 text-sm mb-1">Latest Ledger</div>
                    <div className="text-white font-semibold font-mono">
                        #{(status?.latest_ledger || 0).toLocaleString()}
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="text-slate-400 text-sm mb-1">Our Transactions</div>
                    <div className="text-cyan-400 font-semibold">
                        {(status?.our_transaction_count || 0).toLocaleString()}
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="text-slate-400 text-sm mb-1">Ledger Age</div>
                    <div className="text-white font-semibold">
                        {status?.ledger_age_seconds || 0}s ago
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ============================================
// PLATFORM WALLETS COMPONENT
// ============================================

function PlatformWallets() {
    const [wallets, setWallets] = useState<AllWalletsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

    useEffect(() => {
        loadWallets();
    }, []);

    const loadWallets = async () => {
        const data = await getAllWallets();
        setWallets(data);
        setLoading(false);
    };

    const copyAddress = (address: string) => {
        navigator.clipboard.writeText(address);
        setCopiedAddress(address);
        setTimeout(() => setCopiedAddress(null), 2000);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-border p-6 animate-pulse">
                <div className="h-40 bg-gray-100 rounded"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-border p-6 shadow-card"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    Platform Wallets
                </h2>
                <span className="text-sm text-muted-foreground">
                    {wallets?.platform_wallets?.length || 0} active
                </span>
            </div>

            <div className="space-y-4">
                {wallets?.platform_wallets?.map((wallet, i) => (
                    <div
                        key={i}
                        className="border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">{wallet.icon}</div>
                                <div>
                                    <div className="font-semibold">{wallet.label}</div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                                        {shortenTxHash(wallet.address)}
                                        <button
                                            onClick={() => copyAddress(wallet.address)}
                                            className="hover:text-primary transition-colors"
                                        >
                                            {copiedAddress === wallet.address ? (
                                                <Check className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-lg">
                                    {wallet.balance_xrp.toLocaleString(undefined, { maximumFractionDigits: 2 })} XRP
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {wallet.transaction_count} txs
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{wallet.purpose}</span>
                            <a
                                href={wallet.explorer_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                                View on Explorer <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                ))}

                {/* User Wallets Summary */}
                {wallets?.user_wallets && wallets.user_wallets.count > 0 && (
                    <div className="border border-dashed border-border rounded-xl p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">👥</div>
                                <div>
                                    <div className="font-semibold">User Wallets</div>
                                    <div className="text-sm text-muted-foreground">
                                        {wallets.user_wallets.count} users registered
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-lg">
                                    {wallets.user_wallets.total_balance_xrp.toLocaleString()} XRP
                                </div>
                                <div className="text-sm text-muted-foreground">total balance</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ============================================
// TRANSACTION FEED COMPONENT
// ============================================

function TransactionFeed() {
    const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        loadFeed();
        if (autoRefresh) {
            const interval = setInterval(loadFeed, 5000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const loadFeed = async () => {
        const data = await getTransactionFeed(20);
        if (data) {
            setTransactions(data.transactions);
        }
        setLoading(false);
    };

    const colorClasses: Record<string, string> = {
        blue: 'border-l-blue-500 bg-blue-50/50',
        purple: 'border-l-purple-500 bg-purple-50/50',
        green: 'border-l-emerald-500 bg-emerald-50/50',
        red: 'border-l-red-500 bg-red-50/50',
        gold: 'border-l-amber-500 bg-amber-50/50',
        gray: 'border-l-gray-400 bg-gray-50/50'
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-border p-6 animate-pulse">
                <div className="h-80 bg-gray-100 rounded"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-border shadow-card"
        >
            <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Live Transaction Feed
                </h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors",
                            autoRefresh
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                        )}
                    >
                        <span className={cn(
                            "w-2 h-2 rounded-full",
                            autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                        )}></span>
                        Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                    </button>
                </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                    {transactions.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p>No transactions yet</p>
                            <p className="text-sm">Make a purchase to see it here!</p>
                        </div>
                    ) : (
                        transactions.map((tx, i) => (
                            <motion.div
                                key={tx.hash}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: i * 0.05 }}
                                className={cn(
                                    "p-4 border-b border-border border-l-4",
                                    colorClasses[tx.color || 'gray']
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{tx.icon}</div>
                                        <div>
                                            <div className="font-semibold">{tx.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {tx.description}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                            <Hash className="w-3 h-3" />
                                            {shortenTxHash(tx.hash)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs">
                                        {tx.validated ? (
                                            <span className="text-emerald-600 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Validated
                                            </span>
                                        ) : (
                                            <span className="text-amber-600 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Pending
                                            </span>
                                        )}
                                        <span className="text-muted-foreground">
                                            Ledger #{tx.ledger_index?.toLocaleString()}
                                        </span>
                                    </div>
                                    <a
                                        href={tx.explorer_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                        View <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ============================================
// ANALYTICS COMPONENT
// ============================================

function BlockchainAnalytics() {
    const [analytics, setAnalytics] = useState<XRPLAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        const data = await getPlatformAnalytics();
        setAnalytics(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-border p-6 animate-pulse">
                <div className="h-40 bg-gray-100 rounded"></div>
            </div>
        );
    }

    const stats = [
        { label: 'Purchases', value: analytics?.total_purchases || 0, icon: '🛒', color: 'text-blue-600' },
        { label: 'Predictions', value: analytics?.total_predictions || 0, icon: '📊', color: 'text-purple-600' },
        { label: 'Settlements', value: analytics?.total_settlements || 0, icon: '✅', color: 'text-emerald-600' },
        { label: 'Win Rate', value: `${analytics?.win_rate_percent || 0}%`, icon: '🎯', color: 'text-amber-600' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-border p-6 shadow-card"
        >
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary" />
                Blockchain Analytics
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className={cn("text-2xl font-bold", stat.color)}>
                            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                        </div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-700 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium">Total Cashback Paid</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">
                        ${(analytics?.total_cashback_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-700 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Unique Users</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                        {analytics?.unique_users || 0}
                    </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-purple-700 mb-1">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm font-medium">Wins / Losses</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                        {analytics?.total_wins || 0} / {analytics?.total_losses || 0}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ============================================
// VERIFICATION TOOL COMPONENT
// ============================================

function VerificationTool() {
    const [hash, setHash] = useState('');
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (!hash.trim()) return;
        setLoading(true);
        const data = await verifyTransaction(hash.trim());
        setResult(data);
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-border p-6 shadow-card"
        >
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-primary" />
                Transaction Verification
            </h2>

            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Enter transaction hash..."
                        value={hash}
                        onChange={(e) => setHash(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
                    />
                </div>
                <Button onClick={handleVerify} disabled={loading}>
                    {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        'Verify'
                    )}
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                            "rounded-xl p-4 border",
                            result.verified
                                ? "bg-emerald-50 border-emerald-200"
                                : "bg-red-50 border-red-200"
                        )}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            {result.verified ? (
                                <>
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    <span className="font-semibold text-emerald-700">
                                        Transaction Verified ✓
                                    </span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-5 h-5 text-red-600" />
                                    <span className="font-semibold text-red-700">
                                        Verification Failed
                                    </span>
                                </>
                            )}
                        </div>

                        {result.verified && (
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Hash</span>
                                    <span className="font-mono">{shortenTxHash(result.hash)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Ledger</span>
                                    <span>#{result.ledger_index?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Type</span>
                                    <span>{result.data?.type || result.transaction_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Time</span>
                                    <span>{result.timestamp ? new Date(result.timestamp).toLocaleString() : 'N/A'}</span>
                                </div>
                                {result.data && Object.keys(result.data).length > 0 && (
                                    <details className="mt-3">
                                        <summary className="cursor-pointer text-primary hover:underline flex items-center gap-1">
                                            <ChevronDown className="w-4 h-4" />
                                            View Full Data
                                        </summary>
                                        <pre className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-x-auto">
                                            {JSON.stringify(result.data, null, 2)}
                                        </pre>
                                    </details>
                                )}
                                <a
                                    href={result.explorer_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                    View on XRPL Explorer <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        )}

                        {!result.verified && result.error && (
                            <p className="text-sm text-red-600">{result.error}</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

const Blockchain = () => {
    return (
        <main className="container py-8">
            {/* Header */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-2"
                >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Link2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Blockchain Explorer
                        </h1>
                        <p className="text-muted-foreground">
                            Transparent, verifiable record of all Winback activity on XRP Ledger
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Network Status */}
            <div className="mb-6">
                <NetworkStatus />
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <PlatformWallets />
                <BlockchainAnalytics />
            </div>

            {/* Transaction Feed */}
            <div className="mb-6">
                <TransactionFeed />
            </div>

            {/* Verification Tool */}
            <div className="max-w-2xl">
                <VerificationTool />
            </div>
        </main>
    );
};

export default Blockchain;
