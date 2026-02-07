// Wallet Connect Component - Generate, import, and manage wallet

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useXRPL } from '@/context/XRPLProvider';
import { useToast } from '@/hooks/use-toast';
import {
    Wallet,
    Plus,
    Import,
    LogOut,
    Copy,
    ExternalLink,
    Loader2,
    RefreshCw,
    ChevronDown,
} from 'lucide-react';
import { XRPL_NETWORKS } from '@/config/constants';

export function WalletConnect() {
    const {
        wallet,
        accountInfo,
        connectionStatus,
        currentNetwork,
        isWalletLoading,
        generateWallet,
        importWallet,
        disconnectWallet,
        fundWallet,
        refreshAccountInfo,
    } = useXRPL();

    const { toast } = useToast();
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [seedInput, setSeedInput] = useState('');
    const [isFunding, setIsFunding] = useState(false);

    const handleGenerate = () => {
        const walletInfo = generateWallet();
        toast({
            title: 'Wallet Generated',
            description: `Address: ${walletInfo.address.slice(0, 12)}...`,
        });
    };

    const handleImport = () => {
        try {
            const walletInfo = importWallet(seedInput);
            toast({
                title: 'Wallet Imported',
                description: `Address: ${walletInfo.address.slice(0, 12)}...`,
            });
            setIsImportOpen(false);
            setSeedInput('');
        } catch (error) {
            toast({
                title: 'Import Failed',
                description: 'Invalid seed format',
                variant: 'destructive',
            });
        }
    };

    const handleFund = async () => {
        setIsFunding(true);
        try {
            await fundWallet();
            toast({
                title: 'Wallet Funded',
                description: 'Test XRP has been added to your wallet',
            });
        } catch (error) {
            toast({
                title: 'Funding Failed',
                description: 'Could not fund wallet from faucet',
                variant: 'destructive',
            });
        } finally {
            setIsFunding(false);
        }
    };

    const copyAddress = () => {
        if (wallet) {
            navigator.clipboard.writeText(wallet.address);
            toast({ title: 'Address copied' });
        }
    };

    const openExplorer = () => {
        if (wallet) {
            const baseUrl = XRPL_NETWORKS[currentNetwork].explorerUrl;
            window.open(`${baseUrl}/accounts/${wallet.address}`, '_blank');
        }
    };

    // Not connected state
    if (!wallet) {
        return (
            <div className="flex items-center gap-2">
                <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Wallet className="w-4 h-4" />
                                Connect Wallet
                                <ChevronDown className="w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleGenerate}>
                                <Plus className="w-4 h-4 mr-2" />
                                Generate New Wallet
                            </DropdownMenuItem>
                            <DialogTrigger asChild>
                                <DropdownMenuItem>
                                    <Import className="w-4 h-4 mr-2" />
                                    Import from Seed
                                </DropdownMenuItem>
                            </DialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Import Wallet</DialogTitle>
                            <DialogDescription>
                                Enter your wallet seed (secret key) to import an existing wallet.
                                Never share your seed with anyone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <Input
                                type="password"
                                placeholder="sXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                                value={seedInput}
                                onChange={(e) => setSeedInput(e.target.value)}
                            />
                            <Button onClick={handleImport} className="w-full">
                                Import Wallet
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    // Connected state
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 font-mono">
                    <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-success' :
                            connectionStatus === 'connecting' ? 'bg-warning animate-pulse' :
                                'bg-destructive'
                        }`} />
                    <span className="hidden sm:inline">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </span>
                    <span className="sm:hidden">
                        {wallet.address.slice(0, 4)}...
                    </span>
                    {isWalletLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <span className="text-success font-bold">
                            {accountInfo?.balance.xrp.toFixed(2) ?? '0.00'} XRP
                        </span>
                    )}
                    <ChevronDown className="w-3 h-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="font-mono font-bold text-success">
                        {accountInfo?.balance.xrp.toFixed(6) ?? '0.000000'} XRP
                    </p>
                    {!accountInfo?.isActivated && (
                        <p className="text-2xs text-warning mt-1">Account not activated</p>
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={copyAddress}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openExplorer}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View in Explorer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={refreshAccountInfo}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Balance
                </DropdownMenuItem>
                {currentNetwork === 'testnet' && (
                    <DropdownMenuItem onClick={handleFund} disabled={isFunding}>
                        {isFunding ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        Fund from Faucet
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={disconnectWallet} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
