import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Download, Upload, Wifi, Globe, Activity, Zap, RotateCcw, RefreshCw } from "lucide-react";
import { NetworkGlobe } from "./NetworkGlobe";
import { SpeedMetrics } from "./SpeedMetrics";
import { NetworkStatus } from "./NetworkStatus";
import { useNetworkInfo } from "@/hooks/useNetworkInfo";
import { cn } from "@/lib/utils";

interface SpeedTestState {
  isRunning: boolean;
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  progress: number;
  jitter: number;
  packetLoss: number;
  serverLocation: string;
  testHistory: TestResult[];
}

interface TestResult {
  id: string;
  timestamp: Date;
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

const SpeedGauge = ({ 
  value, 
  maxValue, 
  label, 
  unit, 
  color, 
  icon: Icon 
}: { 
  value: number; 
  maxValue: number; 
  label: string; 
  unit: string; 
  color: string;
  icon: any;
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            fill="none"
            className="opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={`hsl(var(${color}))`}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px hsl(var(${color}) / 0.5))`
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={`w-8 h-8`} style={{ color: `hsl(var(${color}))` }} />
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold" style={{ color: `hsl(var(${color}))` }}>
          {value.toFixed(1)}
        </div>
        <div className="text-sm text-muted-foreground">{unit}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
};

export function SpeedTest() {
  const { networkInfo, loading: networkLoading, error: networkError, refreshNetworkInfo } = useNetworkInfo();
  
  const [state, setState] = useState<SpeedTestState>({
    isRunning: false,
    phase: 'idle',
    downloadSpeed: 0,
    uploadSpeed: 0,
    ping: 0,
    progress: 0,
    jitter: 0,
    packetLoss: 0,
    serverLocation: networkInfo.location.city ? `${networkInfo.location.city}, ${networkInfo.location.region}` : 'Detecting...',
    testHistory: [],
  });

  
  // Update server location when network info changes
  useEffect(() => {
    if (networkInfo.location.city && networkInfo.location.region) {
      setState(prev => ({
        ...prev,
        serverLocation: `${networkInfo.location.city}, ${networkInfo.location.region}`
      }));
    }
  }, [networkInfo]);

  const runSpeedTest = async () => {
    setState(prev => ({ ...prev, isRunning: true, phase: 'ping', progress: 0 }));

    // Simulate ping test
    setState(prev => ({ ...prev, phase: 'ping' }));
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 30));
      setState(prev => ({ 
        ...prev, 
        progress: i * 0.2,
        ping: Math.min(15 + Math.random() * 20, 50)
      }));
    }

    // Simulate download test
    setState(prev => ({ ...prev, phase: 'download', progress: 20 }));
    for (let i = 0; i <= 100; i += 1) {
      await new Promise(resolve => setTimeout(resolve, 40));
      setState(prev => ({ 
        ...prev, 
        progress: 20 + (i * 0.4),
        downloadSpeed: Math.min(i * 0.5 + Math.random() * 10, 100)
      }));
    }

    // Simulate upload test
    setState(prev => ({ ...prev, phase: 'upload', progress: 60 }));
    for (let i = 0; i <= 100; i += 1) {
      await new Promise(resolve => setTimeout(resolve, 35));
      setState(prev => ({ 
        ...prev, 
        progress: 60 + (i * 0.4),
        uploadSpeed: Math.min(i * 0.3 + Math.random() * 8, 50)
      }));
    }

    // Calculate final metrics
    const jitter = 5 + Math.random() * 15;
    const packetLoss = Math.random() * 2;
    const grade = getSpeedGrade(state.downloadSpeed, state.uploadSpeed, state.ping);
    
    const newResult: TestResult = {
      id: Date.now().toString(),
      timestamp: new Date(),
      downloadSpeed: state.downloadSpeed,
      uploadSpeed: state.uploadSpeed,
      ping: state.ping,
      grade,
    };

    setState(prev => ({ 
      ...prev, 
      phase: 'complete', 
      progress: 100, 
      isRunning: false,
      jitter,
      packetLoss,
      testHistory: [newResult, ...prev.testHistory.slice(0, 4)]
    }));
  };

  const getSpeedGrade = (download: number, upload: number, ping: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
    const score = (download * 0.4) + (upload * 0.3) + ((100 - Math.min(ping, 100)) * 0.3);
    if (score >= 80) return 'A';
    if (score >= 65) return 'B';
    if (score >= 50) return 'C';
    if (score >= 35) return 'D';
    return 'F';
  };

  const resetTest = () => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      phase: 'idle',
      downloadSpeed: 0,
      uploadSpeed: 0,
      ping: 0,
      progress: 0,
      jitter: 0,
      packetLoss: 0,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold bg-gradient-button bg-clip-text text-transparent">
            SpeedStream Pro
          </h1>
          <p className="text-xl text-muted-foreground">
            Professional Network Performance Analysis
          </p>
          <div className="flex justify-center items-center space-x-4 mt-4">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Globe className="w-3 h-3" />
              <span>{networkInfo.location.city ? `${networkInfo.location.city}, ${networkInfo.location.region}` : 'Detecting...'}</span>
            </Badge>
            <Badge variant={networkInfo.isOnline ? "default" : "destructive"} className="flex items-center space-x-1">
              <Wifi className="w-3 h-3" />
              <span>{networkInfo.isOnline ? networkInfo.connectionType : 'Offline'}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>{networkInfo.publicIP}</span>
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshNetworkInfo}
              className="h-6 w-6 p-0"
              disabled={networkLoading}
            >
              <RefreshCw className={cn("w-3 h-3", networkLoading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Main Control Panel */}
        <div className="flex justify-center items-center space-x-6">
          <div className="relative">
            {!state.isRunning && state.phase === 'idle' && (
              <Button
                onClick={runSpeedTest}
                size="lg"
                className="h-32 w-32 rounded-full bg-gradient-button hover:scale-105 transition-all duration-300 glow-effect text-lg"
              >
                <Play className="w-10 h-10 ml-1" />
              </Button>
            )}

            {state.isRunning && (
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-muted animate-spin-slow">
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary transition-all duration-300"
                    style={{
                      transform: `rotate(${state.progress * 3.6}deg)`
                    }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-medium">{Math.round(state.progress)}%</span>
                  <span className="text-xs text-muted-foreground">
                    {state.phase === 'ping' && 'Testing Ping'}
                    {state.phase === 'download' && 'Download'}
                    {state.phase === 'upload' && 'Upload'}
                  </span>
                </div>
              </div>
            )}

            {state.phase === 'complete' && (
              <div className="flex space-x-2">
                <Button
                  onClick={resetTest}
                  size="lg"
                  className="h-32 w-32 rounded-full bg-gradient-button hover:scale-105 transition-all duration-300"
                >
                  <Play className="w-10 h-10 ml-1" />
                </Button>
                <Button
                  onClick={runSpeedTest}
                  variant="outline"
                  size="lg"
                  className="h-16 w-16 rounded-full"
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="test" className="w-full">
        <TabsList className="grid w-full grid-cols-5 glass-card">
          <TabsTrigger value="test" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Speed Test</span>
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center space-x-2">
            <Wifi className="w-4 h-4" />
            <span>Network</span>
          </TabsTrigger>
          <TabsTrigger value="globe" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Global Map</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-6 mt-6">

          {/* Speed Gauges */}
          {(state.phase !== 'idle' || state.downloadSpeed > 0) && (
            <div className="glass-card rounded-2xl p-8 animate-scale-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                <SpeedGauge
                  value={state.ping}
                  maxValue={100}
                  label="Ping"
                  unit="ms"
                  color="--speed-ping"
                  icon={Wifi}
                />
                <SpeedGauge
                  value={state.downloadSpeed}
                  maxValue={200}
                  label="Download"
                  unit="Mbps"
                  color="--speed-download"
                  icon={Download}
                />
                <SpeedGauge
                  value={state.uploadSpeed}
                  maxValue={100}
                  label="Upload"
                  unit="Mbps"
                  color="--speed-upload"
                  icon={Upload}
                />
              </div>
            </div>
          )}

          {/* Enhanced Results Summary */}
          {state.phase === 'complete' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <Card className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Badge variant={
                    getSpeedGrade(state.downloadSpeed, state.uploadSpeed, state.ping) === 'A' ? 'default' :
                    getSpeedGrade(state.downloadSpeed, state.uploadSpeed, state.ping) === 'B' ? 'secondary' : 'destructive'
                  }>
                    Grade {getSpeedGrade(state.downloadSpeed, state.uploadSpeed, state.ping)}
                  </Badge>
                  <span>Performance Score</span>
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Download</div>
                    <div className="text-2xl font-bold text-speed-download">
                      {state.downloadSpeed.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">Mbps</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Upload</div>
                    <div className="text-2xl font-bold text-speed-upload">
                      {state.uploadSpeed.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">Mbps</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Ping</div>
                    <div className="text-2xl font-bold text-speed-ping">
                      {state.ping.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">ms</div>
                  </div>
                </div>
              </Card>
              
              <Card className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-4">Network Quality</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Jitter:</span>
                    <span className="font-medium">{state.jitter.toFixed(1)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Packet Loss:</span>
                    <span className="font-medium">{state.packetLoss.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Server:</span>
                    <span className="font-medium">{state.serverLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Public IP:</span>
                    <span className="font-medium font-mono text-xs">{networkInfo.publicIP}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">ISP:</span>
                    <span className="font-medium">{networkInfo.isp}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="network" className="mt-6">
          <NetworkStatus />
        </TabsContent>

        <TabsContent value="globe" className="mt-6">
          <Card className="glass-card p-6 h-96">
            <NetworkGlobe isActive={state.isRunning} />
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <SpeedMetrics isRunning={state.isRunning} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">Test History</h3>
            {state.testHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No tests completed yet</p>
            ) : (
              <div className="space-y-3">
                {state.testHistory.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-3 rounded-lg border border-muted">
                    <div className="flex items-center space-x-3">
                      <Badge variant={
                        result.grade === 'A' ? 'default' :
                        result.grade === 'B' ? 'secondary' : 'destructive'
                      }>
                        {result.grade}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {result.timestamp.toLocaleDateString()} {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-speed-download">{result.downloadSpeed.toFixed(1)} Mbps</span>
                      <span className="text-speed-upload">{result.uploadSpeed.toFixed(1)} Mbps</span>
                      <span className="text-speed-ping">{result.ping.toFixed(0)}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}