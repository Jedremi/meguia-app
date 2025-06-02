import { calculateRouteDistance, estimateTravelTime } from '../../utils/routeCalculations';

describe('Route Calculations', () => {
  const origin = { lat: -23.5505, lng: -46.6333 }; // São Paulo
  const destination = { lat: -22.9068, lng: -43.1729 }; // Rio de Janeiro

  it('calculates distance between two points', () => {
    const distance = calculateRouteDistance(origin, destination);
    expect(distance).toBeCloseTo(358.07, 1); // ~358 km
  });

  it('estimates travel time by car', () => {
    const time = estimateTravelTime(origin, destination, 'car');
    expect(time.hours).toBeGreaterThan(5);
    expect(time.hours).toBeLessThan(7);
  });

  it('throws error for invalid transport', () => {
    expect(() => {
      estimateTravelTime(origin, destination, 'invalid');
    }).toThrow('Transporte não suportado');
  });
});