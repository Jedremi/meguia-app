// /Services/FlightService.js
const AMADEUS_CLIENT_ID = 'SUA_CHAVE_ID';
const AMADEUS_CLIENT_SECRET = 'SUA_CHAVE_SECRET';
let accessToken = null;

// Função para logar na API
async function authenticateAmadeus() {
  if (accessToken) return accessToken;
  const res = await fetch(
    'https://test.api.amadeus.com/v1/security/oauth2/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${AMADEUS_CLIENT_ID}&client_secret=${AMADEUS_CLIENT_SECRET}`,
    }
  );
  const data = await res.json();
  accessToken = data.access_token;
  return accessToken;
}

// Buscar voos
export async function buscarVoos(origem, destino, data) {
  const token = await authenticateAmadeus();
  const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origem}&destinationLocationCode=${destino}&departureDate=${data}&adults=1&nonStop=false&currencyCode=BRL&max=5`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  return json.data?.map(oferta => ({
    preco: oferta.price.total,
    classe: oferta.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin,
    segmentos: oferta.itineraries[0].segments.map(seg => ({
      partida: seg.departure.iataCode,
      chegada: seg.arrival.iataCode,
      horario: seg.departure.at,
      duracao: seg.duration,
    })),
  })) || [];
}