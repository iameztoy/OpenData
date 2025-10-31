/* MAXAR Hurricane Melissa (2025): build RGB and 1-band mosaics # Hurricane Melissa (2025).
  Earth Engine script that filters a MAXAR collection to 3-band RGB and 1-band scenes, then mosaics each.

Source collection -- awesome-gee-community-catalog : https://gee-community-catalog.org/projects/maxar_opendata/#citation

**Usage:** paste `melissa_mosaics.js` into the Earth Engine Code Editor and run.
Collection: `projects/sat-io/open-datasets/MAXAR-OPENDATA/hurricane_melissa_2025`
*/

var m = ee.ImageCollection('projects/sat-io/open-datasets/MAXAR-OPENDATA/hurricane_melissa_2025'); 

// Keep only 3-band images and standardize band names
var rgbCol = m.map(function(img) {
  var bn = img.bandNames();
  var count = bn.size();
  // If it has 3 bands, rename them to R,G,B; otherwise leave as-is.
  var maybeRenamed = ee.Image(ee.Algorithms.If(
    count.eq(3),
    img.select(bn, ['R', 'G', 'B']),
    img
  ));
  return maybeRenamed.set('band_count', count);
}).filter(ee.Filter.eq('band_count', 3));

// Mosaic all 3-band images
var mosaic = rgbCol.mosaic();

// Display
Map.addLayer(mosaic, {bands: ['R','G','B'], min: 0, max: 255}, 'MAXAR 3-band mosaic');

// Optional: center the map on the mosaic footprint (fallback to first image if needed)
var geom = ee.Image(rgbCol.first()).geometry();
Map.centerObject(geom, 10);

// (Optional) Inspect sizes
print('All images:', m.size());
print('3-band images:', rgbCol.size());

///////////////////////////////////////////////

// Keep only 1-band images and standardize band name to 'gray'
var oneBandCol = m.map(function(img) {
  var bn = img.bandNames();
  var count = bn.size();

  var maybeRenamed = ee.Image(ee.Algorithms.If(
    count.eq(1),
    // Select the single band (whatever its original name is) and rename to 'gray'
    img.select([bn.get(0)], ['gray']),
    img
  ));

  return maybeRenamed.set('band_count', count);
}).filter(ee.Filter.eq('band_count', 1));

// Mosaic all 1-band images
var oneBandMosaic = oneBandCol.mosaic();

// Display (use a typical 11-bit stretch for Maxar; adjust if needed)
Map.addLayer(oneBandMosaic, {bands: ['gray'], min: 80, max: 225}, 'MAXAR 1-band mosaic');

// Optional: center on the mosaic footprint (fallback to first image if needed)
var g1 = ee.Image(oneBandCol.first()).geometry();


// (Optional) Inspect sizes
print('1-band images:', oneBandCol.size());
