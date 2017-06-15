---
layout: post
title: Highlight Feature under Mouse Pointer in Mapbox GL
published: true
tags:
  - mapbox
  - js
categories: gis
image: /media/noise_maps/zurich.png
---
A common task with Mapbox GL is highlighting the feature you are currently
hovering over. Mapbox GL provides two different approaches to realize this functionality which we both explore in this
post.

This is based of the work we've been doing at the [US Disaster Vulnerability Map](https://ccusa.github.io/Disaster_Vulnerability_Map/#3/38.91/-76.92).

<style>
pre {
  font-size: 0.8em;
}
</style>

## Add a Map

[Create a web page and add a map](https://www.mapbox.com/mapbox-gl-js/examples/).

```js
mapboxgl.accessToken = 'pk.eyJ1Ijoi...';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-98, 38.88], minZoom: 2, zoom: 3
});
```

## Highlight Layer by using Mapbox GL Filters

The Mapbox GL style spec has the concepts of [filters](https://www.mapbox.com/mapbox-gl-js/style-spec/#types-filter) that you can
use to only display features in a layer that fulfill your criterias.

In order to create a highlighted layer one needs to:
- Create a separate `highlight` layer using the same data source
- Listen on mouseover event and query the rendered features
- Set the filter of your `highlight` layer to match the rendered features

**Pros**:
- Allows highlighting many features at once

**Cons**:
- Always does a full scan accross all your features
- Only works when few features are displayed

<iframe src="/maps/hover-filter.html" frameborder="0" scrolling="0" width="100%" height="540px" style="margin-bottom:25px;"></iframe>

```js
map.on('load', function() {
    // Add counties vector data source
    map.addSource('counties', {
        'type': 'vector',
        'url': 'mapbox://mapbox.82pkq93d'
    });
    // Add style layer to display counties
    map.addLayer({
        'id': 'counties',
        'type': 'fill',
        'source': 'counties',
        'source-layer': 'original',
        'paint': {
            'fill-outline-color': 'rgba(0,0,0,0.1)',
            'fill-color': 'rgba(0,0,0,0.1)'
        }
    }, 'place-city-sm'); // Place polygon under these labels.
    // Add a separate layer to highlight counties under the mouse pointer
    map.addLayer({
        'id': 'counties-highlighted',
        'type': 'fill',
        'source': 'counties',
        'source-layer': 'original',
        'paint': {
            'fill-outline-color': '#484896',
            'fill-color': '#6e599f',
            'fill-opacity': 0.75
        },
        // To start out we make sure the filter selects no county
        'filter': ['==', 'FIPS', '']
    }, 'place-city-sm'); // Place polygon under these labels.

    map.on('mousemove', 'counties', function(e) {
        map.getCanvas().style.cursor = 'pointer';
        var feature = e.features[0];
        // Set filter of the highlight layer to highlight the county we are currently
        // hovering on by filtering by the FIPS number of the county
        map.setFilter('counties-highlighted', ['==', 'FIPS', feature.properties.FIPS]);
    });

    map.on('mouseleave', 'counties', function() {
        map.getCanvas().style.cursor = '';
        // Reset highlight layer to highlight no counties
        map.setFilter('counties-highlighted', ['in', 'FIPS', '']);
    });
});
```

## Highlight Layer by using a custom Source

A more performant way to highlight the features under your mouse pointer is to have a separate data source
containing only the geometries you want to style differently.

- Create a separate data source for highlighted geometries
- Create a separate highlight layer referencing the highlighted geometry data source
- Listen on mouseover event and query the rendered features
- Update the GeoJSON data source

**Pros**:
- More performant than a full filter scan across your features
- Does not require unique attributes for your features

**Cons**:
- Highlighting many features has performance drawbacks

<iframe src="/maps/hover-geojson.html" frameborder="0" scrolling="0" width="100%" height="540px" style="margin-bottom:25px;"></iframe>

```js
map.on('load', function() {
    // Add the source to query. In this example we're using
    // county polygons uploaded as vector tiles
    map.addSource('counties', {
        'type': 'vector',
        'url': 'mapbox://mapbox.82pkq93d'
    });

    // Add a separate data source with the features we want to highlight
    map.addSource('counties-highlight', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': []
        }
    });

    map.addLayer({
        'id': 'counties',
        'type': 'fill',
        'source': 'counties',
        'source-layer': 'original',
        'paint': {
            'fill-outline-color': 'rgba(0,0,0,0.1)',
            'fill-color': 'rgba(0,0,0,0.1)'
        }
    }, 'place-city-sm'); // Place polygon under these labels.

    map.addLayer({
        'id': 'counties-highlighted',
        'type': 'fill',
        'source': 'counties-highlight',
        'paint': {
            'fill-outline-color': ''#484896',
            'fill-color': ''#6e599f',
            'fill-opacity': 0.75
        }
    }, 'place-city-sm'); // Place polygon under these labels.

    map.on('mousemove', 'counties', function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';
        // Single out the first found feature.
        var feature = e.features[0];
        map.getSource('counties-highlight').setData({
            'type': 'FeatureCollection',
            'features': [feature]
        });
    });

    map.on('mouseleave', 'counties', function() {
        map.getCanvas().style.cursor = '';
        // Reset the highlighted features
        map.getSource('counties-highlight').setData({
            'type': 'FeatureCollection',
            'features': []
        });
    });
});
```

