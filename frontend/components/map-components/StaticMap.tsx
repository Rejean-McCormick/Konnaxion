'use client'

/**
 * Description: Static map view
 * Author: Hieu Chu
 */

import type { CSSProperties } from 'react'
import {
  Map as ReactMapGL,
  Marker,
  FullscreenControl,
  Popup,
  GeolocateControl
} from 'react-map-gl'

import { useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import MapMarker from './MapMarker'

const fullscreenControlStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  padding: '10px'
}

const geolocateStyle: CSSProperties = {
  position: 'absolute',
  bottom: 30,
  right: 0,
  margin: 10
}

const defaultLocation = {
  latitude: -34.40581053569814,
  longitude: 150.87842788963476
}

type StaticMapProps = {
  markerLat?: number
  markerLng?: number
}

const MyStaticMap = ({ markerLat, markerLng }: StaticMapProps) => {
  const token = process.env.MAPBOX_ACCESS_TOKEN as string | undefined

  const [vp, setVp] = useState({
    latitude: markerLat ?? defaultLocation.latitude,
    longitude: markerLng ?? defaultLocation.longitude,
    zoom: 15,
    pitch: 50
  })

  return (
    <ReactMapGL
      initialViewState={vp}
      viewState={vp}
      onMove={evt => {
        const vs = evt.viewState
        setVp(v => ({
          ...v,
          latitude: vs.latitude,
          longitude: vs.longitude,
          zoom: vs.zoom,
          pitch: vs.pitch,
          bearing: vs.bearing
        }))
      }}
      mapboxAccessToken={token}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      style={{ width: '100%', height: '640px' }}
    >
      <div>
        {markerLat != null && markerLng != null && (
          <>
            <Marker longitude={markerLng} latitude={markerLat}>
              <MapMarker size={22} />
            </Marker>

            <Popup
              anchor="bottom"
              latitude={markerLat}
              longitude={markerLng}
              closeOnClick={false}
              closeButton={false}
              offset={[0, -20]}
            >
              <div style={{ marginLeft: 5, marginRight: 5 }}>
                <div>Latitude: {markerLat}</div>
                <div>Longitude: {markerLng}</div>
              </div>
            </Popup>
          </>
        )}

        <div className="fullscreen" style={fullscreenControlStyle}>
          <FullscreenControl />
        </div>

        <GeolocateControl
          style={geolocateStyle}
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation
          showUserLocation
          onGeolocate={() =>
            setVp(v => ({ ...v, zoom: 14 }))
          }
        />
      </div>
    </ReactMapGL>
  )
}

export default MyStaticMap
