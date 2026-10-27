/**
 * Mock geo-tags (no GPS in this demo). Ward 27 uses the deck's Page 6 sample coordinates
 * (17.9860, 79.1188); other wards get stable nearby points.
 */
export const wardCoords = (wardId: number): { lat: number; lng: number } => {
  if (wardId === 27) return { lat: 17.986, lng: 79.1188 };
  return {
    lat: Number((17.97 + ((wardId * 37) % 60) / 1000).toFixed(4)),
    lng: Number((79.1 + ((wardId * 53) % 70) / 1000).toFixed(4)),
  };
};
