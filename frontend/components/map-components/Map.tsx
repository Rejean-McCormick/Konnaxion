'use client';
/**
 * Description: Dynamic map view with support for geolocation control and draggable marker
 * Author: Hieu Chu
 */

import type { CSSProperties } from 'react';
import {
  Map as ReactMapGL,
  Marker,
  NavigationControl,
  FullscreenControl,
  GeolocateControl,
} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';
import MapMarker from './MapMarker';
import ControlPanel from './ControlPanel';

const fullscreenControlStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  padding: '10px',
};

const navStyle: CSSProperties = {
  position: 'absolute',
  top: 36,
  left: 0,
  padding: '10px',
};

const geolocateStyle: CSSProperties = {
  position: 'absolute',
  bottom: 30,
  right: 0,
  margin: 10,
};

type ViewState = {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
};

type MarkerState = { markerLat: number; markerLng: number };

type Props = {
  view: ViewState;
  setView: (v: ViewState) => void;
  marker: MarkerState;
  setMarker: (m: MarkerState) => void;
};

const Map = ({ view, setView, marker, setMarker }: Props) => {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_ACCESS_TOKEN as string | undefined;
  const { markerLat, markerLng } = marker;

  return (
    <ReactMapGL
      initialViewState={view}
      viewState={view}
      onMove={(evt) => {
        const vs = evt.viewState;
        setView({
          ...view,
          latitude: vs.latitude,
          longitude: vs.longitude,
          zoom: vs.zoom,
          pitch: vs.pitch,
          bearing: vs.bearing,
        });
      }}
      mapboxAccessToken={token}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      style={{ width: '100%', height: '100%' }}
    >
      <Marker
        longitude={markerLng}
        latitude={markerLat}
        draggable
        onDragEnd={(e) => {
          const { lng, lat } = e.lngLat;
          setMarker({ markerLat: lat, markerLng: lng });
        }}
      >
        {/* Removed undeclared `size` prop */}
        <MapMarker />
      </Marker>

      <div className="fullscreen" style={fullscreenControlStyle}>
        <FullscreenControl />
      </div>

      <div className="nav" style={navStyle}>
        <NavigationControl />
      </div>

      <GeolocateControl
        style={geolocateStyle}
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation
        showUserLocation
        // Zoom d’accompagnement après géolocalisation
        onGeolocate={() => setView({ ...view, zoom: 13 })}
      />

      {/* Removed undeclared lat/lng props */}
      <ControlPanel lat={markerLat} lng={markerLng} />
    </ReactMapGL>
  );
};

export default Map;
