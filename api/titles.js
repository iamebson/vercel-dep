// api/titles.js - Simplified and CORS-ready
export default async function handler(request, response) {
  
  // *** NEW: Handle CORS preflight OPTIONS request ***
  if (request.method === 'OPTIONS') {
    // Vercel.json handles the headers, we just need to end the response.
    return response.status(200).end();
  }
  
  const WATCHMODE_KEY = process.env.WATCHMODE_API_KEY;

  // ... (Rest of your secure function logic remains the same) ...

  const { regions = 'US', page = '1', limit = '20' } = request.query;
  const watchmodeUrl = `https://api.watchmode.com/v1/list-titles/?apiKey=${WATCHMODE_KEY}&regions=${regions}&types=movie,tv_series&source_types=sub,free&sort_by=popularity_desc&limit=${limit}&page=${page}`;

  try {
    const watchmodeResponse = await fetch(watchmodeUrl);
    
    // ... (Error handling and data parsing) ...
    if (!watchmodeResponse.ok) {
      const errorData = await watchmodeResponse.json();
      return response.status(watchmodeResponse.status).json(errorData);
    }
    
    const data = await watchmodeResponse.json();
    
    // Set caching headers only (CORS headers are handled by vercel.json)
    response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); 
    
    return response.status(200).json(data);

  } catch (error) {
    console.error('Watchmode proxy error:', error);
    return response.status(500).json({ error: 'Failed to fetch data from Watchmode.' });
  }
}