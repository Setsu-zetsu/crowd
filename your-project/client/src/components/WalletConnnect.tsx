import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, Loader2, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { useWeb3 } from './Web3Provider';
import { useToast } from '@/hooks/use-toast';

export default function WalletConnect() {
  const { account, isConnected, connectWallet, disconnectWallet, isLoading, error, chainId } = useWeb3();
  const { toast } = useToast();

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast({
        title: 'Address copied',
        description: 'Wallet address copied to clipboard',
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 11155111: return 'Sepolia Testnet';
      case 137: return 'Polygon Mainnet';
      default: return `Chain ${chainId}`;
    }
  };

  if (isConnected && account) {
    return (
      <Card className="p-4 hover-elevate" data-testid="card-wallet-connected">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
            <div>
              <p className="font-medium text-sm" data-testid="text-wallet-address">
                {formatAddress(account)}
              </p>
              {chainId && (
                <p className="text-xs text-muted-foreground" data-testid="text-chain-name">
                  {getChainName(chainId)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={copyAddress}
              data-testid="button-copy-address"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={disconnectWallet}
              data-testid="button-disconnect-wallet"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 text-center hover-elevate" data-testid="card-wallet-connect">
      <div className="mb-4">
        <Wallet className="w-12 h-12 mx-auto text-primary" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
      <p className="text-muted-foreground mb-4 text-sm">
        Connect your MetaMask wallet to create and fund campaigns
      </p>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 text-destructive rounded-md text-sm">
          <AlertCircle className="w-4 h-4" />
          <span data-testid="text-wallet-error">{error}</span>
        </div>
      )}

      <Button
        onClick={connectWallet}
        disabled={isLoading}
        className="w-full"
        data-testid="button-connect-wallet"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect MetaMask
          </>
        )}
      </Button>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Don't have MetaMask?{' '}
          <a
            href="https://metamask.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
            data-testid="link-get-metamask"
          >
            Get it here
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </Card>
  );
}
