import { VFC, useRef, useEffect } from 'react';
import useGoogleMap from '../hooks/useGoogleMap';

type Props = {
  onClick?(this: google.maps.Marker): void;
  options?: Omit<google.maps.MarkerOptions, 'map' | 'position'>;
} & google.maps.LatLngLiteral;

const Marker: VFC<Props> = ({ lat, lng, onClick, options }) => {
  const map = useGoogleMap();

  const markerRef = useRef<google.maps.Marker>();

  useEffect(() => {
    markerRef.current = new google.maps.Marker({
      ...options,
      map,
    });

    const marker = markerRef.current;

    return () => marker.setMap(null);
  }, []);

  useEffect(() => {
    markerRef.current?.setPosition({ lat, lng });
  }, [lat, lng]);

  useEffect(
    () => onClick && markerRef.current?.addListener('click', onClick).remove,
    [onClick]
  );

  return null;
};

export default Marker;
