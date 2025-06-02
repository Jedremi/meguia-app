import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from '../utils/constants';

const BASE_URL = 'https://maps.googleapis.com/maps/api/directions/json';

export async function getDirections(origin, destination) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error(response.data.error_message || 'Erro ao buscar direções');
    }

    return response.data.routes[0];
  } catch (error) {
    console.error('Erro ao buscar direções:', error.message);
    throw error;
  }
}
