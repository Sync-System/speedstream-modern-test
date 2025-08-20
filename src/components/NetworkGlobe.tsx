import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ConnectionPoint {
  id: string;
  lat: number;
  lng: number;
  city: string;
  ping: number;
  status: 'connecting' | 'connected' | 'testing';
}

const GLOBAL_SERVERS: ConnectionPoint[] = [
  { id: 'ny', lat: 40.7128, lng: -74.0060, city: 'New York', ping: 12, status: 'connected' },
  { id: 'london', lat: 51.5074, lng: -0.1278, city: 'London', ping: 45, status: 'connected' },
  { id: 'tokyo', lat: 35.6762, lng: 139.6503, city: 'Tokyo', ping: 89, status: 'connected' },
  { id: 'sydney', lat: -33.8688, lng: 151.2093, city: 'Sydney', ping: 156, status: 'connected' },
  { id: 'singapore', lat: 1.3521, lng: 103.8198, city: 'Singapore', ping: 67, status: 'connected' },
  { id: 'frankfurt', lat: 50.1109, lng: 8.6821, city: 'Frankfurt', ping: 34, status: 'connected' },
];

export function NetworkGlobe({ isActive }: { isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;

    let rotation = 0;

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Draw globe background
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, 'hsl(240 21% 12% / 0.8)');
      gradient.addColorStop(0.7, 'hsl(240 19% 16% / 0.6)');
      gradient.addColorStop(1, 'hsl(240 23% 9% / 0.9)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw grid lines
      ctx.strokeStyle = 'hsl(158 64% 52% / 0.2)';
      ctx.lineWidth = 1;
      
      // Meridians
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6 + rotation;
        const radiusX = Math.abs(radius * Math.cos(angle)); // Ensure positive radius
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radius, angle, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Parallels
      for (let i = 1; i < 6; i++) {
        const r = Math.abs(radius * Math.sin((i * Math.PI) / 6)); // Ensure positive radius
        const y = centerY - radius * Math.cos((i * Math.PI) / 6);
        const ellipseHeight = Math.abs(r * 0.3); // Ensure positive height
        
        if (r > 0 && ellipseHeight > 0) { // Only draw if dimensions are valid
          ctx.beginPath();
          ctx.ellipse(centerX, y, r, ellipseHeight, 0, 0, Math.PI * 2);
          ctx.stroke();
          
          const y2 = centerY + radius * Math.cos((i * Math.PI) / 6);
          ctx.beginPath();
          ctx.ellipse(centerX, y2, r, ellipseHeight, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Draw connection points
      GLOBAL_SERVERS.forEach((server) => {
        const phi = (90 - server.lat) * (Math.PI / 180);
        const theta = (server.lng + rotation * 57.2958) * (Math.PI / 180);
        
        const x = centerX + radius * Math.sin(phi) * Math.cos(theta);
        const y = centerY + radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        if (z > 0) { // Only draw points on the visible side
          ctx.fillStyle = selectedServer === server.id 
            ? 'hsl(45 93% 58%)' 
            : isActive && server.status === 'testing'
            ? 'hsl(193 76% 57%)'
            : 'hsl(158 64% 52%)';
          
          const size = selectedServer === server.id ? 8 : 6;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          
          // Glow effect
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // Draw connections to selected server
          if (selectedServer === server.id || (isActive && server.status === 'testing')) {
            ctx.strokeStyle = `hsl(158 64% 52% / 0.6)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        }
      });

      if (isActive) {
        rotation += 0.005;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, selectedServer]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Simple click detection for demo purposes
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const clickedServer = GLOBAL_SERVERS.find((_, index) => {
      const angle = (index * Math.PI * 2) / GLOBAL_SERVERS.length;
      const serverX = centerX + Math.cos(angle) * 100;
      const serverY = centerY + Math.sin(angle) * 100;
      return Math.sqrt((x - serverX) ** 2 + (y - serverY) ** 2) < 30;
    });
    
    if (clickedServer) {
      setSelectedServer(selectedServer === clickedServer.id ? null : clickedServer.id);
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
      />
      
      {/* Server Info Overlay */}
      <div className="absolute top-4 right-4 space-y-2">
        {GLOBAL_SERVERS.map((server) => (
          <div
            key={server.id}
            className={cn(
              "glass-card p-3 rounded-lg transition-all duration-300 cursor-pointer",
              selectedServer === server.id && "ring-2 ring-primary",
              isActive && server.status === 'testing' && "animate-pulse"
            )}
            onClick={() => setSelectedServer(selectedServer === server.id ? null : server.id)}
          >
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                server.status === 'connected' && "bg-speed-download",
                server.status === 'testing' && "bg-speed-upload animate-pulse",
                server.status === 'connecting' && "bg-speed-ping"
              )} />
              <span className="text-sm font-medium">{server.city}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {server.ping}ms
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}