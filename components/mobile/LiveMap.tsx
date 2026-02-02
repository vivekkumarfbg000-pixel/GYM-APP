'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet generic marker icon
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Component to auto-center map on user
function MapRecenter({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position);
    }, [position, map]);
    return null;
}

export default function LiveMap({
    position,
    route
}: {
    position: [number, number];
    route: [number, number][];
}) {
    return (
        <MapContainer
            center={position}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
            />

            <Marker position={position} icon={icon} />

            {route.length > 1 && (
                <Polyline
                    positions={route}
                    color="blue"
                    weight={5}
                    opacity={0.7}
                />
            )}

            <MapRecenter position={position} />
        </MapContainer>
    );
}
