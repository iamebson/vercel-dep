// api/titles.js

export default async function handler(request, response) {
  
  // *** NEW: Add CORS Headers FIRST ***
  // This allows *any* origin (like your Muvi domain) to access the API.
  response.setHeader('Access-Control-Allow-Origin', '*'); 
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight (OPTIONS) requests which browsers send first for CORS checks
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  // ... rest of your existing code remains below ...
  const WATCHMODE_KEY = process.env.WATCHMODE_API_KEY;

  if (!WATCHMODE_KEY) {
    return response.status(500).json({ error: 'API key not configured.' });
  }

  // Extract necessary query parameters
  const { regions = 'US', page = '1', limit = '50' } = request.query;
  const watchmodeUrl = `https://api.watchmode.com/v1/list-titles/?apiKey=${WATCHMODE_KEY}&regions=${regions}&types=movie,tv_series&source_types=sub,free&sort_by=popularity_desc&limit=${limit}&page=${page}`;

  try {
    const watchmodeResponse = await fetch(watchmodeUrl);

    if (!watchmodeResponse.ok) {
      const errorData = await watchmodeResponse.json();
      // Ensure error responses also have the CORS header before returning
      return response.status(watchmodeResponse.status).json(errorData);
    }

    const data = await watchmodeResponse.json();
    
    // Set caching headers
    response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); 
    
    return response.status(200).json(data);

  } catch (error) {
    console.error('Watchmode proxy error:', error);
    return response.status(500).json({ error: 'Failed to fetch data from Watchmode.' });
  }
}