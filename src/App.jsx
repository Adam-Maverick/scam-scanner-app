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

  const API_KEY = 'c2b95d453eaef8c73117df2d4ff81616296dba3cbda5932337d1e86f1a5b3d48';

  // VirusTotal requires the URL to be Base64 encoded
  // The btoa() function does this for us.
  const urlId = btoa(inputValue).replace(/=/g, '');
  const options = {
    method: 'GET',
    headers: {
      'x-apikey': API_KEY
    }
  };

  try {
    // 2. "fetch" the data from the VirusTotal API
    const response = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, options);

    if (!response.ok) {
        // If the response is not good (e.g., 404 not found), handle it
        throw new Error('URL not found in VirusTotal database. This does not mean it is safe, just that it has not been scanned before.');
    }

    const data = await response.json();
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