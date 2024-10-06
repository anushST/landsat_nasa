import React, { useState, useEffect } from "react";
import apiClient from "../services/apiClient";

export default function Scene({ longitude, latitude, resetSidebar }) {
  const [location, setLocation] = useState("");
  const [fromDate, setFromDate] = useState("2024-09-01");
  const [toDate, setToDate] = useState("2024-10-01");
  const [minCloudCover, setMinCloudCover] = useState(0);
  const [maxCloudCover, setMaxCloudCover] = useState(10);
  const [loading, setLoading] = useState(false);
  const [sceneData, setSceneData] = useState(null);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false); // New state to track searching status

  useEffect(() => {
    // Reverse Geocoding to get location from longitude and latitude
    const fetchLocation = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        const formattedLocation = `${result.address.city || result.address.town || ""}, ${result.address.country || ""}`;
        setLocation(formattedLocation);
      } catch (err) {
        setIsSearching(false)
        console.error("Error fetching location:", err);
      }
    };

    if (longitude && latitude) {
      fetchLocation();
    }
  }, [longitude, latitude]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setIsSearching(true); // Set searching status to true
    try {
      const response = await apiClient("/pend_scenes", "POST", {
        time_range: `${fromDate}/${toDate}`,
        longitude: longitude,
        latitude: latitude,
        min_cloud_cover: minCloudCover,
        max_cloud_cover: maxCloudCover,
      });

      const sceneId = response.request_id;

      const interval = setInterval(async () => {
        try {
          const sceneResponse = await apiClient(
            `/get_scenes`,
            "GET",
            null,
            `?request_id=${sceneId}`
          );

          if (sceneResponse.status !== "in_progress") {
            clearInterval(interval);
            setSceneData(sceneResponse);
            setIsSearching(false); // Reset searching status
          }
        } catch (error) {
          console.error("Error fetching scene data:", error);
          setIsSearching(false)
          clearInterval(interval);
        }
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
   <>
    {sceneData && (
      <div className="flex items-center justify-between sticky top-0 bg-black w-full px-4 py-1 ">
      <h1 className="text-xl text-center font-bold my-5">Search for Satellite Scenes</h1>
       <button
             onClick={resetSidebar}
             className="bg-blue-500 w-32 block text-white rounded py-1 px-1 border  border-black transition "
           >
            +  New Search
           </button>
      </div>
    )}
      <div className="p-4">
     
      {!sceneData ? (
        <div className="mb-4 text-center m-auto">
          <div>Location: {location}</div>
          {/* Input Fields */}
          <h2 className="text-xl text-center font-bold my-5">Time Range:</h2>
          <div className="flex justify-center gap-5 mb-3">
            <div>
              <label className="block mb-2">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="block bg-white text-black rounded-lg py-2 px-3 w-fit focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-2">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="block bg-white text-black rounded-lg py-2 px-3 w-fit focus:outline-none"
              />
            </div>
          </div>
          <h2 className="text-xl text-center font-bold my-5">Cloud Cover (%):</h2>
          <div className="flex justify-center gap-5">
            <div>
              <label className="block mb-2">Minimum</label>
              <input
                type="number"
                value={minCloudCover}
                onChange={(e) => setMinCloudCover(e.target.value)}
                className="bg-white text-black rounded-lg py-2 px-3 w-fit focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-2">Maximum</label>
              <input
                type="number"
                value={maxCloudCover}
                onChange={(e) => setMaxCloudCover(e.target.value)}
                className="bg-white text-black rounded-lg py-2 px-3 w-fit focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="bg-red-500 block text-white rounded py-2 px-1 border mt-10 border-black transition w-full m-auto mt-3"
            disabled={isSearching}
          >
            Search
          </button>

         
        </div>
      ) : (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Scene Information:</h3>
          {sceneData.products.map((product) => (
            <div key={product.id} className="border border-gray-300 rounded p-4 mb-4">
              <img src={product.thumbnail} alt={product.id} className="rounded mb-2" />
              <p>
                <strong>ID:</strong> {product.id}
              </p>
              <p>
                <strong>Cloud Cover:</strong> {product.cloud_cover}%
              </p>
              <p>
                <strong>Date:</strong> {new Date(product.scene_datetime).toLocaleString()}
              </p>
              <p>
                <strong>Platform:</strong> {product.platform}
              </p>
              <p>
                <strong>WRS Path:</strong> {product.wrs_path}
              </p>
              <p>
                <strong>WRS Row:</strong> {product.wrs_row}
              </p>
              <p>
                <strong>Sun Azimuth:</strong> {product.sun_azimuth}°
              </p>
              <p>
                <strong>Sun Elevation:</strong> {product.sun_elevation}°
              </p>
              <button className="w-full py-2 mt-3 bg-black rounded-lg text-white flex items-center gap-3 justify-center font-bold border border-black hover:border-white hover:bg-white hover:text-black transition-all">Details <i class="fa-solid fa-arrow-right text-sm mt-0.5"></i> </button>
            </div>
          ))}

         
        </div>
      )}

        {isSearching && (
            <div className="animate-pulse">
              <div className="bg-gray-200 rounded h-48 w-full mb-4"></div>
              <div className="bg-gray-200 rounded h-6 w-full mb-2"></div>
              <div className="bg-gray-200 rounded h-6 w-full mb-2"></div>
              <div className="bg-gray-200 rounded h-6 w-full mb-2"></div>
            </div>
          )}

          {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
   </>
  );
}