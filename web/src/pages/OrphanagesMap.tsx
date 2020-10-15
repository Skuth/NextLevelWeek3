import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { FiPlus, FiArrowRight } from "react-icons/fi"
import { Map, TileLayer, Marker, Popup } from "react-leaflet"

import mapMarkerImg from "../images/map-marker.svg"
import mapIcon from "../utils/mapIcon"
import api from "../services/api"

import "../styles/pages/orphanages-map.css"

interface Orphanage {
  id: number,
  latitude: number,
  longitude: number,
  name: string
}

function OrphanagesMap() {
  const [userLocation, setUserLocation] = useState({ latitude: -22.8904029, longitude: -42.0262468 })

  const [orphanages, setOrphanages] = useState<Orphanage[]>([])
  
  useEffect(() => {
    api.get("orphanages").then(res => {
      setOrphanages(res.data)
    })
  }, [])

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        if (position) {
          const { latitude, longitude } = position.coords
  
          setUserLocation({
            latitude: latitude,
            longitude: longitude
          })
        }
      })
    }
  }, [])

  return (
    <div id="page-map">
      <aside>
        <header>
          <img src={mapMarkerImg} alt="Happy"/>

          <h2>Escolha um orfanato no mapa</h2>
          <p>Muitas crianças estão esperando a sua visita :)</p>
        </header>

        <footer>
          <strong>Cabo Frio</strong>
          <span>Rio de Janeiro</span>
        </footer>
      </aside>

      <Map
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
      >
        {/* <TileLayer url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}
        <TileLayer url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`} />
      
        {orphanages.map(orphanage => {
          return (
            <Marker position={[orphanage.latitude, orphanage.longitude]} icon={mapIcon} key={orphanage.id} >
              <Popup closeButton={false} minWidth={240} maxWidth={240} className="map-popup">
                {orphanage.name}

                <Link to={`/orfanatos/${orphanage.id}`}><FiArrowRight size={20} color="#FFF" /></Link>
              </Popup>
            </Marker>
          )
        })}
        
      </Map>

      <Link to="/orfanatos/criar" className="create-orphanage">
        <FiPlus size={32} color="#FFF" />
      </Link>
    </div>
  )
}

export default OrphanagesMap