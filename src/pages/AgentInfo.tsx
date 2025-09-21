import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, MessageSquare, FileText, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AgentInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">Agent Information</h1>
          <p className="text-muted-foreground text-lg">Learn about InsightSprout AI Assistant</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                About InsightSprout
              </CardTitle>
              <CardDescription>
                Your intelligent AI assistant for insights and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                InsightSprout is an advanced AI assistant designed to help you analyze data, 
                generate insights, and provide intelligent responses to your queries. Built with 
                cutting-edge language models, it can process various file types and provide 
                comprehensive analysis.
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Supported File Types
              </CardTitle>
              <CardDescription>
                Wide range of document and media formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold text-foreground">Documents</h4>
                  <p className="text-sm text-muted-foreground">PDF, Word, PowerPoint, Excel, TXT, CSV</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Images</h4>
                  <p className="text-sm text-muted-foreground">JPG, PNG, GIF, SVG, WebP</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Code</h4>
                  <p className="text-sm text-muted-foreground">JS, TS, Python, CSS, HTML, JSON</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Audio</h4>
                  <p className="text-sm text-muted-foreground">MP3, WAV, M4A</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Key Features
              </CardTitle>
              <CardDescription>
                Powerful capabilities at your fingertips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Natural language processing and understanding</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Multi-format file analysis and processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Real-time insights and recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Persistent session management</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Getting Started
              </CardTitle>
              <CardDescription>
                How to make the most of your AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-foreground">
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span>Create a session with your name and preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <span>Upload files or start typing your questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <span>Receive intelligent responses and insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                  <span>Continue the conversation for deeper analysis</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card className="glass mt-6">
          <CardHeader>
            <CardTitle>Privacy & Security</CardTitle>
            <CardDescription>
              Your data and conversations are handled with care
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Data Handling</h4>
                <p className="text-sm text-muted-foreground">
                  All uploaded files and conversations are processed securely. Your data is used 
                  only to provide you with the requested analysis and insights.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Session Management</h4>
                <p className="text-sm text-muted-foreground">
                  Sessions are stored locally in your browser. You can end your session at any 
                  time to clear all conversation history and uploaded files.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentInfo;