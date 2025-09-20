import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Web3Provider } from "@/components/Web3Provider";
import Header from "@/components/Header";
import Home from "@/pages/Home";
import CreateCampaign from "@/pages/CreateCampaign";
import NotFound from "@/pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreateCampaign} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Web3Provider>
            <div className="min-h-screen bg-background text-foreground">
              <Header />
              <main>
                <Router />
              </main>
            </div>
            <Toaster />
          </Web3Provider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
