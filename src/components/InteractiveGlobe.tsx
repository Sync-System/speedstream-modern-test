import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNetworkInfo } from '@/hooks/useNetworkInfo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Globe, Satellite, Navigation } from 'lucide-react';

const MAPBOX_TOKEN_KEY = 'mapbox_token';

// Global server locations for network visualization
const GLOBAL_SERVERS = [
  { id: 'ny', name: 'New York', coordinates: [-74.0060, 40.7128] as [number, number], ping: 12 },
  { id: 'london', name: 'London', coordinates: [-0.1278, 51.5074] as [number, number], ping: 45 },
  { id: 'tokyo', name: 'Tokyo', coordinates: [139.6503, 35.6762] as [number, number], ping: 89 },
  { id: 'sydney', name: 'Sydney', coordinates: [151.2093, -33.8688] as [number, number], ping: 156 },
  { id: 'singapore', name: 'Singapore', coordinates: [103.8198, 1.3521] as [number, number], ping: 67 },
  { id: 'frankfurt', name: 'Frankfurt', coordinates: [8.6821, 50.1109] as [number, number], ping: 34 },
  { id: 'saopaulo', name: 'São Paulo', coordinates: [-46.6333, -23.5505] as [number, number], ping: 78 },
  { id: 'mumbai', name: 'Mumbai', coordinates: [72.8777, 19.0760] as [number, number], ping: 95 },
];

export function InteractiveGlobe({ isActive }: { isActive: boolean }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { networkInfo, loading } = useNetworkInfo();
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Check for stored Mapbox token
  useEffect(() => {
    const storedToken = localStorage.getItem(MAPBOX_TOKEN_KEY);
    if (storedToken) {
      setMapboxToken(storedToken);
    } else {
      setShowTokenInput(true);
    }
  }, []);

  // Get user's real location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Use approximate location based on network info if available
          // For demo, we'll use a default location
          setUserLocation([-74.0060, 40.7128]); // New York as fallback
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 300000 
        }
      );
    }
  }, []);

  // Initialize map when token is available
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !userLocation) return;

    // Set Mapbox access token
    mapboxgl.accessToken = mapboxToken;

    try {
      // Initialize map with globe projection
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        projection: 'globe',
        zoom: 2,
        center: userLocation,
        pitch: 45,
        bearing: 0,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );

      // Configure globe settings
      map.current.on('style.load', () => {
        if (!map.current) return;

        // Add atmosphere and fog effects
        map.current.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6,
        });

        // Add user location marker
        if (userLocation) {
          const userMarker = new mapboxgl.Marker({
            color: '#10b981',
            scale: 1.2
          })
            .setLngLat(userLocation)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div class="p-2">
                    <h3 class="font-semibold text-sm">Your Location</h3>
                    <p class="text-xs text-gray-600">${networkInfo.location.city}, ${networkInfo.location.country}</p>
                    <p class="text-xs text-gray-600">ISP: ${networkInfo.isp}</p>
                    <p class="text-xs text-gray-600">IP: ${networkInfo.publicIP}</p>
                  </div>
                `)
            )
            .addTo(map.current);

          // Center map on user location with animation
          map.current.flyTo({
            center: userLocation,
            zoom: 8,
            duration: 3000,
            essential: true
          });
        }

        // Add global server markers
        GLOBAL_SERVERS.forEach((server) => {
          if (!map.current) return;

          const serverMarker = new mapboxgl.Marker({
            color: '#3b82f6',
            scale: 0.8
          })
            .setLngLat(server.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div class="p-2">
                    <h3 class="font-semibold text-sm">${server.name} Server</h3>
                    <p class="text-xs text-gray-600">Ping: ${server.ping}ms</p>
                    <p class="text-xs text-gray-600">Status: Active</p>
                  </div>
                `)
            )
            .addTo(map.current);
        });

        // Add connection lines from user to servers (when active)
        if (isActive && userLocation) {
          const connectionLines: any = {
            type: 'FeatureCollection',
            features: GLOBAL_SERVERS.map((server) => ({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [userLocation, server.coordinates]
              },
              properties: {
                server: server.name,
                ping: server.ping
              }
            }))
          };

          map.current.addSource('connections', {
            type: 'geojson',
            data: connectionLines
          });

          map.current.addLayer({
            id: 'connections',
            type: 'line',
            source: 'connections',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#10b981',
              'line-width': 2,
              'line-opacity': isActive ? 0.6 : 0.3
            }
          });
        }
      });

      // Rotation animation
      const secondsPerRevolution = 120;
      const maxSpinZoom = 5;
      const slowSpinZoom = 3;
      let userInteracting = false;
      let spinEnabled = true;

      function spinGlobe() {
        if (!map.current) return;
        
        const zoom = map.current.getZoom();
        if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
          let distancePerSecond = 360 / secondsPerRevolution;
          if (zoom > slowSpinZoom) {
            const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
            distancePerSecond *= zoomDif;
          }
          const center = map.current.getCenter();
          center.lng -= distancePerSecond;
          map.current.easeTo({ center, duration: 1000, easing: (n) => n });
        }
      }

      // Event listeners for interaction
      map.current.on('mousedown', () => { userInteracting = true; });
      map.current.on('dragstart', () => { userInteracting = true; });
      map.current.on('mouseup', () => { userInteracting = false; spinGlobe(); });
      map.current.on('touchend', () => { userInteracting = false; spinGlobe(); });
      map.current.on('moveend', () => { spinGlobe(); });

      // Start the globe spinning
      if (isActive) {
        spinGlobe();
      }

    } catch (error) {
      console.error('Mapbox initialization error:', error);
      setShowTokenInput(true);
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, userLocation, isActive, networkInfo]);

  const handleTokenSave = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, mapboxToken.trim());
      setShowTokenInput(false);
      // Refresh the page to reinitialize the map
      window.location.reload();
    }
  };

  if (showTokenInput) {
    return (
      <Card className="glass-card p-6 text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-primary">
            <Globe className="w-8 h-8" />
            <h3 className="text-xl font-semibold">Interactive Globe Setup</h3>
          </div>
          
          <p className="text-muted-foreground text-sm">
            To display the interactive 3D globe with your real location, please provide your Mapbox public token.
          </p>
          
          <div className="space-y-3 max-w-md mx-auto">
            <div>
              <Label htmlFor="mapbox-token" className="text-sm font-medium">
                Mapbox Public Token
              </Label>
              <Input
                id="mapbox-token"
                type="text"
                placeholder="pk.eyJ1Ijoi..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <Button 
              onClick={handleTokenSave}
              disabled={!mapboxToken.trim()}
              className="w-full"
            >
              <Satellite className="w-4 h-4 mr-2" />
              Initialize Globe
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>Get your free token at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a></p>
            <p>Navigate to Account → Tokens to find your public token</p>
          </div>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="glass-card p-6 text-center">
        <div className="space-y-4">
          <div className="animate-spin mx-auto w-8 h-8">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading your location...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      
      {/* Location Info Overlay */}
      <div className="absolute top-4 left-4 glass-card p-4 rounded-lg max-w-xs">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Your Location</span>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p><span className="font-medium">City:</span> {networkInfo.location.city}</p>
          <p><span className="font-medium">Country:</span> {networkInfo.location.country}</p>
          <p><span className="font-medium">ISP:</span> {networkInfo.isp}</p>
          <p><span className="font-medium">IP:</span> {networkInfo.publicIP}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (map.current && userLocation) {
              map.current.flyTo({
                center: userLocation,
                zoom: 10,
                duration: 2000
              });
            }
          }}
          className="glass-card"
        >
          <Navigation className="w-4 h-4 mr-1" />
          My Location
        </Button>
      </div>
    </div>
  );
}