"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, RefreshCw, AlertTriangle } from "lucide-react";
import { generateStartupIdea, fallbackIdeas, StartupIdea } from "@/lib/openai";

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 5,
  timeWindow: 60000, // 1 minute in milliseconds
  cooldown: 10000, // 10 seconds cooldown after hitting rate limit
  minCooldownDisplay: 10 // Minimum cooldown to display in seconds
};

export default function ClientPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [startupIdea, setStartupIdea] = useState<StartupIdea | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(RATE_LIMIT.minCooldownDisplay);
  
  // Rate limiting state
  const requestTimestamps = useRef<number[]>([]);
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  // Security measures
  const [securityViolation, setSecurityViolation] = useState(false);

  // Only run client-side code after component mounts
  useEffect(() => {
    setIsMounted(true);
    
    // Clean up timers on unmount
    return () => {
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, []);

  // Check if rate limited
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    
    // Remove timestamps older than the time window
    requestTimestamps.current = requestTimestamps.current.filter(
      timestamp => now - timestamp < RATE_LIMIT.timeWindow
    );
    
    // If we're already rate limited, don't allow more requests
    if (isRateLimited) return true;
    
    // Check if we've hit the rate limit
    if (requestTimestamps.current.length >= RATE_LIMIT.maxRequests) {
      setIsRateLimited(true);
      setCooldownRemaining(RATE_LIMIT.minCooldownDisplay);
      
      // Start countdown timer
      countdownInterval.current = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            if (countdownInterval.current) clearInterval(countdownInterval.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Set cooldown timer
      cooldownTimer.current = setTimeout(() => {
        setIsRateLimited(false);
        requestTimestamps.current = [];
        if (countdownInterval.current) clearInterval(countdownInterval.current);
        setCooldownRemaining(0);
      }, RATE_LIMIT.cooldown);
      
      return true;
    }
    
    // Add current timestamp to the list
    requestTimestamps.current.push(now);
    return false;
  };

  // Force rate limit for testing or after certain actions
  const forceRateLimit = () => {
    setIsRateLimited(true);
    setCooldownRemaining(RATE_LIMIT.minCooldownDisplay);
    
    // Start countdown timer
    countdownInterval.current = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev <= 1) {
          if (countdownInterval.current) clearInterval(countdownInterval.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Set cooldown timer
    cooldownTimer.current = setTimeout(() => {
      setIsRateLimited(false);
      requestTimestamps.current = [];
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      setCooldownRemaining(0);
    }, RATE_LIMIT.cooldown);
  };

  // Basic input sanitization
  const sanitizeData = (data: any): any => {
    if (typeof data === 'string') {
      // Remove potential XSS vectors
      return data
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    } else if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
      } else {
        const sanitized: Record<string, any> = {};
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            sanitized[key] = sanitizeData(data[key]);
          }
        }
        return sanitized;
      }
    }
    return data;
  };

  const handleGenerate = async () => {
    if (!isMounted) return; // Only run on client side
    
    // Check for rate limiting
    if (checkRateLimit()) {
      setError(`Rate limit exceeded. Please wait ${cooldownRemaining} seconds.`);
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Force a new API call each time
      const idea = await generateStartupIdea();
      
      // Validate and sanitize the response
      if (!idea || typeof idea !== 'object' || !idea.name || !idea.tagline || !idea.tweet) {
        throw new Error("Invalid response format from API");
      }
      
      // Sanitize the data to prevent XSS
      const sanitizedIdea = sanitizeData(idea);
      console.log("Generated idea:", sanitizedIdea); // Debug log
      
      setStartupIdea(sanitizedIdea);
      
      // After 3 successful generations, force a rate limit for demo purposes
      if (requestTimestamps.current.length >= 3) {
        forceRateLimit();
      }
    } catch (error) {
      console.error("Failed to generate startup idea:", error);
      setError("Failed to generate a startup idea. Please try again.");
      
      // Use a fallback idea if the API call fails
      if (fallbackIdeas.length > 0) {
        const randomIndex = Math.floor(Math.random() * fallbackIdeas.length);
        setStartupIdea(sanitizeData(fallbackIdeas[randomIndex]));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTweet = () => {
    if (!startupIdea) return;
    
    try {
      const tweetText = encodeURIComponent(startupIdea.tweet);
      // Open in a new tab with security attributes
      const newWindow = window.open(`https://x.com/intent/tweet?text=${tweetText}`, '_blank');
      if (newWindow) newWindow.opener = null; // Prevent reverse tabnabbing
    } catch (error) {
      console.error("Error opening tweet window:", error);
      setError("Failed to open X. Please try again.");
    }
  };

  const handlePivot = () => {
    // Check for rate limiting
    if (checkRateLimit()) {
      setError(`Rate limit exceeded. Please wait ${cooldownRemaining} seconds.`);
      return;
    }
    
    setStartupIdea(null);
    handleGenerate();
  };

  // Security violation handler
  if (securityViolation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-background/90">
        <div className="max-w-md w-full">
          <Card className="border-destructive shadow-lg backdrop-blur-sm bg-card/90">
            <CardHeader className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold text-destructive">
                Security Alert
              </CardTitle>
              <CardDescription className="text-destructive/80">
                Suspicious activity detected. Please refresh the page and try again.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Render a static placeholder until the component is mounted
  if (!isMounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-background/90">
        <div className="w-full max-w-md px-2 sm:px-0">
          <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/90 hover:shadow-xl transition-all duration-300 ring-1 ring-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                VibeShip
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Generate viral AI startup ideas with one click
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex justify-center py-6 sm:py-8">
                <div className="h-10 w-48 bg-muted/50 rounded-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-center text-xs text-muted-foreground mt-4">
            Built by <a href="https://x.com/roshanchandna" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Roshan</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-background/90">
      <div className="w-full max-w-md px-2 sm:px-0">
        <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/90 hover:shadow-xl transition-all duration-300 ring-1 ring-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              VibeShip
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Generate viral AI startup ideas with one click
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!startupIdea ? (
              <div className="flex justify-center py-6 sm:py-8">
                <Button 
                  size="lg" 
                  className="group relative overflow-hidden transition-all duration-300 ease-out hover:bg-primary/90 text-sm sm:text-base"
                  onClick={handleGenerate}
                  disabled={isGenerating || isRateLimited}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isGenerating ? "Generating..." : isRateLimited ? `Cooldown (${cooldownRemaining}s)` : "Generate My AI Startup"} 
                    <Rocket className="h-4 w-4" />
                  </span>
                  <span className="absolute inset-0 z-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 py-3 sm:py-4 text-center">
                <h3 className="text-lg sm:text-xl font-bold flex items-center justify-center gap-2">
                  <Rocket className="h-4 w-4 sm:h-5 sm:w-5" /> {startupIdea.name}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground italic">"{startupIdea.tagline}"</p>
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-muted/30 rounded-md text-xs sm:text-sm">
                  {startupIdea.tweet}
                </div>
                {error && (
                  <p className="text-xs text-destructive mt-2">
                    {error}
                  </p>
                )}
              </div>
            )}
          </CardContent>
          
          {startupIdea && (
            <CardFooter className="flex justify-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap px-3 sm:px-6">
              <Button 
                variant="default" 
                className="flex items-center gap-2 text-xs sm:text-sm"
                onClick={handleTweet}
                disabled={isRateLimited}
              >
                <svg className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.2833 10.1417L23.2178 0H21.1006L13.3427 8.71333L7.14656 0H0L9.36828 13.2867L0 24H2.11722L10.3089 14.7167L16.8534 24H24L14.2833 10.1417ZM11.3833 13.4333L10.4089 12.0633L2.88333 1.67833H6.05944L12.0739 10.0767L13.0483 11.4467L21.0739 22.4333H17.8978L11.3833 13.4333Z" />
                </svg> X Now
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 text-xs sm:text-sm"
                onClick={handlePivot}
                disabled={isGenerating || isRateLimited}
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" /> 
                {isRateLimited ? `Cooldown (${cooldownRemaining}s)` : "Pivot"}
              </Button>
            </CardFooter>
          )}
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-4">
          Built by <a href="https://x.com/roshanchandna" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Roshan</a>
        </p>
      </div>
    </div>
  );
} 