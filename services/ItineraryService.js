// /Services/ItineraryService.js
import { fetchDirections } from "../utils/mapUtils";
import { buscarLocaisPorTipo } from "../utils/placesUtils";
import { buscarHoteis } from "../utils/hotelUtils";

const GOOGLE_API_KEY = 'SUA_CHAVE_GOOGLE';

export async function gerarItinerario({origem, destino, modo, distanciaDia, pets, tipoHospedagem}) {
  // 1. Obtenha a rota
  const rota = await fetchDirections(origem, destino, GOOGLE_API_KEY);

  let paradas = [];
  // Simulação: a cada distanciaDia km, busca um posto de gasolina e local para dormir
  let acumuladoKm = 0;
  for (let i = 0; i < rota.length - 1; i++) {
    // Calcule a distância entre pontos (pode usar haversine)
    acumuladoKm += 10; // ou calcule real
    if (acumuladoKm > distanciaDia && modo !== 'aviao') {
      // Pega um posto e hotel/camping perto dessa coordenada
      const gasStation = await buscarLocaisPorTipo(
        rota[i].latitude, rota[i].longitude, "gas_station", GOOGLE_API_KEY);
      const hospedagem = tipoHospedagem === "camping"
        ? await buscarLocaisPorTipo(rota[i].latitude, rota[i].longitude, "campground", GOOGLE_API_KEY)
        : await buscarHoteis(rota[i].latitude, rota[i].longitude, {petFriendly: pets}, GOOGLE_API_KEY);

      paradas.push({
        km: acumuladoKm,
        gasStation: gasStation[0] || null,
        hospedagem: hospedagem[0] || null
      });
      acumuladoKm = 0;
    }
  }
  return {rota, paradas};
}