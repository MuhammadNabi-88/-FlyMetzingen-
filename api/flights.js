// Vercel Serverless - Secure Amadeus Proxy
// Your secret stays on server, never in browser

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { from, to, date, adults = 1, cabin = 'ECONOMY', direct = 'false' } = req.query;

  if (!from || !to || !date) {
    return res.status(400).json({ error: 'Missing from, to, date' });
  }

  try {
    // 1. Get Amadeus Token - SECRET IS ONLY HERE ON SERVER
    const tokenRes = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${process.env.AMADEUS_KEY}&client_secret=${process.env.AMADEUS_SECRET}`
    });

    const tokenData = await tokenRes.json();
    
    if (!tokenData.access_token) {
      return res.status(500).json({ error: 'Amadeus auth failed', details: tokenData });
    }

    // 2. Search Real Flights
    const flightUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${from}&destinationLocationCode=${to}&departureDate=${date}&adults=${adults}&travelClass=${cabin}&nonStop=${direct}&max=15&currencyCode=EUR`;
    
    const flightRes = await fetch(flightUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const flightData = await flightRes.json();

    // 3. Return to frontend
    return res.status(200).json(flightData);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}