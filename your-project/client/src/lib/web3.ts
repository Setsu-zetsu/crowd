import { ethers } from 'ethers';

// Smart contract configuration
// TODO: Replace with your deployed contract address after deployment
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
export const CONTRACT_ABI = [
  "function campaignCount() view returns (uint256)",
  "function campaigns(uint256) view returns (address, string, string, uint256, uint256, uint256, bool)",
  "function createCampaign(string title, string description, uint256 goal, uint256 duration)",
  "function contribute(uint256 campaignId) payable",
  "function withdrawFunds(uint256 campaignId)",
  "function refund(uint256 campaignId)",
  "function getCampaign(uint256 campaignId) view returns (address, string, string, uint256, uint256, uint256, bool)",
  "event CampaignCreated(uint256 campaignId, address creator, string title, uint256 goal, uint256 deadline)",
  "event Contributed(uint256 campaignId, address contributor, uint256 amount)",
  "event FundsWithdrawn(uint256 campaignId, uint256 amount)",
  "event Refunded(uint256 campaignId, address contributor, uint256 amount)"
];

export interface Campaign {
  id: number;
  creator: string;
  title: string;
  description: string;
  goal: string;
  deadline: number;
  amountRaised: string;
  withdrawn: boolean;
}

export const formatEther = (value: string) => {
  return ethers.formatEther(value);
};

export const parseEther = (value: string) => {
  return ethers.parseEther(value);
};

export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('MetaMask not found');
};

export const getContract = (signer?: ethers.Signer) => {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer || provider);
};
