// api/titles.js

// This is the default function Vercel looks for.
export default async function handler(request, response) {
  
  // 1. Get the Secret API Key from the Vercel Environment Variables
  const WATCHMODE_KEY = process.env.WATCHMODE_API_KEY;

  if (!WATCHMODE_KEY) {
    return response.status(500).json({ error: 'API key not configured.' });
  }

  // 2. Extract necessary query parameters (like region and page) from the frontend request
  const { regions = 'US', page = '1', limit = '50' } = request.query;

  // 3. Construct the secure Watchmode URL using the secret key
  const watchmodeUrl = `https://api.watchmode.com/v1/list-titles/?apiKey=${WATCHMODE_KEY}&regions=${regions}&types=movie,tv_series&source_types=sub,free&sort_by=popularity_desc&limit=${limit}&page=${page}`;

  try {
    // 4. Call the external Watchmode API from the secure serverless environment
    const watchmodeResponse = await fetch(watchmodeUrl);

    if (!watchmodeResponse.ok) {
      // Pass the Watchmode error status/message back to the frontend
      const errorData = await watchmodeResponse.json();
      return response.status(watchmodeResponse.status).json(errorData);
    }

    // 5. Send the JSON data received from Watchmode back to the frontend
    const data = await watchmodeResponse.json();
    
    // Set caching headers to tell the browser/Vercel CDN to cache this result
    response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // 24 hours
    
    return response.status(200).json(data);

  } catch (error) {
    console.error('Watchmode proxy error:', error);
    return response.status(500).json({ error: 'Failed to fetch data from Watchmode.' });
  }
}