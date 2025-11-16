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

  // The VirusTotal API requires the URL to be Base64 encoded, without padding.
  const encodedUrlId = Buffer.from(urlToScan).toString('base64').replace(/=/g, '');

  // This uses the environment variable you set in the Netlify UI
  const API_KEY = process.env.VITE_VIRUSTOTAL_API_KEY;
  const options = {
    method: 'GET',
    headers: {
      'x-apikey': API_KEY,
    },
  };

  try {
    // The serverless function calls the VirusTotal API with the correct Base64 ID
    const response = await fetch(`https://www.virustotal.com/api/v3/urls/${encodedUrlId}`, options);
    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from VirusTotal.' }),
    };
  }
};
