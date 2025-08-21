import { LucideIcon } from "lucide-react";

interface SpeedGaugeProps {
  value: number;
  maxValue: number;
  label: string;
  unit: string;
  color: string;
  icon: LucideIcon;
  isMain?: boolean;
}

export const SpeedGauge = ({ 
  value, 
  maxValue, 
  label, 
  unit, 
  color, 
  icon: Icon,
  isMain = false
}: SpeedGaugeProps) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const size = isMain ? 300 : 120;
  const strokeWidth = isMain ? 12 : 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference * 0.75; // 3/4 circle
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

  if (isMain) {
    return (
      <div className="relative flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg 
            className="transform -rotate-90" 
            width={size} 
            height={size}
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={0}
              className="opacity-20"
              transform={`rotate(135 ${size / 2} ${size / 2})`}
            />
            {/* Progress arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={`hsl(var(${color}))`}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              transform={`rotate(135 ${size / 2} ${size / 2})`}
              style={{
                filter: `drop-shadow(0 0 12px hsl(var(${color}) / 0.6))`
              }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center mb-4">
              <div 
                className="text-5xl font-bold mb-2" 
                style={{ color: `hsl(var(${color}))` }}
              >
                {value.toFixed(2)}
              </div>
              <div className="text-lg text-muted-foreground flex items-center justify-center space-x-2">
                <Icon className="w-5 h-5" style={{ color: `hsl(var(${color}))` }} />
                <span>{unit}</span>
              </div>
            </div>
          </div>

          {/* Speed scale numbers */}
          <div className="absolute inset-0">
            {[0, 5, 10, 50, 100, 250, 500, 750, 1000].map((speed, index) => {
              const angle = 135 + (index * 270 / 8); // Distribute across 270 degrees
              const radian = (angle * Math.PI) / 180;
              const x = size / 2 + (radius + 25) * Math.cos(radian);
              const y = size / 2 + (radius + 25) * Math.sin(radian);
              
              return (
                <div
                  key={speed}
                  className="absolute text-sm text-muted-foreground font-medium"
                  style={{
                    left: x - 15,
                    top: y - 10,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {speed}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Small gauge for secondary metrics
  return (
    <div className="flex items-center space-x-3">
      <div className="relative" style={{ width: 60, height: 60 }}>
        <svg className="transform -rotate-90" width={60} height={60}>
          <circle
            cx="30"
            cy="30"
            r="25"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
            fill="none"
            className="opacity-20"
          />
          <circle
            cx="30"
            cy="30"
            r="25"
            stroke={`hsl(var(${color}))`}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 157} 157`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-5 h-5" style={{ color: `hsl(var(${color}))` }} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: `hsl(var(${color}))` }}>
          {value.toFixed(value >= 100 ? 0 : 1)}
        </div>
        <div className="text-sm text-muted-foreground">{label} {unit}</div>
      </div>
    </div>
  );
};