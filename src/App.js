import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import countries_data from './data/country_data.js'
import wc from 'which-country'


function getCountryInfo(countryCode) {
  return countries_data.filter(
    function(country) { return country.cca3 == countryCode; }
  )
}

// Para usar `useMapEvents()` é necessário que seja um Component filho do Mapa
const LocationMarker = () => {
    const [position, setPosition] = useState(null)
    const markerReference = useRef(null);

    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            let {lat, lng} = e.latlng;
            console.log(lat)
            console.log(lng)
            let selected_country_code = wc([lng, lat]);
            console.log(selected_country_code)
            if(selected_country_code.trim() !== ""){
              console.log(getCountryInfo(selected_country_code));
            }else{
              console.log("Impossible place");
            }
        },
        popupclose(e) {
          if(markerReference.current !== null){
            console.log(e)
            setPosition(null)
          }

        }
    });

    useEffect(() => {
      if(markerReference.current !== null && !markerReference.current.isPopupOpen()){
        markerReference.current.openPopup();
      }
    }, [position])
    
    return position === null ? null : (
      <Marker position={position} ref={markerReference}>
          <Popup>Clicado aqui!</Popup>
      </Marker>
    )
};

function App() {
  var mapStyles = {width:"100vw", height:"100vh"};
  const corner1 = Leaflet.latLng(-90, -200)
  const corner2 = Leaflet.latLng(90, 200)
  const bounds = Leaflet.latLngBounds(corner1, corner2)
  
  return (
    <div>
      <MapContainer style={mapStyles} center={[22, 0]} zoom={3} minZoom={3} maxBoundsViscosity={1.0} maxBounds={bounds}>
        {/*
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap="true"
        />
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          noWrap="true"
        />
        */}
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
          noWrap="true"
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
}

export default App;
