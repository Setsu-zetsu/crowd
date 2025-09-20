import { useQuery } from '@tanstack/react-query';
import { useWeb3 } from '@/components/Web3Provider';
import { getContract, CONTRACT_ADDRESS, type Campaign } from '@/lib/web3';

export function useCampaigns() {
  const { provider } = useWeb3();

  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async (): Promise<Campaign[]> => {
      if (!provider || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        // Return mock data when no contract is deployed
        return getMockCampaigns();
      }

      try {
        const contract = getContract();
        const campaignCount = await contract.campaignCount();
        const campaigns: Campaign[] = [];

        for (let i = 1; i <= Number(campaignCount); i++) {
          try {
            const campaign = await contract.getCampaign(i);
            campaigns.push({
              id: i,
              creator: campaign[0],
              title: campaign[1],
              description: campaign[2],
              goal: campaign[3].toString(),
              deadline: Number(campaign[4]),
              amountRaised: campaign[5].toString(),
              withdrawn: campaign[6],
            });
          } catch (error) {
            console.error(`Failed to fetch campaign ${i}:`, error);
          }
        }

        return campaigns;
      } catch (error) {
        console.error('Failed to fetch campaigns from contract, using mock data:', error);
        return getMockCampaigns();
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Mock data for development/demo when contract is not deployed
function getMockCampaigns(): Campaign[] {
  return [
    {
      id: 1,
      title: "Revolutionary Solar Panel Technology",
      description: "Developing next-generation solar panels with 40% higher efficiency using cutting-edge nanotechnology. Our team has 15 years of experience in renewable energy solutions.",
      creator: "0x742d35Cc6634C0532925a3b8D46698CDE7B9c001",
      goal: "10000000000000000000", // 10 ETH in wei
      amountRaised: "7500000000000000000", // 7.5 ETH in wei
      deadline: Math.floor(Date.now() / 1000) + 86400 * 15, // 15 days from now
      withdrawn: false,
    },
    {
      id: 2,
      title: "Open Source AI Model for Healthcare",
      description: "Building an AI model specifically designed to assist doctors in early disease detection. All research will be open-sourced for the global medical community.",
      creator: "0x8ba1f109551bD432803012645Hac136c5C548A",
      goal: "25000000000000000000", // 25 ETH in wei
      amountRaised: "18200000000000000000", // 18.2 ETH in wei
      deadline: Math.floor(Date.now() / 1000) + 86400 * 8, // 8 days from now
      withdrawn: false,
    },
    {
      id: 3,
      title: "Sustainable Water Purification System",
      description: "Creating affordable water purification systems for developing communities using solar power and advanced filtration technology.",
      creator: "0x9Ac64Cc6C0532925a3b8D46698CDE7B9c43c45B",
      goal: "5000000000000000000", // 5 ETH in wei
      amountRaised: "5100000000000000000", // 5.1 ETH in wei
      deadline: Math.floor(Date.now() / 1000) - 86400 * 2, // 2 days ago (completed)
      withdrawn: true,
    },
    {
      id: 4,
      title: "Blockchain Education Platform",
      description: "Developing a comprehensive educational platform to teach blockchain development to underserved communities worldwide.",
      creator: "0x1A2B3C4D5E6F7890123456789ABCDEF012345678",
      goal: "8000000000000000000", // 8 ETH in wei
      amountRaised: "3200000000000000000", // 3.2 ETH in wei
      deadline: Math.floor(Date.now() / 1000) + 86400 * 22, // 22 days from now
      withdrawn: false,
    },
  ];
}
