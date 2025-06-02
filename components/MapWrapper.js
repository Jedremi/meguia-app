import React from 'react';
import { Platform, View } from 'react-native';

let MapView;
let Marker;
let Polyline;

if (Platform.OS === 'web') {
  const WebMap = require('react-native-web-maps').default;
  MapView = WebMap;
  Marker = (props) => <View {...props} />;  // Placeholder, customize se necessário
  Polyline = () => null;
} else {
  const RNMap = require('react-native-maps');
  MapView = RNMap.default;
  Marker = RNMap.Marker;
  Polyline = RNMap.Polyline;
}

export { MapView, Marker, Polyline };
