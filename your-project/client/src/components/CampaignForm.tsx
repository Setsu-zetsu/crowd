import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Rocket, CheckCircle, ExternalLink } from 'lucide-react';
import { useWeb3 } from './Web3Provider';
import { useCreateCampaign } from '@/hooks/useCampaignMutations';

const campaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be less than 1000 characters'),
  goal: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0 && num <= 1000;
  }, 'Goal must be between 0 and 1000 ETH'),
  duration: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1 && num <= 365;
  }, 'Duration must be between 1 and 365 days'),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CampaignForm({ onSuccess, onCancel }: CampaignFormProps) {
  const { isConnected } = useWeb3();
  const createCampaign = useCreateCampaign();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: '',
      description: '',
      goal: '',
      duration: '30',
    },
  });

  const onSubmit = async (data: CampaignFormData) => {
    createCampaign.mutate(data, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          Create New Campaign
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title *</Label>
            <Input
              id="title"
              placeholder="Enter your campaign title"
              {...form.register('title')}
              data-testid="input-campaign-title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive" data-testid="error-campaign-title">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Campaign Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your project, goals, and how the funds will be used..."
              rows={4}
              {...form.register('description')}
              data-testid="input-campaign-description"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive" data-testid="error-campaign-description">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal">Funding Goal (ETH) *</Label>
              <Input
                id="goal"
                type="number"
                step="0.01"
                placeholder="10.0"
                {...form.register('goal')}
                data-testid="input-campaign-goal"
              />
              {form.formState.errors.goal && (
                <p className="text-sm text-destructive" data-testid="error-campaign-goal">
                  {form.formState.errors.goal.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="365"
                {...form.register('duration')}
                data-testid="input-campaign-duration"
              />
              {form.formState.errors.duration && (
                <p className="text-sm text-destructive" data-testid="error-campaign-duration">
                  {form.formState.errors.duration.message}
                </p>
              )}
            </div>
          </div>

          {!isConnected && (
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Please connect your wallet to create a campaign
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createCampaign.isPending}
                data-testid="button-cancel-campaign"
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={!isConnected || createCampaign.isPending}
              className="flex-1"
              data-testid="button-create-campaign"
            >
              {createCampaign.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Campaign...
                </>
              ) : createCampaign.isSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Campaign Created!
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Create Campaign
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
