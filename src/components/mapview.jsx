import React from "react";
import { Map } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import maplibre from "maplibre-gl";


const MapView = ({ viewport, layers, handleMapClick }) => {
  return (
    <DeckGL
      initialViewState={viewport}
      controller={true}
      layers={layers}
      onClick={handleMapClick}
      style={{ width: "100vw", height: "100vh" }}
    >
      <Map
        mapLib={maplibre}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        {...viewport}
      />
    </DeckGL>
  );
};

export default MapView;