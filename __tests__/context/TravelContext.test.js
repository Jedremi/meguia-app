import React from 'react';
import { render, act } from '@testing-library/react-native';
import { TravelProvider, useTravel } from '../../contexts/TravelContext';

// Componente de teste para acessar o contexto
const TestComponent = () => {
  const { trips, addTrip } = useTravel();
  return (
    <>
      <Text testID="trips-count">{trips.length}</Text>
      <Button 
        testID="add-button"
        onPress={() => addTrip({ id: '1', destination: 'Test' })}
        title="Add"
      />
    </>
  );
};

describe('TravelContext', () => {
  it('provides initial empty trips', () => {
    const { getByTestId } = render(
      <TravelProvider>
        <TestComponent />
      </TravelProvider>
    );

    expect(getByTestId('trips-count').props.children).toBe(0);
  });

  it('adds new trip correctly', async () => {
    const { getByTestId } = render(
      <TravelProvider>
        <TestComponent />
      </TravelProvider>
    );

    await act(async () => {
      fireEvent.press(getByTestId('add-button'));
    });

    expect(getByTestId('trips-count').props.children).toBe(1);
  });
});