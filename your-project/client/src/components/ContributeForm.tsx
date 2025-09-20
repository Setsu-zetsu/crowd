import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Heart, CheckCircle } from 'lucide-react';
import { useWeb3 } from './Web3Provider';
import { formatEther } from '@/lib/web3';
import { useContributeToCampaign } from '@/hooks/useCampaignMutations';

const contributeSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0 && num <= 100;
  }, 'Amount must be between 0 and 100 ETH'),
});

type ContributeFormData = z.infer<typeof contributeSchema>;

interface ContributeFormProps {
  campaignId: number;
  campaignTitle: string;
  goal: string;
  amountRaised: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ContributeForm({
  campaignId,
  campaignTitle,
  goal,
  amountRaised,
  onSuccess,
  onCancel,
}: ContributeFormProps) {
  const { isConnected } = useWeb3();
  const contributeToCampaign = useContributeToCampaign();

  const form = useForm<ContributeFormData>({
    resolver: zodResolver(contributeSchema),
    defaultValues: {
      amount: '',
    },
  });

  const goalEth = parseFloat(formatEther(goal));
  const raisedEth = parseFloat(formatEther(amountRaised));
  const remainingEth = goalEth - raisedEth;

  const onSubmit = async (data: ContributeFormData) => {
    contributeToCampaign.mutate({ campaignId, amount: data.amount }, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  };

  const suggestedAmounts = ['0.1', '0.5', '1.0', '2.0'];

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Support This Project
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="font-medium mb-2 line-clamp-2" data-testid="text-contribute-campaign-title">
            {campaignTitle}
          </h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p data-testid="text-contribute-progress">
              {raisedEth.toFixed(2)} ETH raised of {goalEth.toFixed(2)} ETH goal
            </p>
            <p data-testid="text-contribute-remaining">
              {remainingEth.toFixed(2)} ETH remaining
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Contribution Amount (ETH) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.1"
              {...form.register('amount')}
              data-testid="input-contribute-amount"
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive" data-testid="error-contribute-amount">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Quick amounts</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {suggestedAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setValue('amount', amount)}
                  data-testid={`button-quick-amount-${amount}`}
                >
                  {amount} ETH
                </Button>
              ))}
            </div>
          </div>

          {!isConnected && (
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Please connect your wallet to contribute
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={contributeToCampaign.isPending}
                data-testid="button-cancel-contribute"
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={!isConnected || contributeToCampaign.isPending}
              className="flex-1"
              data-testid="button-submit-contribute"
            >
              {contributeToCampaign.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Contributing...
                </>
              ) : contributeToCampaign.isSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Contributed!
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Contribute
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
