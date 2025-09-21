import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sessionService, Session } from "@/services/sessionService";
import { SessionSetup } from "@/components/SessionSetup";
import { ChatInterface } from "@/components/ChatInterface";
import AgentInfo from "@/pages/AgentInfo";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const existingSession = sessionService.getStoredSession();
    if (existingSession && sessionService.hasValidSession()) {
      setSession(existingSession);
    }
    setIsLoading(false);
  }, []);

  const handleSessionCreated = (newSession: Session) => {
    setSession(newSession);
  };

  const handleSessionEnd = () => {
    setSession(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="bento-box w-20 h-20 flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading InsightSprout...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/agent-info" element={<AgentInfo />} />
            <Route path="/" element={
              session ? (
                <ChatInterface 
                  session={session} 
                  onSessionEnd={handleSessionEnd} 
                />
              ) : (
                <SessionSetup onSessionCreated={handleSessionCreated} />
              )
            } />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
