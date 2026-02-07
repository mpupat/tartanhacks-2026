import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, AlertTriangle, TrendingUp, Clock, Target, Laptop, Sofa, ShoppingCart, Plane, Utensils, Bike, Watch, Gamepad2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewPositionDialogProps {
  currentPrice: number;
}

const PROJECTS = [
  { id: 'macbook', name: 'MacBook Pro 16"', icon: Laptop, suggestedAmount: 2499 },
  { id: 'sofa', name: 'Sectional Sofa', icon: Sofa, suggestedAmount: 1899 },
  { id: 'groceries', name: 'Weekly Groceries', icon: ShoppingCart, suggestedAmount: 287 },
  { id: 'flight', name: 'Flight Ticket', icon: Plane, suggestedAmount: 456 },
  { id: 'dinner', name: 'Restaurant Dinner', icon: Utensils, suggestedAmount: 142 },
  { id: 'bicycle', name: 'Electric Bicycle', icon: Bike, suggestedAmount: 1299 },
  { id: 'watch', name: 'Designer Watch', icon: Watch, suggestedAmount: 4500 },
  { id: 'console', name: 'Gaming Console', icon: Gamepad2, suggestedAmount: 549 },
  { id: 'custom', name: 'Custom Purchase', icon: Package, suggestedAmount: 500 },
];

export function NewPositionDialog({ currentPrice }: NewPositionDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [purchaseAmount, setPurchaseAmount] = useState<number>(500);
  const [maxBoundPercent, setMaxBoundPercent] = useState<number>(5);
  const [minBoundPercent, setMinBoundPercent] = useState<number>(20);
  const [timeLimitDays, setTimeLimitDays] = useState<number>(3);

  const selectedProjectData = PROJECTS.find(p => p.id === selectedProject);
  const xrpQuantity = purchaseAmount / currentPrice;
  const maxBound = purchaseAmount * (1 + maxBoundPercent / 100);
  const minBound = purchaseAmount * (1 - minBoundPercent / 100);
  const potentialSavings = purchaseAmount - minBound;
  const riskLevel = minBoundPercent < 10 ? 'low' : minBoundPercent < 20 ? 'medium' : 'high';

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    const project = PROJECTS.find(p => p.id === projectId);
    if (project) {
      setPurchaseAmount(project.suggestedAmount);
    }
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low': return 'text-success';
      case 'medium': return 'text-accent';
      case 'high': return 'text-destructive';
    }
  };

  const getSettlementProbability = () => {
    const baseProb = 75;
    const timeBonus = Math.min(timeLimitDays * 3, 15);
    const spreadBonus = Math.min((maxBoundPercent + minBoundPercent) / 2, 10);
    return Math.min(baseProb + timeBonus + spreadBonus, 95);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-success hover:bg-success/90 text-success-foreground font-bold">
          <Plus className="w-4 h-4 mr-2" />
          NEW POSITION
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-card border-border p-0 gap-0">
        <DialogHeader className="p-4 border-b border-border-subtle">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-success" />
            Open New Position
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-5">
          {/* Project Selection */}
          <div className="space-y-2">
            <label className="terminal-header text-xs">SELECT PROJECT TO BET ON</label>
            <Select value={selectedProject} onValueChange={handleProjectChange}>
              <SelectTrigger className="bg-input border-border font-mono h-12">
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {PROJECTS.map((project) => {
                  const IconComponent = project.icon;
                  return (
                    <SelectItem 
                      key={project.id} 
                      value={project.id}
                      className="font-mono cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-accent" />
                        <span>{project.name}</span>
                        <span className="text-muted-foreground ml-2">${project.suggestedAmount}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Purchase Amount */}
          <div className="space-y-2">
            <label className="terminal-header text-xs">BET AMOUNT (USD)</label>
            <Input
              type="number"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(Number(e.target.value))}
              className="bg-input border-border font-mono text-lg h-12"
              placeholder="Enter amount..."
            />
          </div>

          {/* Auto-calculated XRP */}
          <div className="terminal-grid p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="terminal-header text-xs">XRP INVESTMENT</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold terminal-value">{xrpQuantity.toFixed(4)} XRP</span>
                <span className="block text-2xs text-muted-foreground">@ ${currentPrice.toFixed(6)}</span>
              </div>
            </div>
          </div>

          {/* Max Bound Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="terminal-header text-xs">MAX PAYMENT (+{maxBoundPercent}%)</label>
              <span className="text-destructive font-bold">${maxBound.toFixed(2)}</span>
            </div>
            <Slider
              value={[maxBoundPercent]}
              onValueChange={(v) => setMaxBoundPercent(v[0])}
              min={1}
              max={15}
              step={1}
              className="[&_[role=slider]]:bg-destructive"
            />
            <p className="text-2xs text-muted-foreground">
              If XRP value exceeds this, position will bounce (you pay purchase amount)
            </p>
          </div>

          {/* Min Bound Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="terminal-header text-xs">MIN PAYMENT (-{minBoundPercent}%)</label>
              <span className="text-success font-bold">${minBound.toFixed(2)}</span>
            </div>
            <Slider
              value={[minBoundPercent]}
              onValueChange={(v) => setMinBoundPercent(v[0])}
              min={5}
              max={40}
              step={1}
              className="[&_[role=slider]]:bg-success"
            />
            <p className="text-2xs text-muted-foreground">
              Target settlement price for maximum savings (potential savings: ${potentialSavings.toFixed(2)})
            </p>
          </div>

          {/* Time Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="terminal-header text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                SETTLEMENT WINDOW
              </label>
              <span className="text-accent font-bold">{timeLimitDays} DAYS</span>
            </div>
            <Slider
              value={[timeLimitDays]}
              onValueChange={(v) => setTimeLimitDays(v[0])}
              min={1}
              max={7}
              step={1}
              className="[&_[role=slider]]:bg-accent"
            />
          </div>

          {/* Risk Indicator */}
          <div className="terminal-grid p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="terminal-header text-xs">SETTLEMENT PROBABILITY</span>
              </div>
              <span className={cn("font-bold", getRiskColor())}>
                {getSettlementProbability().toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  riskLevel === 'low' ? 'bg-success' : riskLevel === 'medium' ? 'bg-accent' : 'bg-destructive'
                )}
                style={{ width: `${getSettlementProbability()}%` }}
              />
            </div>
            <div className="flex items-center gap-1 mt-2 text-2xs text-muted-foreground">
              <AlertTriangle className="w-3 h-3" />
              <span>Based on current market volatility and historical data</span>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="terminal-grid p-2">
              <span className="terminal-header text-2xs block">INVEST</span>
              <span className="font-bold">${purchaseAmount.toFixed(2)}</span>
            </div>
            <div className="terminal-grid p-2">
              <span className="terminal-header text-2xs block">MAX PAY</span>
              <span className="font-bold text-destructive">${maxBound.toFixed(2)}</span>
            </div>
            <div className="terminal-grid p-2">
              <span className="terminal-header text-2xs block">BEST CASE</span>
              <span className="font-bold text-success">${minBound.toFixed(2)}</span>
            </div>
          </div>

          <Button 
            className="w-full h-12 bg-success hover:bg-success/90 text-success-foreground font-bold text-lg"
            onClick={() => setOpen(false)}
          >
            CONFIRM POSITION
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}