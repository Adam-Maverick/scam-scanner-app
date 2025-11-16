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
const handleCheckClick = async () => {
  // 1. Start loading and clear old results
  setIsLoading(true);
  setResults(null);

  // Normalize the URL - add https:// if no protocol
  let urlToScan = inputValue.trim();
  if (!urlToScan.startsWith('http://') && !urlToScan.startsWith('https://')) {
    urlToScan = 'https://' + urlToScan;
  }

  try {
    // 2. Call our Netlify Function (which securely calls VirusTotal)
    const response = await fetch(`/.netlify/functions/check-url?url=${encodeURIComponent(urlToScan)}`);
    
    console.log('Function response status:', response.status);
    console.log('Function response ok:', response.ok);
    
    const data = await response.json();
    
    console.log('Function response data:', data);

    if (!response.ok) {
        // If the response is not good, handle it
        const errorMsg = data.error?.message || data.error || 'Failed to fetch data from VirusTotal.';
        throw new Error(errorMsg);
    }

    // 3. Save the result to our state
    setResults(data);

  } catch (error) {
    // 4. If anything goes wrong, save the error message
    console.error('Error fetching data:', error);
    setResults({ error: error.message }); // Store error info to display to the user
  } finally {
    // 5. Stop loading, whether it succeeded or failed
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
      <h3>{getRiskLevel(results.data.attributes.last_analysis_stats)}</h3>
      <p>
        Scanners detecting this as malicious:
        <strong> {results.data.attributes.last_analysis_stats.malicious} / {Object.keys(results.data.attributes.last_analysis_results).length}</strong>
      </p>
    </div>
  )}
</div>
    </div>
  )
}

export default App