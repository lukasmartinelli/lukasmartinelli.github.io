---
layout: post
title: Visual Regression Testing for Maps
published: true
tags:
  - cartography
  - imaging
  - mapbox
  - tilelive
  - ci
categories: gis
---

If you are working on a web map it is difficult to see what changes a
line of [CartoCSS](http://wiki.openstreetmap.org/wiki/CartoCSS) can cause.
With visual regression testing you can create a diff between versions and ensure quality.

At [Geometa Lab](http://www.ifs.hsr.ch/Geometa-Lab.12520.0.html) we are currently building
[Mapbox Streets compatible vector tiles](https://github.com/geometalab/osm2vectortiles/)
of the entire planet for custom styling with [Mapbox Studio Classic](https://www.mapbox.com/mapbox-studio-classic/).
We want to make sure that even though you are using our vector tiles,
you get the same end results when you switch out the source in Mapbox Studio Classic
styles such as [OSM Bright 2](https://github.com/mapbox/mapbox-studio-osm-bright.tm2).

## Visual Regression Testing Example

Assume we apply a few changes to the OSM Bright 2 style.
We change the labels to German, make the forests a bit darker and greener
and change the width of main roads at lower zoom levels.

<img style="width: 49%;" src="/media/osm_bright_original.png">
<img style="width: 49.5%;" src="/media/osm_bright_changed.png">

With subtle changes it is difficult to detect what actually happened and
what impact the changes have.
[LeafletJS](http://leafletjs.com/) creator Vladimir Agafonkin
recently open sourced the [pixelmatch](https://github.com/mapbox/pixelmatch) library for pixel-level image comparison for visual regression tests.
Now we generate the diff between the two images.

```
pixelmatch image_v1.png image_v2.png image_diff.png 0.005 1
```

We can also generate an animated GIF visualizing the changes using
the all mighty [ImageMagick](http://www.imagemagick.org/script/index.php).

```bash
convert image_v1.png image_v2.png -gravity south -set delay 100 image_diff.gif
```

<img style="width: 49%;" src="/media/osm_bright_diff.png">
<img style="width: 49%;" src="/media/osm_bright_animated.gif">

## Diff Raster Map

With tilelive we are now able to generate raster maps so that one can interactively browse
the map diffs as web maps.

### GIF Animation

Browse animated GIFs where the different tiles are the GIF frames.

![OSM Bright GIF visualization](/media/osm_bright_gif_diff.gif)

### Visual Diff

Browse the visual difference between the generated tiles.

We can now detect the change from English labels to German labels where
the names were different and that all wood lands are rendered differently.
Streets appear to stay the same on zoom level 12 except the color
of the main roads (visible as yellow shade).

![OSM Bright visual diff](/media/osm_bright_visual_diff.gif)


## Generate Raster Map

Install the necessary tilelive packages.

```
npm install -g tl tilelive-mapbox tilelive-file tilejson mbtiles
```

Export the Mapbox API access token.

```bash
epxort MAPBOX_ACCESS_TOKEN="pk.eyJ1IjoibW9yZ..."
```

Now copy a section of your existing map `v1` to disk, in my case it is Zurich.

```bash
tl copy -z 6 -Z 14 -b "8.4039 47.3137 8.6531 47.4578" \
mapbox:///morgenkaffee.fab6dc76 file://./tiles_v1
```

You can also copy from a `tilejson` source using [node-tilejson](https://github.com/mapbox/node-tilejson).

After you made the changes to your map copy the changed tiles `v2`.

```bash
tl copy -z 6 -Z 14 -b "8.4039 47.3137 8.6531 47.4578" \
mapbox:///morgenkaffee.9c069ced file://./tiles_v2
```

### Create the Diff

Now we need to compare the changes between all tiles in the `tiles_v1`
folder with the tiles from `tiles_v2`.
We loop through the folder structures of the two folders and execute
the pixelmatch and ImageMagick commands.

Create the bash file `create_diffs.sh` and make it executable.

```bash
#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

readonly PROGNAME=$(basename $0)
readonly CWD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

readonly DIFF_DIR="$CWD/diff"
readonly GIF_DIR="$CWD/gif"
readonly THRESHOLD=${THRESHOLD:-0.005}
readonly ANTIALIASING=${ANTIALIASING:-1}

if [ "$#" -ne 2 ]; then
    echo "Usage: $PROGNAME <tile_folder_1> <tile_folder_2>"
    exit 1
fi

readonly DIR_1=$1
readonly DIR_2=$2

function create_diffs() {
    mkdir -p $DIFF_DIR
    mkdir -p $GIF_DIR

    # Metadata is needed to recreate a map out of the diffed tiles
    cp "$DIR_1/metadata.json" "$DIFF_DIR"
    cp "$DIR_1/metadata.json" "$GIF_DIR"

    local z_folder
    for z_folder in $DIR_1/*/; do
        local x_folder
        for x_folder in $z_folder*/; do
            local y_file
            for y_file in $x_folder*.png; do
                echo $y_file

                local y_name=$(basename "$y_file")
                local y_basename=${y_name%.*}
                local z_name=$(basename "$z_folder")
                local x_name=$(basename "$x_folder")

                local src="$y_file"
                local dst="$DIR_2/$z_name/$x_name/$y_name"
                local diff_output="$DIFF_DIR/$z_name/$x_name/$y_name"
                local gif_output="$GIF_DIR/$z_name/$x_name/$y_basename".gif

                mkdir -p "$DIFF_DIR/$z_name/$x_name"
                mkdir -p "$GIF_DIR/$z_name/$x_name"

                pixelmatch "$src" "$dst" "$diff_output" "$THRESHOLD" "$ANTIALIASING"
                convert "$src" "$dst" -gravity south -set delay 100 "$gif_output"

                # Trick mbtiles into using GIFs as PNGs
                mv "$gif_output" "$GIF_DIR/$z_name/$x_name/$y_basename".png
            done
        done
    done
}

create_diffs
```

You can now create diffs between two tile folders.

```bash
./create_diffs.sh tiles_v1 tiles_v2
```

You can fine tune the image comparison threshold and the antialising pixels with env vars.

```bash
THRESHOLD=0.01 ANTIALIASING=2 ./create_diffs.sh tiles_v1 tiles_v2
```

### Copy Raster Tiles

Now we can create a new raster map out of the diff tiles.
Copy the tiles into MBTiles.

```bash
tl copy file://./diff mbtiles://./diffs.mbtiles
```

And for the GIFs as well.

```bash
tl copy file://./gif  mbtiles://./gifs.mbtiles
```

Now you can serve the MBTiles yourself with [tileserver-php](https://github.com/klokantech/tileserver-php/)
or upload it to Mapbox.

## Upload to Mapbox

Upload your raster MBTiles to Mapbox.
You can use the [mapbox-upload](https://github.com/mapbox/mapbox-upload) script
to upload the MBTiles programmatically.
The raster map should now appear in the *data* section and you can browse the diffs.

![Mapbox data view](/media/mapbox_data_view.png)

You can preview the raster MBTiles in your browser and look through all the
changes you made on all zoom levels.

## Conclusion

Ensuring quality of your maps is not that hard and tools like
[tilelive](https://github.com/mapbox/tilelive) make it really easy to extract and compare tiles.
For greater benefit you should include visual regression into your CI workflow.
