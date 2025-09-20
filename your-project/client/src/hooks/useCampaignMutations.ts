import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWeb3 } from '@/components/Web3Provider';
import { getContract, parseEther, CONTRACT_ADDRESS } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

interface CreateCampaignData {
  title: string;
  description: string;
  goal: string;
  duration: string;
}

interface ContributeCampaignData {
  campaignId: number;
  amount: string;
}

export function useCreateCampaign() {
  const { provider, account, isConnected } = useWeb3();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCampaignData) => {
      if (!isConnected || !provider || !account) {
        throw new Error('Wallet not connected');
      }

      if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        // Simulate transaction for demo
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { hash: '0xdemo...', campaignId: Math.floor(Math.random() * 1000) };
      }

      const signer = await provider.getSigner();
      const contract = getContract(signer);

      const goalWei = parseEther(data.goal);
      const durationSeconds = parseInt(data.duration) * 24 * 60 * 60;

      const tx = await contract.createCampaign(
        data.title,
        data.description,
        goalWei,
        durationSeconds
      );

      const receipt = await tx.wait();
      
      // Extract campaign ID from event logs
      let campaignId = null;
      try {
        if (receipt) {
          const campaignCreatedTopic = contract.interface.getEvent('CampaignCreated').topicHash;
          const event = receipt.logs.find((log: any) => 
            log.topics[0] === campaignCreatedTopic
          );
          
          if (event) {
            const parsed = contract.interface.parseLog(event);
            if (parsed && parsed.args) {
              campaignId = Number(parsed.args.campaignId);
            }
          }
        }
      } catch (error) {
        console.warn('Could not parse campaign creation event:', error);
      }

      return { hash: tx.hash, campaignId };
    },
    onSuccess: (result) => {
      toast({
        title: 'Campaign created successfully!',
        description: `Campaign ID: ${result.campaignId || 'Unknown'}`,
      });
      
      // Invalidate campaigns query to refetch
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create campaign',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useContributeToCampaign() {
  const { provider, account, isConnected } = useWeb3();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ContributeCampaignData) => {
      if (!isConnected || !provider || !account) {
        throw new Error('Wallet not connected');
      }

      if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        // Simulate transaction for demo
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { hash: '0xdemo...' };
      }

      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const amountWei = parseEther(data.amount);

      const tx = await contract.contribute(data.campaignId, { value: amountWei });
      const receipt = await tx.wait();

      return { hash: tx.hash };
    },
    onSuccess: (result, variables) => {
      toast({
        title: 'Contribution successful!',
        description: `You contributed ${variables.amount} ETH`,
      });
      
      // Invalidate campaigns query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Contribution failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
