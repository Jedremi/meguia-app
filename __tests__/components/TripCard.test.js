import React from 'react';
import { render } from '@testing-library/react-native';
import TripCard from '../../components/TripCard';

const mockTrip = {
  id: '1',
  destination: 'Rio de Janeiro',
  departureDate: '2023-12-01',
  returnDate: '2023-12-10',
  imageUrl: 'https://example.com/rio.jpg'
};

describe('TripCard Component', () => {
  it('renders correctly with trip data', () => {
    const { getByText, getByTestId } = render(<TripCard trip={mockTrip} />);
    
    expect(getByText('Rio de Janeiro')).toBeTruthy();
    expect(getByText('01/12/2023 - 10/12/2023')).toBeTruthy();
    expect(getByTestId('trip-image').props.source.uri).toBe(mockTrip.imageUrl);
  });

  it('calls onPress when clicked', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <TripCard trip={mockTrip} onPress={mockOnPress} />
    );

    fireEvent.press(getByTestId('trip-card'));
    expect(mockOnPress).toHaveBeenCalledWith(mockTrip.id);
  });
});