import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, TrendingUp, Target, Users, Zap, Loader2, AlertCircle } from 'lucide-react';
import CampaignCard from '@/components/CampaignCard';
import ContributeModal from '@/components/ContributeModal';
import { formatEther, parseEther } from '@/lib/web3';
import { useCampaigns } from '@/hooks/useCampaigns';
import type { Campaign } from '@/lib/web3';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'funded' | 'expired'>('all');
  const [contributeModal, setContributeModal] = useState<{ isOpen: boolean; campaign: Campaign | null }>({
    isOpen: false,
    campaign: null,
  });
  
  const { data: campaigns = [], isLoading, error } = useCampaigns();

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    const now = Math.floor(Date.now() / 1000);
    const isExpired = campaign.deadline < now;
    const goalEth = parseFloat(formatEther(campaign.goal));
    const raisedEth = parseFloat(formatEther(campaign.amountRaised));
    const isGoalReached = raisedEth >= goalEth;

    switch (filter) {
      case 'active':
        return !isExpired && !campaign.withdrawn;
      case 'funded':
        return isGoalReached || campaign.withdrawn;
      case 'expired':
        return isExpired && !campaign.withdrawn;
      default:
        return true;
    }
  });

  const handleViewDetails = (id: number) => {
    console.log('View details for campaign:', id);
    // TODO: Navigate to campaign details page
  };

  const handleContribute = (id: number) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      setContributeModal({ isOpen: true, campaign });
    }
  };

  const stats = [
    { label: 'Total Campaigns', value: '1,247', icon: Target, color: 'text-primary' },
    { label: 'Total Raised', value: '₿2,456 ETH', icon: TrendingUp, color: 'text-chart-3' },
    { label: 'Active Campaigns', value: '342', icon: Zap, color: 'text-chart-4' },
    { label: 'Contributors', value: '15,234', icon: Users, color: 'text-chart-2' },
  ];

  const filterOptions = [
    { key: 'all', label: 'All Campaigns' },
    { key: 'active', label: 'Active' },
    { key: 'funded', label: 'Funded' },
    { key: 'expired', label: 'Expired' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Fund the Future
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover and support innovative projects on the blockchain. 
            Transparent, secure, and decentralized crowdfunding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button size="lg" className="min-w-[200px]" data-testid="button-start-campaign">
                Start a Campaign
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="min-w-[200px]" data-testid="button-explore-campaigns">
              Explore Campaigns
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-b">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center hover-elevate">
                <CardContent className="p-6">
                  <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold mb-1" data-testid={`stat-value-${index}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-campaigns"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {filterOptions.map((option) => (
                <Button
                  key={option.key}
                  variant={filter === option.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(option.key as any)}
                  data-testid={`button-filter-${option.key}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-muted-foreground" data-testid="text-results-count">
              {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Campaigns Grid */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading campaigns from blockchain...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
              <h3 className="text-xl font-semibold mb-2">Failed to load campaigns</h3>
              <p className="text-muted-foreground mb-6">
                Unable to connect to the blockchain. Please check your connection.
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  {...campaign}
                  onViewDetails={handleViewDetails}
                  onContribute={handleContribute}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setFilter('all'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Contribute Modal */}
      {contributeModal.campaign && (
        <ContributeModal
          open={contributeModal.isOpen}
          onOpenChange={(isOpen) => setContributeModal({ isOpen, campaign: null })}
          campaignId={contributeModal.campaign.id}
          campaignTitle={contributeModal.campaign.title}
          goal={contributeModal.campaign.goal}
          amountRaised={contributeModal.campaign.amountRaised}
        />
      )}
    </div>
  );
}
