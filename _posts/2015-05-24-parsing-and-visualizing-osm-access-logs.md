---
layout: post
title: Parsing and Visualizing OSM Access Logs
tags:
  - osm
  - gis
  - python
  - bash
  - cartodb
categories: python
published: true
---

[OpenStreetMap](https://www.openstreetmap.org/) now provides public access to the access logs of
their tile map server from 2014 until today.
In this article I will show you how to parse the access logs with Bash and Python and visualize the data with CartoDB.

Many thanks to [Matt Amos](https://github.com/zerebubuth) for making the log files accessible and
to [@sfkeller](https://twitter.com/sfkeller) and [@mrothh](https://twitter.com/mrothh) for their help.

## Total OSM Views

All OSM tile access logs at zoom level 18 aggregated over the period of 2014.

<iframe width='100%' height='520' frameborder='0' src='https://lukasmartinelli.cartodb.com/viz/65bddab0-ef6c-11e4-86e6-0e018d66dc29/embed_map' allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>

## OSM Views over Time

All OSM tile requests per day at zoom level 18 aggregated over the period of 2014 Q1 until 2015 Q1.
The CartoDB animation does not work with Firefox 38. Try Chrome if you do not see any animation.

<iframe width='100%' height='520' frameborder='0' src='https://lukasmartinelli.cartodb.com/viz/bbfdbfe6-f280-11e4-b096-0e4fddd5de28/embed_map' allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>

## Tile Coordinates

To understand how tiling in OpenStreetMap or Google Maps works you best take look
at [this visualization from Maptiler](http://www.maptiler.org/google-maps-coordinates-tile-bounds-projection/)
and the [Google Maps API Docs](https://developers.google.com/maps/documentation/javascript/maptypes#TileCoordinates).

You basically have tiles in the same size (256x256 pixels) and there is one tile at the top (zoom level 0).
This tile is divided into 4 other tiles (zoom level 1), then 16 (zoom level 2) and so on. This partitioning strategy
is called [QuadTiles](http://wiki.openstreetmap.org/wiki/QuadTiles).

The coordinates in the example below use `(x,y,zoom)` as format. The index always starts at 0 on the upper left corner.

![Tiling explained](/media/tiling_explained.png)

## Download and extract the Tiles

Download all the access logs from the OSM server.

```bash
wget -nH -A xz -m http://planet.openstreetmap.org/tile_logs
```

Now extract the logs (you need to install the [XZ Utils](http://tukaani.org/xz/) first).

```bash
unxz *.xz
rm *.xz
```

Now take a look at one of the log files.

```bash
head -n 10 tiles-2015-05-21.txt
```

The access log has the tile index in the format `zoom,x,y` in the first column
and the number of views for that time period in the second column.
Tiles that were not accessed that day or have fewer than 10 views do not appear
in the access log file.

```bash
0/0/0 588590
1/0/0 139613
1/0/1 116224
1/1/0 135179
1/1/1 114632
2/0/0 138471
2/0/1 181236
2/0/2 109795
2/0/3 68219
2/1/0 182391
```

We expand tile coordinates into separate columns (from `1/0/0 139613` to `1 0 0 139613`).

```bash
sed -i 's/\// /g' *.txt
```

Now that we have valid CSV files we should rename them accordingly (from `.txt` to `.csv`).

```bash
rename 's/\.txt$/\.csv/' *.txt
```

You can now import those CSV files into your database.
We will continue with plain old Bash and some Python in this article.

## Calculate Tile Coordinates

To translate the tiles into actual coordinates we need to convert the tile indizes
into coordinates.

The [mercantile library](https://github.com/mapbox/mercantile) allow us to easily
calculate the [spherical mercator coordinates](http://en.wikipedia.org/wiki/Mercator_projection#The_spherical_model) for tiles.

```
pip install mercantile
```

We want to calculate the coordinates for the center of each tile.

```python
def calculate_center(x, y, zoom):
    bounds = mercantile.bounds(x, y, zoom)
    height = bounds.north - bounds.south
    width = bounds.east - bounds.west
    center = (bounds.north + height / 2, bounds.west + width / 2)
    return center
```

Now we write a stream processing script that reads our prepared CSV from `stdin`
and writes the tiles with the added coordinates to `stdout`.

```
cat tiles-2015-05-21.csv | ./calc_coords.py
```

You can look at the full script [here](https://github.com/lukasmartinelli/map-trends/blob/master/calc_coords.py).

## Visualize Tile Access over Time

### Prepare
Because we have too much data to display it all at once, we will only
look at tiles with the zoom level 18 (which means people have zoomed in
with a particular interest for that area).

```bash
cat tiles-2015-05-21.csv | awk '$1 == "18"'
```

To cut down the dataset even more we are only interested in tiles with coordinates
that are inside a bounding box around Switzerland.

```python
NORTH = Decimal('47.9922193487799')
WEST = Decimal('5.99235534667969')
EAST = Decimal('11.1243438720703')
SOUTH = Decimal('45.6769214851596')

def in_switzerland(coords):
    lat, lng = coords
    return lat < NORTH and lat > SOUTH and lng > WEST and lng < EAST
```

You can look at the full script [here](https://github.com/lukasmartinelli/map-trends/blob/master/filter_switzerland.py).

Now we can extract all swiss access logs.

```
cat tiles-2015-05-21.csv | ./filter_switzerland.py
```

In order to upload them to CartoDB we also need to add the time dimension
as first column.

```bash
cat tiles-2015-05-21.csv | sed -e "s/^/2015-05-21 /"
```

### Import in CartoDB

When uploading make sure you have a header row in your CSV. If you call the coordinates
`latitude` and `longitude` CartoDB will automatically recognize the geometry.

![CartoDB Dataset Screenshot](/media/cartodb_dataset_screenshot.png)

### Create Heatmap
Now that the dirty prepartion is over let's get to the fun part.

Creating a Heatmap with CartoDB is quite simple.
Select the heatmap template and choose the `date` column as time dimension.

![Create CartoDB heatmap](/media/heatmap_wizard.png)

## Conclusion

The OSM access logs have alot of interesting datapoints that only wait to be analyzed. The prepartion is dirty work but displaying the data
in CartoDB is a breeze. Stay tuned for further analysis.
