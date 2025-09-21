import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare, Sparkles, Shield, Zap, Brain, ChevronRight } from 'lucide-react';
import { sessionService, Session } from '@/services/sessionService';
import { useToast } from '@/hooks/use-toast';
interface SessionSetupProps {
  onSessionCreated: (session: Session) => void;
}
export const SessionSetup = ({
  onSessionCreated
}: SessionSetupProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const {
    toast
  } = useToast();
  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      const session = await sessionService.createSession();
      toast({
        title: "Session Created",
        description: "Your AI chat session is ready!"
      });
      onSessionCreated(session);
    } catch (error) {
      console.error('Failed to create session:', error);
      toast({
        variant: "destructive",
        title: "Failed to Create Session",
        description: "Please check your connection and try again."
      });
    } finally {
      setIsCreating(false);
    }
  };
  const features = [{
    icon: Brain,
    title: "Advanced Function Calling",
    description: "Watch AI execute tools and functions in real-time with intelligent decision making"
  }, {
    icon: Zap,
    title: "Streaming Intelligence",
    description: "Experience responses as they're generated with ultra-fast processing speeds"
  }, {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption ensures your conversations remain private and secure"
  }];
  return <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      
      <div className="relative w-full max-w-lg space-y-8 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20 hover-scale">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl opacity-60 animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Startup Analyzer Agent InsightSprout</h1>
            <p className="text-muted-foreground leading-relaxed mx-0 px-0 my-0 text-sm text-center font-medium">Enterprise-grade multi-agent architecture for startup analysis, seamlessly integrating MCP orchestration and advanced web browsing agents for holistic market, technology, and competitor insights.</p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-2xl bg-card/90 backdrop-blur-sm hover-scale">
          
          <CardContent className="space-y-8 px-8 pb-8 glass border border-white/10">
            {/* Features Grid */}
            <div className="space-y-6 mx-0 my-px py-[6px]">
              {features.map((feature, index) => {
              const Icon = feature.icon;
              return <div key={feature.title} style={{
                animationDelay: `${index * 150}ms`
              }} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-transparent hover:from-muted/80 transition-all duration-300 hover-scale my-[14px] py-[10px]">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{feature.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>;
            })}
            </div>

            {/* CTA Button */}
            <Button onClick={handleCreateSession} disabled={isCreating} className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group">
              {isCreating ? <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Initializing Session...</span>
                </div> : <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span>Start Intelligent Chat</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>}
            </Button>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-6 pt-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Shield className="w-3 h-3" />
                <span>Enterprise Security</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
              <div className="flex items-center space-x-2">
                <Zap className="w-3 h-3" />
                <span>Real-time Processing</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
              <div className="flex items-center space-x-2">
                <Brain className="w-3 h-3" />
                <span>Advanced AI</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Powered by Advanced AI Technology • Secure & Private
          </p>
        </div>
      </div>
    </div>;
};