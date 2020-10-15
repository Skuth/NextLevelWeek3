import React, { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { Map, Marker, TileLayer } from 'react-leaflet'
import { LeafletMouseEvent } from "leaflet"

import { FiPlus, FiX } from "react-icons/fi"

import '../styles/pages/create-orphanage.css'
import Sidebar from "../components/Sidebar"

import mapIcon from "../utils/mapIcon"
import api from "../services/api"
import { useHistory } from "react-router-dom"

interface previewImages {
  name: string
  url: string
}

export default function CreateOrphanage() {
  const history = useHistory()
  
  const [position, setPosition] = useState({ latitude: 0, longitude: 0 })

  const [userLocation, setUserLocation] = useState({ latitude: -22.8904029, longitude: -42.0262468 })

  const [name, setName] = useState("")
  const [about, setAbout] = useState("")
  const [instructions, setInstructions] = useState("")
  const [opening_hours, setOpeningHours] = useState("")
  const [open_on_weekends, setOpenOnWeekends] = useState(true)
  const [images, setImages] = useState<File[]>([])
  const [previewImages, setPreviewImages] = useState<previewImages[]>([])

  function handleMapClick(e: LeafletMouseEvent) {
    const { lat, lng } = e.latlng
    setPosition({
      latitude: lat,
      longitude: lng
    })
  }

  function handleSelectImages(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return
    }

    const selectedImages = Array.from(e.target.files)

    setImages(selectedImages)

    const selectedImagesPreview = selectedImages.map(image => {
      return {name: image.name, url: URL.createObjectURL(image)}
    })

    setPreviewImages(selectedImagesPreview)
  }

  function handleRemoveImage(img: previewImages) {
    setPreviewImages(previewImages.filter(image => image.url !== img.url))
    setImages(images.filter(image => image.name !== img.name))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const { latitude, longitude } = position

    const data = new FormData()

    data.append("name", name)
    data.append("latitude", String(latitude))
    data.append("longitude", String(longitude))
    data.append("about", about)
    data.append("instructions", instructions)
    data.append("opening_hours", opening_hours)
    data.append("open_on_weekends", String(open_on_weekends))
    
    images.forEach(image => {
      data.append("images", image)
    })

    await api.post("orphanages", data)

    history.push("/orfanatos")
  }

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
    <div id="page-create-orphanage">
      <Sidebar />

      <main>
        <form onSubmit={handleSubmit} className="create-orphanage-form">
          <fieldset>
            <legend>Dados</legend>

            <Map 
              center={[userLocation.latitude, userLocation.longitude]} 
              style={{ width: '100%', height: 280 }}
              zoom={11}
              onclick={handleMapClick}
            >
              <TileLayer 
                url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
              />

              { position.latitude !== 0 && (
                <Marker
                  interactive={false}
                  icon={mapIcon}
                  position={[position.latitude, position.longitude]}
                />
              ) }
            </Map>

            <div className="input-block">
              <label htmlFor="name">Nome</label>
              <input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="input-block">
              <label htmlFor="about">Sobre <span>Máximo de 300 caracteres</span></label>
              <textarea id="about" maxLength={300} value={about} onChange={e => setAbout(e.target.value)} />
            </div>

            <div className="input-block">
              <label htmlFor="images">Fotos</label>

              <div className="images-container">
                {previewImages.map(image => {
                  return (
                    <div className="image-container" key={image.url}>
                      <FiX size={40} color="#E6779A" className="remove-image" onClick={() => handleRemoveImage(image)} />
                      <img src={image.url} alt={name}/>
                    </div>
                  )
                })}

                <label htmlFor="image[]" className="new-image">
                  <FiPlus size={24} color="#15b6d6" />
                </label>
              </div>
              
              <input type="file" id="image[]" multiple onChange={handleSelectImages} />

            </div>
          </fieldset>

          <fieldset>
            <legend>Visitação</legend>

            <div className="input-block">
              <label htmlFor="instructions">Instruções</label>
              <textarea id="instructions" value={instructions} onChange={e => setInstructions(e.target.value)} />
            </div>

            <div className="input-block">
              <label htmlFor="opening_hours">Horário de funcionamento</label>
              <input id="opening_hours" value={opening_hours} onChange={e => setOpeningHours(e.target.value)} />
            </div>

            <div className="input-block">
              <label htmlFor="open_on_weekends">Atende fim de semana</label>

              <div className="button-select">
                <button
                  type="button"
                  className={open_on_weekends ? "active" : ""}
                  onClick={() => setOpenOnWeekends(true)}
                >
                  Sim
                </button>

                <button
                  type="button"
                  className={!open_on_weekends ? "active" : ""}
                  onClick={() => setOpenOnWeekends(false)}
                >
                  Não
                </button>
              </div>
            </div>
          </fieldset>

          <button className="confirm-button" type="submit">
            Confirmar
          </button>
        </form>
      </main>
    </div>
  )
}
