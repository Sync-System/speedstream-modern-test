import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Download, Upload, Wifi, Globe, Activity, Zap, RotateCcw, RefreshCw, User } from "lucide-react";
import { SpeedGauge } from "./SpeedGauge";
import { SpeedMetrics } from "./SpeedMetrics";
import { NetworkStatus } from "./NetworkStatus";
import { AdsPromotion } from "./AdsPromotion";
import { InteractiveGlobe } from "./InteractiveGlobe";
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
    <div className="min-h-screen bg-gradient-main text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Top Stats Bar */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Download className="w-5 h-5 text-speed-download" />
                <span className="text-sm font-medium text-muted-foreground">DOWNLOAD</span>
              </div>
              <div className="text-3xl font-bold text-speed-download">
                {state.downloadSpeed > 0 ? state.downloadSpeed.toFixed(2) : "—"}
              </div>
              <div className="text-sm text-muted-foreground">Mbps</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Upload className="w-5 h-5 text-speed-upload" />
                <span className="text-sm font-medium text-muted-foreground">UPLOAD</span>
              </div>
              <div className="text-3xl font-bold text-speed-upload">
                {state.uploadSpeed > 0 ? state.uploadSpeed.toFixed(2) : "—"}
              </div>
              <div className="text-sm text-muted-foreground">Mbps</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Wifi className="w-4 h-4 text-speed-ping" />
                <span className="text-sm font-medium text-muted-foreground">PING</span>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-speed-ping"></div>
                  <span className="text-lg font-bold text-speed-ping">{state.ping > 0 ? state.ping.toFixed(0) : "—"}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-speed-download"></div>
                  <span className="text-lg font-bold text-speed-download">{state.downloadSpeed > 0 ? Math.min(state.downloadSpeed * 2.5, 99).toFixed(0) : "—"}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-speed-upload"></div>
                  <span className="text-lg font-bold text-speed-upload">{state.uploadSpeed > 0 ? Math.min(state.uploadSpeed * 1.8, 99).toFixed(0) : "—"}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">ms</div>
            </div>

            <div className="text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshNetworkInfo}
                className="mb-2"
                disabled={networkLoading}
              >
                <RefreshCw className={cn("w-4 h-4", networkLoading && "animate-spin")} />
              </Button>
              <div className="text-sm text-muted-foreground">
                {networkInfo.location.city ? `${networkInfo.location.city}, ${networkInfo.location.region}` : 'Detecting...'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Speedometer */}
        <div className="flex justify-center mb-8">
          {(state.phase !== 'idle' || state.downloadSpeed > 0) ? (
            <SpeedGauge
              value={state.phase === 'upload' ? state.uploadSpeed : state.downloadSpeed}
              maxValue={1000}
              label={state.phase === 'upload' ? 'Upload' : 'Download'}
              unit="Mbps"
              color={state.phase === 'upload' ? '--speed-upload' : '--speed-download'}
              icon={state.phase === 'upload' ? Upload : Download}
              isMain={true}
            />
          ) : (
            <div className="flex flex-col items-center space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-bold bg-gradient-button bg-clip-text text-transparent">
                  SpeedlyTest
                </h1>
                <p className="text-lg text-muted-foreground">
                  Internet Speed Test - Fast & Accurate Network Analysis
                </p>
              </div>
              
              <Button
                onClick={runSpeedTest}
                size="lg"
                className="h-32 w-32 rounded-full bg-gradient-button hover:scale-105 transition-all duration-300 glow-effect text-lg"
                disabled={state.isRunning}
              >
                {state.isRunning ? (
                  <div className="flex flex-col items-center space-y-1">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                    <span className="text-xs">{Math.round(state.progress)}%</span>
                  </div>
                ) : (
                  <Play className="w-10 h-10 ml-1" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Provider Info */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <div className="font-semibold text-lg">{networkInfo.isp || 'Cybernet'}</div>
                <div className="text-sm text-muted-foreground font-mono">{networkInfo.publicIP}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{networkInfo.isp || 'Cybernet (Pvt) Ltd'}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {networkInfo.location.city || 'Faisalabad'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {state.isRunning && (
          <div className="glass-card rounded-2xl p-2 mb-6">
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-speed-download to-speed-upload transition-all duration-300 ease-out"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {state.phase === 'complete' && (
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              onClick={resetTest}
              size="lg"
              className="bg-gradient-button hover:scale-105 transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              Test Again
            </Button>
            <Button
              onClick={runSpeedTest}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retry
            </Button>
          </div>
        )}

      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="test" className="w-full">
        <TabsList className="grid w-full grid-cols-6 glass-card">
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
          <TabsTrigger value="offers" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Offers</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-6 mt-6">


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
            <InteractiveGlobe isActive={state.isRunning} />
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

        <TabsContent value="offers" className="mt-6">
          <AdsPromotion />
        </TabsContent>
      </Tabs>
    </div>
  );
}