import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Zap, Shield, Wifi } from "lucide-react";

export function AdsPromotion() {
  const promotions = [
    {
      title: "Upgrade Your Internet",
      description: "Get faster speeds with our premium internet packages",
      cta: "Learn More",
      badge: "Featured",
      icon: Zap,
      color: "text-blue-500"
    },
    {
      title: "VPN Protection",
      description: "Secure your connection with military-grade encryption",
      cta: "Try Free",
      badge: "Security",
      icon: Shield,
      color: "text-green-500"
    },
    {
      title: "Mesh Network Solution",
      description: "Eliminate dead zones with whole-home WiFi coverage",
      cta: "Shop Now",
      badge: "Popular",
      icon: Wifi,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Optimize Your Internet Experience</h2>
        <p className="text-muted-foreground">Discover solutions to improve your connection</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {promotions.map((promo, index) => (
          <Card key={index} className="glass-card p-6 hover:scale-105 transition-all duration-300 group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <promo.icon className={`w-8 h-8 ${promo.color}`} />
              <Badge variant="secondary" className="text-xs">
                {promo.badge}
              </Badge>
            </div>
            
            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
              {promo.title}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4">
              {promo.description}
            </p>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
            >
              {promo.cta}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        ))}
      </div>

      {/* Banner Ad Space */}
      <Card className="glass-card p-6 text-center bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-center space-x-4">
          <div className="text-left">
            <h3 className="text-xl font-bold mb-1">Premium Speed Test Pro</h3>
            <p className="text-sm text-muted-foreground">Advanced analytics, history tracking, and detailed reports</p>
          </div>
          <Button className="bg-gradient-button hover:scale-105 transition-all">
            Upgrade Now
          </Button>
        </div>
      </Card>
    </div>
  );
}