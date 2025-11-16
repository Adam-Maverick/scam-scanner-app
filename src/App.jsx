// src/App.jsx

import { useState } from 'react'
import './App.css'

function App() {
  // State to hold the text from the input box
  const [inputValue, setInputValue] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null); // 'null' means no results yet

  // This function runs when the button is clicked
// This new function will replace your old handleCheckClick
// src/App.jsx -> inside the App component

const handleCheckClick = async () => {
  setIsLoading(true);
  setResults(null);

  let urlToScan = inputValue.trim();
  if (!urlToScan.startsWith('http://') && !urlToscan.startsWith('https://')) {
    urlToScan = 'https://' + urlToScan;
  }

  try {
    const response = await fetch(`/.netlify/functions/check-url?url=${encodeURIComponent(urlToScan)}`);
    
    // THIS IS THE NEW PART: Specifically check for a 404 status
    if (response.status === 404) {
      setResults({ isNotFound: true }); // Set a special state for "not found"
      return; // Stop the function here
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || data.error || 'Failed to fetch data.';
      throw new Error(errorMsg);
    }

    setResults(data);

  } catch (error) {
    setResults({ error: error.message });
  } finally {
    setIsLoading(false);
  }
};

// Helper function to determine risk level
const getRiskLevel = (stats) => {
  if (stats.malicious > 0) {
    return 'Dangerous';
  }
  if (stats.suspicious > 0) {
    return 'Suspicious';
  }
  return 'Safe';
};

  return (
    <div className="scanner-container">
      <h1>Online Scam Scanner</h1>
      <p>Paste a suspicious link or message below to check if it's safe.</p>

      <div className="input-area">
        <input
          type="text"
          placeholder="Paste a link here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={handleCheckClick}>Check Link</button>
      </div>

<div className="results-area">
  {/* Show a "Checking..." message while loading */}
  {isLoading && <p>Checking...</p>}

  {/* THIS IS THE NEW BLOCK: Handle the "Not Found" case */}
  {results && results.isNotFound && (
    <div className="result-card Suspicious">
      <h3>Not Yet Scanned</h3>
      <p>This URL was not found in the VirusTotal database. This doesn't mean it's safe or dangerous, only that it hasn't been analyzed before.</p>
    </div>
  )}

  {/* Show an error message if something went wrong */}
  {results && results.error && (
    <div className="result-card dangerous">
      <h3>Error</h3>
      <p>{results.error}</p>
    </div>
  )}

  {/* Show the results card if we have data */}
  {results && results.data && (
    <div className={`result-card ${getRiskLevel(results.data.attributes.last_analysis_stats)}`}>
      {/* ... existing code for Safe/Dangerous ... */}
    </div>
  )}
</div>
    </div>
  )
}

export default App