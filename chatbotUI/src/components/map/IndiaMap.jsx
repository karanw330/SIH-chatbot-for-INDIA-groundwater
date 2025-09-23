import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { indiaData } from "../../data/indiaData";
import { groundwaterData } from "../../data/groundwaterData";
import "./IndiaMap.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createCustomIcon = (color, size = 12) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style=" background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const stateIcon = createCustomIcon("#2563eb", 12);
const cityIcon = createCustomIcon("#22c55e", 8);

function MapEventHandler({ onMapClick, onZoomChange }) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e) => {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    };

    const handleZoom = () => {
      const zoom = map.getZoom();
      if (onZoomChange) {
        onZoomChange(zoom);
      }
    };

    map.on("click", handleClick);
    map.on("zoomend", handleZoom);

    handleZoom();

    return () => {
      map.off("click", handleClick);
      map.off("zoomend", handleZoom);
    };
  }, [map, onMapClick, onZoomChange]);

  return null;
}

function IndiaMap() {
  const [clickedLocation, setClickedLocation] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [mapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom] = useState(5);
  const [currentZoom, setCurrentZoom] = useState(5);

  const handleMapClick = (latlng) => {
    setClickedLocation(latlng);
    setSelectedState(null);
  };

  const handleStateClick = (stateName) => {
    setSelectedState(stateName);
    setClickedLocation(null);
  };

  const handleZoomChange = (zoom) => {
    setCurrentZoom(zoom);
  };

  const shouldShowStates = currentZoom <= 7;
  const shouldShowCities = currentZoom >= 8;

  return (
    <div className="india-map-container">
      <div className="map-header">
        <div className="map-title">
          <h2>India Map</h2>
        </div>
        <p>Interactive map with dynamic zoom-based labeling</p>
      </div>
      <div className="map-content">
        <div className="map-wrapper">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            dragging={true}
            touchZoom={true}
            boxZoom={false}
            keyboard={true}
            maxBounds={[
              [4.0, 66.0],
              [39.0, 99.0],
            ]}
            maxBoundsViscosity={0.5}
            minZoom={4}
            maxZoom={10}
            zoomSnap={0.5}
            zoomDelta={1}
            wheelPxPerZoomLevel={60}
            zoomAnimation={true}
            zoomAnimationThreshold={4}
            fadeAnimation={true}
            markerZoomAnimation={true}
            preferCanvas={false}
            attributionControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap={false}
              keepBuffer={4}
              updateWhenIdle={false}
              updateWhenZooming={true}
              updateInterval={100}
              maxNativeZoom={18}
              maxZoom={10}
            />
            <MapEventHandler
              onMapClick={handleMapClick}
              onZoomChange={handleZoomChange}
            />
            {shouldShowStates &&
              indiaData.states.map((state, index) => (
                <Marker
                  key={`state-${index}`}
                  position={[state.lat, state.lng]}
                  icon={stateIcon}
                >
                  <Popup closeOnEscapeKey={true} autoClose={false}>
                    <div className="state-popup">
                      <h3>{state.name}</h3>
                      <button
                        className="view-groundwater-btn"
                        onClick={() => handleStateClick(state.name)}
                      >
                        View Groundwater Data
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            {shouldShowCities &&
              indiaData.cities.map((city, index) => (
                <Marker
                  key={`city-${index}`}
                  position={[city.lat, city.lng]}
                  icon={cityIcon}
                >
                  <Popup closeOnEscapeKey={true} autoClose={false}>
                    <div className="city-popup">
                      <h3>{city.name}</h3>
                      <p>{city.state}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
        <div className="state-info-panel">
          {selectedState ? (
            <div className="state-info">
              <h3>{selectedState}</h3>
              <div className="groundwater-data">
                {groundwaterData[selectedState] ? (
                  <>
                    <div className="data-section">
                      <h4>Groundwater Usage (BCM)</h4>
                      <p>
                        <strong>Domestic & Industry:</strong>
                        {
                          groundwaterData[selectedState]
                            .annualDomesticIndustryDraft
                        }
                      </p>
                      <p>
                        <strong>Irrigation:</strong>
                        {groundwaterData[selectedState].annualIrrigationDraft}
                      </p>
                      <p>
                        <strong>Total Draft:</strong>
                        {
                          groundwaterData[selectedState]
                            .annualGroundwaterDraftTotal
                        }
                      </p>
                    </div>
                    <div className="data-section">
                      <h4>Recharge Sources (BCM)</h4>
                      <p>
                        <strong>Monsoon Rainfall:</strong>
                        {groundwaterData[selectedState].monsoonRechargeRainfall}
                      </p>
                      <p>
                        <strong>Monsoon Other:</strong>
                        {groundwaterData[selectedState].monsoonRechargeOther}
                      </p>
                      <p>
                        <strong>Non-Monsoon Rainfall:</strong>
                        {
                          groundwaterData[selectedState]
                            .nonMonsoonRechargeRainfall
                        }
                      </p>
                      <p>
                        <strong>Non-Monsoon Other:</strong>
                        {groundwaterData[selectedState].nonMonsoonRechargeOther}
                      </p>
                    </div>
                    <div className="data-section">
                      <h4>Availability (BCM)</h4>
                      <p>
                        <strong>Net Availability:</strong>
                        {
                          groundwaterData[selectedState]
                            .netGroundwaterAvailability
                        }
                      </p>
                      <p>
                        <strong>Future Irrigation Use:</strong>
                        {
                          groundwaterData[selectedState]
                            .groundwaterAvailabilityForFutureIrrigationUse
                        }
                      </p>
                    </div>
                    <div className="data-section">
                      <h4>Development Status</h4>
                      <p>
                        <strong>Stage of Development:</strong>
                        {
                          groundwaterData[selectedState]
                            .stageOfGroundwaterDevelopment
                        }
                        %
                      </p>
                    </div>
                  </>
                ) : (
                  <p>Groundwater data not available for this state.</p>
                )}
              </div>
              <button
                className="clear-selection-btn"
                onClick={() => setSelectedState(null)}
              >
                Close
              </button>
            </div>
          ) : clickedLocation ? (
            <div className="state-info">
              <h3>Location</h3>
              <div className="state-details">
                <p>
                  <strong>Lat:</strong> {clickedLocation.lat.toFixed(4)}
                </p>
                <p>
                  <strong>Lng:</strong> {clickedLocation.lng.toFixed(4)}
                </p>
              </div>
              <button
                className="clear-selection-btn"
                onClick={() => setClickedLocation(null)}
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="no-selection">
              <p>Click on a state marker to view groundwater data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IndiaMap;
