import { useLocation } from 'wouter';
import CampaignForm from '@/components/CampaignForm';
import WalletConnect from '@/components/WalletConnect';
import { useWeb3 } from '@/components/Web3Provider';

export default function CreateCampaign() {
  const [, setLocation] = useLocation();
  const { isConnected } = useWeb3();

  const handleSuccess = () => {
    setLocation('/');
  };

  const handleCancel = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Create a New Campaign</h1>
          <p className="text-muted-foreground">
            Launch your innovative project on the blockchain and start raising funds from supporters worldwide.
          </p>
        </div>

        {!isConnected ? (
          <div className="max-w-md mx-auto">
            <WalletConnect />
          </div>
        ) : (
          <CampaignForm onSuccess={handleSuccess} onCancel={handleCancel} />
        )}
      </div>
    </div>
  );
}
