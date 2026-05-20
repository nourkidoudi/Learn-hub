import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Sparkles, MessageCircle, Brain, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const AITutorSection = () => {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI Tutor. Ask me anything about your courses, and I'll help you understand better. What would you like to learn today?" }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setChatMessages([...chatMessages, 
      { role: "user", content: message },
      { role: "assistant", content: "That's a great question! Let me help you understand this concept better. Based on your learning progress, I'd recommend starting with the fundamentals and then moving to practical examples..." }
    ]);
    setMessage("");
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Learning</span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Your Personal
              <span className="text-gradient block mt-2">AI Tutor</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              Get instant answers, personalized explanations, and adaptive learning recommendations powered by advanced AI technology.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">24/7 Q&A Support</h4>
                  <p className="text-sm text-muted-foreground">Get instant answers to your questions anytime, anywhere</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Contextual Understanding</h4>
                  <p className="text-sm text-muted-foreground">AI that understands your course content and learning history</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Quiz Generation</h4>
                  <p className="text-sm text-muted-foreground">Auto-generated quizzes to test and reinforce your knowledge</p>
                </div>
              </div>
            </div>

            <Button variant="hero" size="lg" asChild>
              <Link to="/ai-tutor">
                <Sparkles className="w-5 h-5 mr-2" />
                Try AI Tutor Free
              </Link>
            </Button>
          </div>

          {/* Right: Chat Demo */}
          <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-hero p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-primary-foreground">AI Tutor</h4>
                <p className="text-sm text-primary-foreground/70">Always here to help</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-primary-foreground/70">Online</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-md' 
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input 
                  placeholder="Ask your AI Tutor anything..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} size="icon" variant="hero">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AITutorSection;
