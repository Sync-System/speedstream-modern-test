import { useState, useEffect } from 'react';

export interface NetworkInfo {
  publicIP: string;
  localIP: string;
  isp: string;
  location: {
    city: string;
    region: string;
    country: string;
    timezone: string;
  };
  connectionType: string;
  networkInterface: string;
  downloadSpeed: number;
  isOnline: boolean;
  effectiveType: string;
}

interface IPApiResponse {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  org: string;
  timezone: string;
}

export function useNetworkInfo() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    publicIP: 'Loading...',
    localIP: 'Detecting...',
    isp: 'Loading...',
    location: {
      city: 'Loading...',
      region: '',
      country: '',
      timezone: '',
    },
    connectionType: 'Unknown',
    networkInterface: 'Unknown',
    downloadSpeed: 0,
    isOnline: navigator.onLine,
    effectiveType: 'Unknown',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get local IP using WebRTC
  const getLocalIP = (): Promise<string> => {
    return new Promise((resolve) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));

      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) return;
        const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)?.[1];
        if (myIP) {
          pc.close();
          resolve(myIP);
        }
      };

      // Fallback after timeout
      setTimeout(() => {
        pc.close();
        resolve('192.168.1.x');
      }, 3000);
    });
  };

  // Get network connection info
  const getConnectionInfo = () => {
    // @ts-ignore - Navigator connection is experimental
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType || 'Unknown',
        type: connection.type || 'Unknown',
        downlink: connection.downlink || 0,
      };
    }
    
    return {
      effectiveType: 'Unknown',
      type: 'Unknown',
      downlink: 0,
    };
  };

  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get connection info immediately
        const connInfo = getConnectionInfo();

        // Get local IP
        const localIP = await getLocalIP();

        // Fetch public IP and location info
        const response = await fetch('https://ipapi.co/json/', {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch network information');
        }

        const data: IPApiResponse = await response.json();

        // Determine connection type based on various factors
        let connectionType = 'Broadband';
        if (connInfo.effectiveType === '4g' || connInfo.effectiveType === '3g') {
          connectionType = 'Mobile';
        } else if (connInfo.effectiveType === 'slow-2g' || connInfo.effectiveType === '2g') {
          connectionType = 'Slow Mobile';
        } else if (connInfo.downlink && connInfo.downlink > 50) {
          connectionType = 'Fiber';
        }

        setNetworkInfo({
          publicIP: data.ip,
          localIP,
          isp: data.org || 'Unknown ISP',
          location: {
            city: data.city,
            region: data.region,
            country: data.country_name,
            timezone: data.timezone,
          },
          connectionType,
          networkInterface: connInfo.type,
          downloadSpeed: connInfo.downlink,
          isOnline: navigator.onLine,
          effectiveType: connInfo.effectiveType,
        });

      } catch (err) {
        console.error('Failed to fetch network info:', err);
        setError('Failed to detect network information');
        
        // Fallback values
        const connInfo = getConnectionInfo();
        const localIP = await getLocalIP().catch(() => '192.168.1.x');
        
        setNetworkInfo(prev => ({
          ...prev,
          localIP,
          connectionType: connInfo.effectiveType === '4g' ? 'Mobile' : 'Broadband',
          effectiveType: connInfo.effectiveType,
          downloadSpeed: connInfo.downlink,
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkInfo();

    // Listen for online/offline events
    const handleOnline = () => setNetworkInfo(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setNetworkInfo(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshNetworkInfo = () => {
    setLoading(true);
    setError(null);
    // Trigger useEffect again by changing a dependency
    window.location.reload();
  };

  return {
    networkInfo,
    loading,
    error,
    refreshNetworkInfo,
  };
}