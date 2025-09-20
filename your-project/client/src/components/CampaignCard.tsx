import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Target, Users, Clock } from 'lucide-react';
import { formatEther } from '@/lib/web3';

interface CampaignCardProps {
  id: number;
  title: string;
  description: string;
  creator: string;
  goal: string;
  amountRaised: string;
  deadline: number;
  withdrawn: boolean;
  onViewDetails?: (id: number) => void;
  onContribute?: (id: number) => void;
}

export default function CampaignCard({
  id,
  title,
  description,
  creator,
  goal,
  amountRaised,
  deadline,
  withdrawn,
  onViewDetails,
  onContribute,
}: CampaignCardProps) {
  const goalEth = parseFloat(formatEther(goal));
  const raisedEth = parseFloat(formatEther(amountRaised));
  const progressPercentage = goalEth > 0 ? (raisedEth / goalEth) * 100 : 0;
  
  const deadlineDate = new Date(deadline * 1000);
  const now = new Date();
  const isExpired = deadlineDate < now;
  const isGoalReached = raisedEth >= goalEth;
  
  const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  const getStatus = () => {
    if (withdrawn) return { label: 'Completed', variant: 'secondary' as const };
    if (isGoalReached) return { label: 'Funded', variant: 'default' as const };
    if (isExpired) return { label: 'Expired', variant: 'destructive' as const };
    return { label: 'Active', variant: 'outline' as const };
  };

  const status = getStatus();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`card-campaign-${id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2" data-testid={`text-campaign-title-${id}`}>
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3" data-testid={`text-campaign-description-${id}`}>
              {description}
            </p>
          </div>
          <Badge variant={status.variant} data-testid={`badge-campaign-status-${id}`}>
            {status.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs">
              {creator.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground" data-testid={`text-campaign-creator-${id}`}>
            {formatAddress(creator)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium" data-testid={`text-campaign-progress-${id}`}>
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Goal</p>
              <p className="font-medium" data-testid={`text-campaign-goal-${id}`}>{goalEth.toFixed(2)} ETH</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Raised</p>
              <p className="font-medium" data-testid={`text-campaign-raised-${id}`}>{raisedEth.toFixed(2)} ETH</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {isExpired ? 'Expired' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
          </span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails?.(id)}
            data-testid={`button-view-details-${id}`}
          >
            View Details
          </Button>
          
          {!isExpired && !withdrawn && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onContribute?.(id)}
              disabled={isExpired || withdrawn}
              data-testid={`button-contribute-${id}`}
            >
              Contribute
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
