import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Moon, Sun, Plus, Home, Wallet } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useWeb3 } from './Web3Provider';

export default function Header() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { account, isConnected, connectWallet } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CF</span>
            </div>
            <span className="font-bold text-xl">CrowdFund</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/">
              <Button 
                variant={location === '/' ? 'secondary' : 'ghost'} 
                size="sm"
                data-testid="nav-home"
              >
                <Home className="w-4 h-4 mr-2" />
                Explore
              </Button>
            </Link>
            
            <Link href="/create">
              <Button 
                variant={location === '/create' ? 'secondary' : 'ghost'} 
                size="sm"
                data-testid="nav-create"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Wallet Status */}
            {isConnected && account ? (
              <Badge variant="outline" className="hidden sm:flex" data-testid="badge-wallet-connected">
                <div className="w-2 h-2 bg-chart-3 rounded-full mr-2"></div>
                {formatAddress(account)}
              </Badge>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={connectWallet}
                className="hidden sm:flex"
                data-testid="button-connect-wallet-header"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Mobile Create Button */}
            <Link href="/create" className="md:hidden">
              <Button size="icon" data-testid="button-create-mobile">
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
