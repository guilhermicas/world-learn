import { useState, useEffect, useCallback} from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import countries_data from './data/country_data.js'
import wc from 'which-country'

/*
  Using a country code (ISO 3166-1 alpha-3) returns the corresponding country information.
  @param {string} countryCode - ISO 3166-1 alpha-3 country code
  @return {string} Country information of the countryCode
*/
function getCountryInfo(countryCode) {
  return countries_data.filter(
    function(country) { return country.cca3 == countryCode; }
  )
}

const capitalizeFirstLetter = ([ first, ...rest ], locale = navigator.language) =>
  first === undefined ? '' : first.toLocaleUpperCase(locale) + rest.join('')

/*
  Modal made to display information of a certain country based on the function getCountryInfo
*/
function CountryInformationModal(props){
  if(!props.countryInfo){
    return null;
  }

  let { countryInfo, handleModalExit } = props.countryInfo;

  var backgroundDivStyles = {
    position:"absolute",
    width:"100%",
    height:"100%",
    backgroundColor:"rgb(0,0,0,0.2)",
    zIndex:500
  }

  let informationModalStyles = {
    position: "absolute",
    left: "0",
    right: "0",
    top: "0",
    bottom: "0",
    margin: "auto",
    width:"50%",
    height:"50%",
    borderRadius: "10px",
    backgroundColor:"#ffffff",
    fontFamily: "NotoColorEmojiLimited",
    overflow:"auto"
  }

  let keyStyles = {
    margin:"0"
  }

  function CountryElement(data) {
    return Object.entries(data).map(([key, value]) => (
      <>
        <p style={keyStyles} key={key}>{capitalizeFirstLetter(key)}</p>
        {(typeof value === 'object' && value !== null) ? (
          <ul style={{margin:"0"}}>
            {CountryElement(value)}
          </ul>
        ) : (
          <li>{value}</li>
        )}
      </>
    ))

  }


  return countryInfo === null ? null : (
    <div style={backgroundDivStyles} onClick={handleModalExit}>
      <div style={informationModalStyles}>
        {CountryElement(countryInfo)}
      </div>
    </div>
  );
}

/* 
  Non visible component used to share clicked position with other parent/sister components
  <MapComponent /> allows getting the latitude and longitude of clicked position, but it doesnt allow
                 sharing the information with sister components, this function is used to grab the latLng
                 and share it with the <App/> component, to allow it to share to any child component of the app
                 Its used to send the information to the <CountryInformationModal/>
  
  This component needs to be child of <MapComponent />
*/
const SetPositionDummy = (props) => {
  const setPosition = props.setPosition;

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng)
    }
  })

}

function App() {
  var mapStyles = {width:"100vw", height:"100vh"};
  const corner1 = Leaflet.latLng(-90, -200)
  const corner2 = Leaflet.latLng(90, 200)
  const bounds = Leaflet.latLngBounds(corner1, corner2)
  const [countryInfo, setCountryInfo] = useState(null)
  const [position, setPosition] = useState(null)

  const handleModalExit = useCallback(() => {
    setCountryInfo(null);
  }, []);
  
  /* Updates countryInfo when position updates */
  useEffect(()=>{
    var errorFlag = false;
    if(position){
      let {lat, lng} = position;
      let selected_country_code = wc([lng, lat]);
      console.log(selected_country_code)
      if(selected_country_code){
        let tmp = getCountryInfo(selected_country_code)[0];
        setCountryInfo(tmp);

        console.log(tmp);
      }else{
        setCountryInfo(null);
        errorFlag = true;
      }
    }
    else{
      errorFlag = true;
    }
    if(errorFlag){
      console.log("Impossible place");
    }

  }, [position])


  return (
    <div style={{position:"absolute"}}>
      <CountryInformationModal countryInfo={ {countryInfo, handleModalExit} }/>
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
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          noWrap="true"
        />
        */}
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
          noWrap="true"
        />
        <SetPositionDummy setPosition={setPosition}/>
      </MapContainer>
    </div>
  );
}

export default App;
