---
layout: post
title: Global Noise Pollution Map
published: true
tags:
  - cartography
  - openstreetmap
  - data
  - sql
  - vectortiles
categories: gis
---

Visualization of noise pollution for the entire world based on top of OSM data. Search for your city
and check for the noisy places.
Using global street, landuse and building data from [OpenStreetMap](https://openstreetmap.org)
we can approximate where noise pollution might happen.
We use a very simple noise model inspired by [noise pollution concept of Cities Skylines](http://www.skylineswiki.com/Pollution#Noise_pollution).

Take a look [at the full screen map](/maps/noise-pollution.html) and explore some cities and their noise visualizations.

<iframe src="/maps/noise-pollution.html" frameborder="0" scrolling="0" width="100%" height="540px" style="margin-bottom:25px;"></iframe>

## How does it work?

Check out the [GitHub repository for the code and styles](https://github.com/lukasmartinelli/osm-noise-pollution).

In the model we add a buffer to **noisy objects**. This is the area that is probably affected by noise. Very noisy objects get a high buffer and less noisy objects a smaller buffer.

In order for this to work we make several assumptions:

1. Highways, trunks, primary and secondary roads are noisy. Normal street or service roads are not
2. Railways are noisy
3. Retail and industrial zones always have a noisy base limit
4. All shops and food places (especially restaurants) are noisy
5. Most party and event buildings are noisy (except some shady places)
6. Most leisure buildings are noisy
7. Some sport buildings are noisy
8. Some tourism buildings are noisy

For OSM features that match this criterias we assign a buffer and remove the overlapping parts which results
in a simple approximation of noise pollution.

### Noise Levels

The noise pollution areas are divided into three noise level.

| Zone   | dB
|--------|-----------
| L1     | ≥ 65
| L2     | 55 - 64.9
| L3     | 45 - 54.9

Each OSM feature emits a custom buffer for each noise level.
You are very welcome to suggest different values, they are only educated guesses derived from the Swiss [sonBASE noise map](https://map.geo.admin.ch/?Y=716599.25&X=230992.54&zoom=8&bgLayer=ch.swisstopo.pixelkarte-grau&layers=ch.bafu.laerm-strassenlaerm_tag&layers_opacity=0.7&lang=de&topic=bafu). Of course this approximation does not include damping through buildings,
traffic volume and all the other fancy stuff - but it is simple enough to be applied globally.

### Roads

| Tag                 | L1    | L2     | L3
|---------------------|-------|--------|---------
| `highway=motorway`  | `60m` | `220m` | `500m`
| `highway=trunk`     | `50m` | `190m` | `400m`
| `highway=primary`   | `35m` | `160m` | `300m`
| `highway=secondary` |       | `80m`  | `125m`
| `highway=tertiary`  |       | `35m`  | `65m`

### Railways

| Tag                           | L1    | L2    | L3
|-------------------------------|-------|-------|---------
| `rail=[rail,narrow_gauge,..]` | `30m` | `60m` | `100m`
| `rail=[light_rail,tram,..]`   |       | `30m` | `60m`

### Industrial and Retail Zones

| Tag               | L1  | L2   | L3   |
|-------------------|-----|------|------|
| `landuse=industrial`|     | `50m` | `100m` |
| `landuse=retail`    |     | `70m` | `180m` |

### Shops and Food

| Tag                         | L1  | L2    | L3
|-----------------------------|-----|-------|--------
| `shop=[any]`                |     | `30m` | `65m`
| `amenity=[bar,bbq,cafe,..]` |     | `35m` | `75m`

### Party

| Tag                                    | L1    | L2    | L3
|----------------------------------------|-------|-------|--------
| `amenity=[cinema,casino,nightclub,..]` | `40m` | `70m` | `150m`


### Leisure

| Tag                             | L1    | L2     | L3
|---------------------------------|-------|--------|-------
| `leisure=[beach_resort,zoo,..]` | `35m` | `55m`  | `75m`

### Sport

| Tag                           | L1    | L2     | L3
|-------------------------------|-------|--------|-------
| `sporty=[baseball,soccer,..]` | `40m` | `60m`  | `80m`

These values are implemented in the vector tile data source in `src/vector-datasource/data.yml`.
