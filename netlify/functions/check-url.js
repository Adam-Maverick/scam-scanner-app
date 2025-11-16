// netlify/functions/check-url.js

exports.handler = async function(event, context) {
  // Get the URL to scan from the query parameters
  const urlToScan = event.queryStringParameters.url;

  if (!urlToScan) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'URL parameter is missing.' }),
    };
  }

  // Use the environment variable you will set in the Netlify UI.
  // We only need one. Let's use the cleaner name.
  const API_KEY = process.env.VIRUSTOTAL_API_KEY;
  
  // This is the check that is currently failing.
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key is not configured. Please set VIRUSTOTAL_API_KEY in Netlify environment.' }),
    };
  }
  
  const options = {
    method: 'GET',
    headers: {
      'x-apikey': API_KEY,
    },
  };

  try {
    // THIS IS THE FIX: The ID for the URL is the URL itself.
    // We use encodeURIComponent to ensure it's a valid part of the API path.
    const apiUrl = `https://www.virustotal.com/api/v3/urls/${encodeURIComponent(urlToScan)}`;

    console.log('Calling VirusTotal API:', apiUrl);
    
    const response = await fetch(apiUrl, options);
    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error fetching from VirusTotal:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to fetch data from VirusTotal: ${error.message}` }),
    };
  }
};