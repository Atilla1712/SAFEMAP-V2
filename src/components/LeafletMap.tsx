import { useEffect, useRef } from "react";
import { SupportResource } from "../types";

declare const L: any;

interface LeafletMapProps {
  resources: SupportResource[];
  selectedResource: SupportResource | null;
  onSelectResource: (resource: SupportResource) => void;
  userCoords: { lat: number; lng: number } | null;
}

export default function LeafletMap({
  resources,
  selectedResource,
  onSelectResource,
  userCoords,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const userMarkerRef = useRef<any>(null);

  // 1. Initialize Map ONCE on mount
  useEffect(() => {
    if (typeof L === "undefined" || !mapContainerRef.current) return;
    if (mapRef.current) return;

    // Determine initial center
    const centerLat = userCoords ? userCoords.lat : -6.2088;
    const centerLng = userCoords ? userCoords.lng : 106.8456;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([centerLat, centerLng], 12);

    mapRef.current = map;

    // Add elegant light theme tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
    }).addTo(map);

    // Add a custom zoom control in the bottom right corner
    L.control.zoom({
      position: "bottomright",
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.warn("Error removing map instance:", e);
        }
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Handle User Location Marker Updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof L === "undefined") return;

    if (userMarkerRef.current) {
      try {
        userMarkerRef.current.remove();
      } catch (e) {
        console.warn("Error removing user marker:", e);
      }
      userMarkerRef.current = null;
    }

    if (userCoords) {
      const userIcon = L.divIcon({
        className: "custom-user-icon",
        html: `<div class="relative flex items-center justify-center">
                 <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-[#7FA396] opacity-75"></span>
                 <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#9DBDB0] border-2 border-white"></span>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<strong style="color: #1B2620">Lokasi Anda (You)</strong>`);
      
      // Pan to user coords safely when they are updated
      map.setView([userCoords.lat, userCoords.lng], 13);
    }
  }, [userCoords]);

  // 3. Handle Resource Markers Updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof L === "undefined") return;

    // Remove existing markers
    for (const id in markersRef.current) {
      const marker = markersRef.current[id];
      if (marker) {
        try {
          marker.remove();
        } catch (e) {
          console.warn("Error removing resource marker:", e);
        }
      }
    }
    markersRef.current = {};

    // Add resource markers
    const markers: { [id: string]: any } = {};
    resources.forEach((res) => {
      // Determine marker emoji/color by category
      let categoryEmoji = "🛡️";
      let colorClass = "bg-[#7FA396]";
      if (res.category === "shelter") {
        categoryEmoji = "🏠";
        colorClass = "bg-[#E0703D]"; // Terracotta for shelters
      } else if (res.category === "legal") {
        categoryEmoji = "⚖️";
        colorClass = "bg-[#7FA396]";
      } else if (res.category === "clinic") {
        categoryEmoji = "🏥";
        colorClass = "bg-[#9DBDB0]";
      } else if (res.category === "community") {
        categoryEmoji = "👥";
        colorClass = "bg-[#C9A66B]"; // Gold for survivor communities
      } else if (res.category === "job") {
        categoryEmoji = "💼";
        colorClass = "bg-[#5C7A6E]";
      }

      const customIcon = L.divIcon({
        className: "custom-resource-icon",
        html: `<div class="w-8 h-8 rounded-full ${colorClass} flex items-center justify-center shadow-lg border-2 border-white text-base transform transition-all duration-300 hover:scale-125">
                 <span>${categoryEmoji}</span>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([res.lat, res.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(
          `<div class="p-1" style="font-family: 'Karla', sans-serif;">
             <h4 class="font-bold text-[#1B2620] m-0 text-sm">${res.name}</h4>
             <p class="text-xs text-[#5C7A6E] mt-0.5 mb-1">${res.address}</p>
             <p class="text-xs font-semibold text-[#E0703D] m-0">${res.phone}</p>
           </div>`
        );

      marker.on("click", () => {
        onSelectResource(res);
      });

      markers[res.id] = marker;
    });

    markersRef.current = markers;
  }, [resources]);

  // Focus map when selectedResource changes
  useEffect(() => {
    if (!mapRef.current || !selectedResource) return;

    const { lat, lng, id } = selectedResource;
    mapRef.current.setView([lat, lng], 15, {
      animate: true,
      duration: 1.0,
    });

    const marker = markersRef.current[id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedResource]);

  return (
    <div className="relative w-full h-[220px] sm:h-[350px] md:h-[400px] lg:h-[450px] rounded-xl overflow-hidden border border-white/10 shadow-inner z-10">
      {typeof L === "undefined" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#24332B]/90 z-20">
          <div className="w-8 h-8 border-4 border-[#7FA396] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-[#B8C2BC] mt-2">Loading Map Library...</span>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" id="leaflet-map-element" />
    </div>
  );
}
