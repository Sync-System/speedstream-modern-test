import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Download, Upload, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeedTestState {
  isRunning: boolean;
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  progress: number;
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
  const [state, setState] = useState<SpeedTestState>({
    isRunning: false,
    phase: 'idle',
    downloadSpeed: 0,
    uploadSpeed: 0,
    ping: 0,
    progress: 0,
  });

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

    setState(prev => ({ ...prev, phase: 'complete', progress: 100, isRunning: false }));
  };

  const resetTest = () => {
    setState({
      isRunning: false,
      phase: 'idle',
      downloadSpeed: 0,
      uploadSpeed: 0,
      ping: 0,
      progress: 0,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Main Test Button */}
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-button bg-clip-text text-transparent">
            SpeedStream
          </h1>
          <p className="text-xl text-muted-foreground">
            Test your internet speed with precision
          </p>
        </div>

        <div className="relative">
          {!state.isRunning && state.phase === 'idle' && (
            <Button
              onClick={runSpeedTest}
              size="lg"
              className="h-24 w-24 rounded-full bg-gradient-button hover:scale-105 transition-all duration-300 glow-effect"
            >
              <Play className="w-8 h-8 ml-1" />
            </Button>
          )}

          {state.isRunning && (
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-muted animate-spin-slow">
                <div 
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary transition-all duration-300"
                  style={{
                    transform: `rotate(${state.progress * 3.6}deg)`
                  }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium">{Math.round(state.progress)}%</span>
              </div>
            </div>
          )}

          {state.phase === 'complete' && (
            <Button
              onClick={resetTest}
              size="lg"
              className="h-24 w-24 rounded-full bg-gradient-button hover:scale-105 transition-all duration-300"
            >
              <Play className="w-8 h-8 ml-1" />
            </Button>
          )}
        </div>

        {state.isRunning && (
          <div className="text-lg font-medium animate-pulse-slow">
            {state.phase === 'ping' && 'Testing ping...'}
            {state.phase === 'download' && 'Testing download speed...'}
            {state.phase === 'upload' && 'Testing upload speed...'}
          </div>
        )}
      </div>

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

      {/* Results Summary */}
      {state.phase === 'complete' && (
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
          <h3 className="text-xl font-semibold mb-4 text-center">Test Results</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Download</div>
              <div className="text-2xl font-bold text-speed-download">
                {state.downloadSpeed.toFixed(1)} Mbps
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Upload</div>
              <div className="text-2xl font-bold text-speed-upload">
                {state.uploadSpeed.toFixed(1)} Mbps
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Ping</div>
              <div className="text-2xl font-bold text-speed-ping">
                {state.ping.toFixed(0)} ms
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}