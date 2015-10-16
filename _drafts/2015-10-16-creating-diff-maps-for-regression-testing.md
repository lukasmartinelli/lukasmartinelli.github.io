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
line of CartoCSS can cause. With visual regression
testing you can create a diff between versions and ensure quality.

At [Geometa Lab](http://www.ifs.hsr.ch/Geometa-Lab.12520.0.html) we are currently building
[Mapbox Streets compatible vector tiles](https://github.com/geometalab/osm2vectortiles/)
of the entire planet for custom styling with [Mapbox Studio Classic](https://www.mapbox.com/mapbox-studio-classic/).
We want to make sure that even though you are using our vector tiles,
you get the same end results when you switch out the source in Mapbox Studio Classic
styles such as [OSM Bright 2](https://github.com/mapbox/mapbox-studio-osm-bright.tm2).

## Starting Point

Assume we apply a few changes to the OSM Bright 2 style.
We change the labels to German, make the forests a bit darker and greener
and change the width of main roads at lower zoom levels.

<img style="width: 49%;" src="/media/osm_bright_original.png">
<img style="width: 49.5%;" src="/media/osm_bright_changed.png">

Now we can compare the maps by eye side by side or we can use
visual regression testing to highlight the changes even more
and without human intervention because looking at more subtle changes
than these make it hard to visualize what actually happened and what impact the changes have.

[LeafletJS](http://leafletjs.com/) creator [Vladimir Agafonkin](https://twitter.com/mourner)
recently open sourced the [pixelmatch](https://github.com/mapbox/pixelmatch) library for pixel-level image comparison for visual regression tests.

```bash
npm install -g pixelmatch
```

Now we generate the diff between the two images.

```
pixelmatch image_v1.png image_v2.png diff.png 0.005 1
```

We see that quite many pixels have changed.

```bash
match: 10ms
different pixels: 26065
error: 14.44%
```

<img style="width: 49%;" src="/media/osm_bright_diff.png">
<img style="width: 49%;" src="/media/osm_bright_animation.gif">

## Requirements

```
npm install -g tl
```

## Download Version 1

Export the Mapbox API access token.

```bash
epxort MAPBOX_ACCESS_TOKEN="pk.eyJ1IjoibW9yZ..."
```

Now copy a section of your existing map `v1` to disk, in my case it is Zurich.

```bash
tl copy mapbox://morgenkaffee.9c069ced files://./tiles_v1
```

Now  make your changes.

Copy the changed tiles `v2` fagain.

```bash
tl copy mapbox://morgenkaffee.9c069ced files://./tiles_v2
```


## Compare the changes

Compare two images and write the output diff to a new file.

```bash
pixelmatch image_v1.png image_v2.png diff.png 0.005 1
```

Now we need to compare the changes between all tiles in the `tiles_v1`
folder with the tiles from `tiles_v2`.
Create the bash file `create_diffs.sh` and make it executable.

```bash
#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

readonly CWD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
readonly DIR_1=${$1%/}
readonly DIR_2=${$2%/}

readonly DIFF_DIR="$CWD/diff"
readonly THRESHOLD=${THRESHOLD:-0.005}
readonly ANTIALIASING=${ANTIALIASING:-1}

function create_diffs() {
    mkdir -p $DIFF_DIR

    # Metadata is needed to recreate a map out of the diffed tiles
    cp "$DIR_1/metadata.json" "$DIFF_DIR"

    local z_folder
    for z_folder in $DIR_1/*/; do
        local x_folder
        for x_folder in $z_folder*/; do
            local y_file
            for y_file in $x_folder*.png; do
                echo $y_file

                local y_name=$(basename "$y_file")
                local z_name=$(basename "$z_folder")
                local x_name=$(basename "$x_folder")

                local img1="$y_file"
                local img2="$DIR_2/$z_name/$x_name/$filename"
                local output="$DIFF_DIR/$z_name/$x_name/$filename"

                mkdir -p "$DIFF_DIR/$z_name/$x_name"

                pixelmatch "$src" "$dst" "$output" "$THRESHOLD" "$ANTIALIASING"
            done
        done
    done
}

create_diffs
```

You can now create diffs between two tile folders.

```bash
./create_diffs.sh tiles_1 tiles_2 diffs
```

If you want to fine tune the threshold or antialising you can do so with env vars.

```bash
THRESHOLD=0.01 ANTIALIASING=2 ./create_diffs.sh tiles_1 tiles_2 diffs
```

## Create new Raster Map out of diff tiles

Now we can create a new raster map out of the diff tiles.
Copy the tiles into MBTiles.

```bash
tl copy file://./diffs mbtiles://./diffs.mbtiles
```

Now you can serve the MBTiles yourself with tessera or upload it to Mapbox.

## Upload to Mapbox

Upload your raster MBTiles to Mapbox.

![Upload raster MBTiles to Mapbox](/media/mapbox_upload_file.png)

They should now appear in the *data* section

![Mapbox data view](/media/mapbox_data_view.png)

You can preview the raster MBTiles in your browser and look through all the
changes you made on all zoom levels.

### Diffs at zoom level 12

We can now detect the change from English labels to German labels where
the names were different and that all wood lands are rendered differently.
Streets appear to stay the same on zoom level 12 except the color
of the main roads (visible as yellow shade).

![Diffs of Zurich at zoom level 12](/media/zurich_diffs_at_z12.png)

### Diffs at zoom level 13

We can see that apart from the changes from zoom level 12 all roads
are much wider now.

![Diffs of Zurich at zoom level 13](/media/zurich_diffs_at_z13.png)

