import { useNetworkInfo } from "@/hooks/useNetworkInfo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Globe, 
  Wifi, 
  MapPin, 
  Building, 
  Activity, 
  Clock,
  RefreshCw,
  AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function NetworkStatus() {
  const { networkInfo, loading, error, refreshNetworkInfo } = useNetworkInfo();

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Network Information</h3>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card p-6 border-destructive/20">
        <div className="flex items-center space-x-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Network Detection Failed</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
        <Button 
          onClick={refreshNetworkInfo} 
          variant="outline" 
          size="sm" 
          className="mt-3"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary" />
          <span>Network Information</span>
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refreshNetworkInfo}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge 
              variant={networkInfo.isOnline ? "default" : "destructive"}
              className="flex items-center space-x-1"
            >
              <Wifi className="w-3 h-3" />
              <span>{networkInfo.isOnline ? 'Online' : 'Offline'}</span>
            </Badge>
            <Badge variant="secondary">
              {networkInfo.connectionType}
            </Badge>
            {networkInfo.effectiveType !== 'Unknown' && (
              <Badge variant="outline">
                {networkInfo.effectiveType.toUpperCase()}
              </Badge>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>Public IP:</span>
              </span>
              <span className="font-mono">{networkInfo.publicIP}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center space-x-1">
                <Wifi className="w-3 h-3" />
                <span>Local IP:</span>
              </span>
              <span className="font-mono">{networkInfo.localIP}</span>
            </div>
            {networkInfo.downloadSpeed > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Speed:</span>
                <span>{networkInfo.downloadSpeed} Mbps</span>
              </div>
            )}
          </div>
        </div>

        {/* Location & ISP Info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {networkInfo.location.city && networkInfo.location.region 
                ? `${networkInfo.location.city}, ${networkInfo.location.region}`
                : 'Location detecting...'
              }
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center space-x-1">
                <Building className="w-3 h-3" />
                <span>ISP:</span>
              </span>
              <span className="text-right max-w-[150px] truncate" title={networkInfo.isp}>
                {networkInfo.isp}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>Country:</span>
              </span>
              <span>{networkInfo.location.country || 'Unknown'}</span>
            </div>
            {networkInfo.location.timezone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Timezone:</span>
                </span>
                <span>{networkInfo.location.timezone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Network Quality Indicator */}
      <div className="mt-4 pt-4 border-t border-muted/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Connection Quality:</span>
          <div className="flex items-center space-x-2">
            {networkInfo.isOnline && networkInfo.downloadSpeed > 0 && (
              <>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  networkInfo.downloadSpeed > 25 ? "bg-green-500" :
                  networkInfo.downloadSpeed > 10 ? "bg-yellow-500" : "bg-red-500"
                )} />
                <span className="text-sm font-medium">
                  {networkInfo.downloadSpeed > 25 ? 'Excellent' :
                   networkInfo.downloadSpeed > 10 ? 'Good' : 'Poor'}
                </span>
              </>
            )}
            {!networkInfo.isOnline && (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium">Offline</span>
              </>
            )}
            {networkInfo.isOnline && networkInfo.downloadSpeed === 0 && (
              <>
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <span className="text-sm font-medium">Testing...</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}