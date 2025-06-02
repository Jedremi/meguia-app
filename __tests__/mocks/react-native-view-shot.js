export const captureRef = jest.fn(() => Promise.resolve('file://mock-image.png'));

export default {
  captureRef,
};