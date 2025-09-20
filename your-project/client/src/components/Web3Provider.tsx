import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { getProvider } from '@/lib/web3';

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  account: string | null;
  isConnected: boolean;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!account;

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask.');
      }

      const provider = getProvider();
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const network = await provider.getNetwork();
      
      setProvider(provider);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      
      console.log('Wallet connected:', accounts[0]);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to connect wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setAccount(null);
    setChainId(null);
    setError(null);
    console.log('Wallet disconnected');
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Auto-connect if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (window.ethereum) {
          const provider = getProvider();
          const accounts = await provider.send('eth_accounts', []);
          
          if (accounts.length > 0) {
            const network = await provider.getNetwork();
            setProvider(provider);
            setAccount(accounts[0]);
            setChainId(Number(network.chainId));
          }
        }
      } catch (err) {
        console.error('Failed to check wallet connection:', err);
      }
    };

    checkConnection();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        account,
        isConnected,
        chainId,
        connectWallet,
        disconnectWallet,
        isLoading,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

// Extend window to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
