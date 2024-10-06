import React, { useState } from "react";
const SearchBar = ({ onSearchResult }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const handleSearch = async (event) => {
    event.preventDefault();
    if (!query) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
      );
      const data = await response.json();
      setResults(data); // Set the results to state
    } catch (error) {
      console.error("Error fetching geocoding data:", error);
    }
  };
  const handleSelect = (result) => {
    const { lon, lat } = result;
    onSearchResult([lon, lat]); // Pass the coordinates back to the parent
    setQuery(""); // Clear the input
    setResults([]); // Clear the results
  };
  return (
    <div className="relative overflow-y-auto">
      <form onSubmit={handleSearch} className="flex text-black">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for places"
          className="border p-2 rounded"
        />
        <button type="submit" className="ml-2 bg-blue-500 text-white p-2 rounded">
          Search
        </button>
      </form>
      {results.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 mt-1 w-full text-black">
          {results.map((result) => (
            <li
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="p-2 hover:bg-gray-200 cursor-pointer"
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default SearchBar;