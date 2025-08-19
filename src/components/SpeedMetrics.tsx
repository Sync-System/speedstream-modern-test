import { useState, useEffect } from "react";
import { useNetworkInfo } from "@/hooks/useNetworkInfo";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Wifi, 
  Zap, 
  Shield, 
  Globe, 
  Smartphone,
  Router,
  TrendingUp 
} from "lucide-react";

interface NetworkMetrics {
  jitter: number;
  packetLoss: number;
  bandwidth: number;
  latency: number;
  stability: number;
  serverLoad: number;
  location: string;
  isp: string;
  connectionType: string;
  ipAddress: string;
}

export function SpeedMetrics({ isRunning }: { isRunning: boolean }) {
  const { networkInfo } = useNetworkInfo();
  
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    jitter: 0,
    packetLoss: 0,
    bandwidth: networkInfo.downloadSpeed || 0,
    latency: 0,
    stability: 0,
    serverLoad: 0,
    location: networkInfo.location.city ? `${networkInfo.location.city}, ${networkInfo.location.region}` : "Detecting...",
    isp: networkInfo.isp,
    connectionType: networkInfo.connectionType,
    ipAddress: networkInfo.publicIP
  });

  
  // Update metrics when network info changes
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      location: networkInfo.location.city ? `${networkInfo.location.city}, ${networkInfo.location.region}` : "Detecting...",
      isp: networkInfo.isp,
      connectionType: networkInfo.connectionType,
      ipAddress: networkInfo.publicIP,
      bandwidth: networkInfo.downloadSpeed || prev.bandwidth
    }));
  }, [networkInfo]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        jitter: Math.max(0, Math.min(100, prev.jitter + (Math.random() - 0.5) * 10)),
        packetLoss: Math.max(0, Math.min(5, prev.packetLoss + (Math.random() - 0.5) * 0.5)),
        bandwidth: Math.max(0, Math.min(1000, prev.bandwidth + (Math.random() - 0.5) * 50)),
        latency: Math.max(0, Math.min(200, prev.latency + (Math.random() - 0.5) * 20)),
        stability: Math.max(0, Math.min(100, prev.stability + (Math.random() - 0.5) * 5)),
        serverLoad: Math.max(0, Math.min(100, prev.serverLoad + (Math.random() - 0.5) * 10))
      }));
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning]);

  const getQualityBadge = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return { label: "Excellent", variant: "default" as const };
    if (value <= thresholds[1]) return { label: "Good", variant: "secondary" as const };
    return { label: "Poor", variant: "destructive" as const };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Network Quality Metrics */}
      <Card className="glass-card p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Activity className="w-5 h-5 text-speed-download" />
          <h3 className="font-semibold">Network Quality</h3>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Jitter</span>
              <Badge {...getQualityBadge(metrics.jitter, [10, 30])}>
                {metrics.jitter.toFixed(1)}ms
              </Badge>
            </div>
            <Progress value={Math.max(0, 100 - metrics.jitter)} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Packet Loss</span>
              <Badge {...getQualityBadge(metrics.packetLoss, [1, 3])}>
                {metrics.packetLoss.toFixed(2)}%
              </Badge>
            </div>
            <Progress value={Math.max(0, 100 - metrics.packetLoss * 20)} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Stability</span>
              <Badge variant="default">{metrics.stability.toFixed(0)}%</Badge>
            </div>
            <Progress value={metrics.stability} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Connection Info */}
      <Card className="glass-card p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Globe className="w-5 h-5 text-speed-upload" />
          <h3 className="font-semibold">Connection Details</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location:</span>
            <span>{metrics.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ISP:</span>
            <span>{metrics.isp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className="flex items-center space-x-1">
              <Wifi className="w-3 h-3" />
              <span>{metrics.connectionType}</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">IP:</span>
            <span className="font-mono text-xs">{metrics.ipAddress}</span>
          </div>
        </div>
      </Card>

      {/* Server Performance */}
      <Card className="glass-card p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Router className="w-5 h-5 text-speed-ping" />
          <h3 className="font-semibold">Server Status</h3>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Server Load</span>
              <Badge {...getQualityBadge(metrics.serverLoad, [50, 80])}>
                {metrics.serverLoad.toFixed(0)}%
              </Badge>
            </div>
            <Progress value={metrics.serverLoad} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Response Time</span>
              <span className="text-sm font-medium">{metrics.latency.toFixed(0)}ms</span>
            </div>
            <Progress value={Math.max(0, 100 - metrics.latency / 2)} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Real-time Analytics */}
      <Card className="glass-card p-4 md:col-span-2 lg:col-span-3">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Performance Analytics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-speed-download">
              {metrics.bandwidth.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">Mbps Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-speed-upload">
              {(100 - metrics.packetLoss).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">% Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-speed-ping">
              {metrics.latency.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">ms Avg Latency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {metrics.stability.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">Connection Score</div>
          </div>
        </div>
      </Card>
    </div>
  );
}