import { Activity, TrendingUp, AlertTriangle, Plus, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Activity as ActivityType } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  activities: ActivityType[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: ActivityType['type']) => {
    switch (type) {
      case 'settlement':
        return <TrendingUp className="w-3 h-3 text-success" />;
      case 'bounce':
        return <XCircle className="w-3 h-3 text-destructive" />;
      case 'new_position':
        return <Plus className="w-3 h-3 text-primary" />;
      case 'bound_breach':
        return <AlertTriangle className="w-3 h-3 text-accent" />;
    }
  };

  const getActivityColor = (type: ActivityType['type']) => {
    switch (type) {
      case 'settlement':
        return 'border-l-success';
      case 'bounce':
        return 'border-l-destructive';
      case 'new_position':
        return 'border-l-primary';
      case 'bound_breach':
        return 'border-l-accent';
    }
  };

  return (
    <div className="terminal-grid h-full flex flex-col">
      <div className="p-3 border-b border-border-subtle flex items-center gap-2">
        <Activity className="w-3 h-3 text-muted-foreground" />
        <h3 className="terminal-header text-xs">ACTIVITY FEED</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={cn(
              "p-3 border-b border-border-subtle border-l-2 hover:bg-secondary/20 transition-colors",
              getActivityColor(activity.type)
            )}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{activity.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                  {activity.amount !== undefined && (
                    <span className={cn(
                      "text-2xs font-semibold",
                      activity.isPositive ? "text-success" : "text-destructive"
                    )}>
                      {activity.isPositive ? '+' : ''}${Math.abs(activity.amount).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}