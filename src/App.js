import React, { useState } from "react";
import Sidebar from "./components/sidebar";
import Header from "./components/header";
import MapView from "./components/mapview";
import AuthPage from "./pages/Auth";
import Login from "./pages/Login";
import { LineLayer, ScatterplotLayer, GeoJsonLayer } from "@deck.gl/layers";
import Modal from "./components/modal";
import Scene from "./views/scene";
import Calendar from "./views/calendar";
import apiClient from "./services/apiClient";
import Spinner from "./components/spinner";

const INITIAL_VIEW_STATE = {
  longitude: 68.7882,  
  latitude: 38.5599,  
  zoom: 5,
  pitch: 0,
  bearing: 0,
};

function App() {
  const [viewport, setViewport] = useState(INITIAL_VIEW_STATE);
  const [satellitePath, setSatellitePath] = useState([]);
  const [clickedPoint, setClickedPoint] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [authState, setAuthState] = useState("login");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarContent, setSidebarContent] = useState("Initial Content");
  const [sceneKey, setSceneKey] = useState(0);
  const [geoJsonData, setGeoJsonData] = useState(null); 
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [infoBoxPosition, setInfoBoxPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [geoErrorMessage, setGeoerror] = useState('')
  // const [landsat8Enabled, setLandsat8Enabled] = useState(true);
  // const [landsat9Enabled, setLandsat9Enabled] = useState(true);

  // const handleCheckboxChange = (satellite, isChecked) => {
  //   if (satellite === "landsat8") setLandsat8Enabled(isChecked);
  //   if (satellite === "landsat9") setLandsat9Enabled(isChecked);
  // };
  // const filteredGeoJsonData = geoJsonData
  // ? {
  //     ...geoJsonData,
  //     features: geoJsonData.filter((feature) => {
  //       const satellite = feature.properties.satellite;
  //       if (satellite === "Landsat-8" && landsat8Enabled) return true;
  //       if (satellite === "Landsat-9" && landsat9Enabled) return true;
  //       return false;
  //     }),
  //   }
  // : null;

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const onLoginClick = () => setAuthState("login");
  const onSignupClick = () => setAuthState("signup");
  const openSidebar = (content) => {
    setSidebarContent(
      <Scene key={sceneKey} longitude={clickedPoint?.longitude} latitude={clickedPoint?.latitude} resetSidebar={resetSidebarContent} />
    );
    setSidebarOpen(true);
  };

  const openCalendar = () => {
    setSidebarContent(
      <Calendar onDayClick={handleDayClick} geoError={geoErrorMessage} />   
    );
    setSidebarOpen(true);
  }

  const resetSidebarContent = () => {
    setSceneKey(prevKey => prevKey + 1);
  };

  const handleSearchResult = (coordinates) => {
    try {
      setViewport((prevViewport) => ({
        ...prevViewport,
        longitude: coordinates[0],
        latitude: coordinates[1],
        zoom: 10,
        transitionDuration: 0,
      }));
    } catch (error) {
      console.error("Error updating viewport:", error);
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  const renderAuthPage = () => {
    switch (authState) {
      case "login":
        return <Login onSignupClick={onSignupClick} />;
      case "signup":
        return <AuthPage onLoginClick={onLoginClick} />;
      default:
        return <Login onSignupClick={onSignupClick} />;
    }
  };

  const openNotification = () => {
    setSidebarContent(
      <h1>Notifiation is in development</h1> 
    );
    setSidebarOpen(true);
  }

  const handleMapClick = (event) => {
    const clickedCoordinates = event.coordinate || event.lngLat;

    if (clickedCoordinates) {
      const [longitude, latitude] = clickedCoordinates;
      setClickedPoint({ longitude, latitude });
      openSidebar(longitude + ", " + latitude);
    }
  };

  const handleDayClick = async (day) => {
    setLoading(true)
    if (day) {
      try {
        console.log(`Making request to: /satellate-data?datetime=${day}`); 
        const response = await apiClient(`/satellate-data`, 'GET', null, `?datetime=${day}`);        
        const geoJson = await response;
        setGeoJsonData(geoJson);
        setGeoerror('')
        setLoading(false)

      } catch (error) {
        console.error("Error fetching GeoJSON data:", error);
        setGeoerror('Error fetching GeoJSON data: ' + error)
        setGeoJsonData(null)
         setLoading(false)

      }
    }
  };

  const layers = [
    new LineLayer({
      id: "satellite-path",
      data: satellitePath,
      getSourcePosition: (d) => [d.longitude, d.latitude],
      getTargetPosition: (d, index) =>
        index < satellitePath.length - 1
          ? [satellitePath[index + 1].longitude, satellitePath[index + 1].latitude]
          : null,
      getColor: [255, 0, 0],
      getWidth: 2,
    }),
    clickedPoint ? new ScatterplotLayer({
      id: "click-point",
      data: [clickedPoint],
      getPosition: (d) => [d.longitude, d.latitude],
      getFillColor: [255, 255, 0],
      getRadius: 200,
      radiusMinPixels: 5,
      radiusMaxPixels: 20,
    }) : null,
    geoJsonData ? new GeoJsonLayer({
      id: 'geojson-layer',
      data: geoJsonData,
      getFillColor: [0, 128, 255, 128],
      getLineColor: [255, 255, 255, 255],
      lineWidthMinPixels: 0,
      pickable: true,
      onHover: ({ object, x, y }) => {
        if (object) {
          setHoveredFeature(object); // Update the hovered feature state
          setInfoBoxPosition({ x: x, y: y - 40 }); // Position the info box above the hovered square
        } else {
          setHoveredFeature(null); // Clear the hovered feature if not hovering over a polygon
        }
      },
    }) : null,
  ].filter(Boolean); // Filter out any null layers

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Modal isOpen={isModalOpen} closeModal={closeModal} >
        {renderAuthPage()}  
      </Modal>
      <Header openModal={openModal} onSearchResult={handleSearchResult} openSidebar={openCalendar} openNotification={openNotification}/>
    <Sidebar
        isOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        resetContent={resetSidebarContent} 
      >
        {isSidebarOpen && (
          sidebarContent
        )}
      </Sidebar>
      {loading && <Spinner/>}
      <MapView  
      key={viewport.longitude + viewport.latitude} // Force re-initialization
      viewport={viewport}
      layers={layers}
      handleMapClick={handleMapClick} />
      {clickedPoint && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <p>Clicked Coordinates:</p>
          <p>Longitude: {clickedPoint.longitude}</p>
          <p>Latitude: {clickedPoint.latitude}</p>
        </div>
      )}
      {hoveredFeature && (
  <div
    style={{
      position: "absolute",
      left: infoBoxPosition.x,
      top: infoBoxPosition.y,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      border: "1px solid #333",
      borderRadius: "8px",
      padding: "15px",
      pointerEvents: "none",
      zIndex: 60,
      width: "200px", // Fixed width
      textAlign: "left", // Align text to the left
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Shadow for depth
      transform: "translate(-50%, -100%)", // Center the box horizontally and place it above
    }}
  >
    <h4 style={{ margin: "0 0 10px 0", fontSize: "13px" }}>Satellite Information</h4>
    <p style={{ margin: "4px 0", fontWeight: "bold", fontSize: '10px' }}>Satellite: <span style={{ fontWeight: "normal" }}>{hoveredFeature.properties.satellite}</span></p>
    <p style={{ margin: "4px 0", fontWeight: "bold", fontSize: '10px' }}>Path: <span style={{ fontWeight: "normal" }}>{hoveredFeature.properties.path}</span></p>
    <p style={{ margin: "4px 0", fontWeight: "bold" , fontSize: '10px'}}>Row: <span style={{ fontWeight: "normal" }}>{hoveredFeature.properties.row}</span></p>
    <p style={{ margin: "4px 0", fontWeight: "bold", fontSize: '10px' }}>Begin Time: <span style={{ fontWeight: "normal" }}>{new Date(hoveredFeature.properties.begin_time).toLocaleString()}</span></p>
    <p style={{ margin: "4px 0", fontWeight: "bold", fontSize: '10px' }}>End Time: <span style={{ fontWeight: "normal" }}>{hoveredFeature.properties.end_time ? new Date(hoveredFeature.properties.end_time).toLocaleString() : 'N/A'}</span></p>
  </div>
)}
    </div>
  );
}

export default App;