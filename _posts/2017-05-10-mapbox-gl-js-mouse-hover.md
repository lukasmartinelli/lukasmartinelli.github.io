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


Visualization of noise pollution for the entire world based on top of OSM data. Search for your city
and check for the noisy places.
Using global street, landuse and building data from [OpenStreetMap](https://openstreetmap.org)
we can approximate where noise pollution might happen.
We use a very simple noise model inspired by [noise pollution concept of Cities Skylines](http://www.skylineswiki.com/Pollution#Noise_pollution).

Take a look [at the full screen map](/maps/noise-pollution.html) and explore some cities and their noise visualizations.

<iframe src="/maps/hover-filter.html" frameborder="0" scrolling="0" width="100%" height="540px" style="margin-bottom:25px;"></iframe>

<iframe src="/maps/hover-geojson.html" frameborder="0" scrolling="0" width="100%" height="540px" style="margin-bottom:25px;"></iframe>

