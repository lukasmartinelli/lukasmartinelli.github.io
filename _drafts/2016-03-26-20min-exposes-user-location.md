---
layout: post
title: 20min exposes Location of Users
tags:
  - security
  - location
  - privacy
categories: web
published: true
---

In August 2015 the biggest Swiss daily newspaper [20 Minuten](http://www.20min.ch/) released
the new version of their app - which tracks your location and displays it on a map in real-time.
In this post we dig into the 20min app to check how well protected and anonymous the data really
is.

The app is one of the most popular ones in Switzerland with more than 3.6 million downloads
and where there is a real-time map like this, there is an API.
If you are a user I strongly recommend you uninstall the app
or disable it's tracking features.
I don't know what the status quo of 2016 regarding the app security is.
I wrote this post back in 2015 but hesitated to
publish it due to the amount of negative feedback I got
[last time I published a vulnerability](http://lukasmartinelli.ch/web/2014/11/17/php-dos-attack-revisited.html).


<img style="width: 49%;" src="/media/20min_social_view_2.png">
<img style="width: 49.5%;" src="/media/20min_social_view_1.png">

## Results

The good news first:

- The location is fuzzed but location fuzzing is a hard problem
- The id assigned to location tracks changes daily
- Users are somewhat anonymized because users have the same IDs some time

The bad news:

- You can probably track people over the course of the day given some initial metadata
- You can create tracking profiles for people living in remote locations

These are 10 million user locations recorded over the course of a week across Switzerland.
It is quite interesting to check which places have lot's of activity. You can even see patterns
as the people go to work during the day (where Zurich get's hyperactive) and in the
day where there is less buzz of activity at the workplace.

<iframe src="http://lukasmartinelli.ch/swiss-location/" frameborder="0" style="height:450px; width: 100%;"></iframe>
<br/>

![Top 10k readers and their paths across switzerland](/media/20min_user_paths.png)

## Gain Access to the Map API

[Setup a Wi-Fi access point on your machine](https://wiki.archlinux.org/index.php/Software_access_point) and
connect the device, pull up [Wireshark](https://www.wireshark.org/download.html) and start sniffing traffic.

Most traffic of 20min is plain HTTP, only a few calls use TLS.
A Google search for the app leads to a [blog post by Xilinus](http://blog.xilinus.com/post/61755872877/feedback-on-moment-suisse-project-for-20minch)
mentioning they create a map application for 20min and indeed the DNS records of Xilinus show up in Wireshark.

Now it was time to take a closer look at the source of the 20min app.
The [Android APK Extractor](https://play.google.com/store/apps/details?id=com.ext.ui) allows you to
extract an APK from your phone.  The APK can then be decompiled with the online
[Android APK Decompiler service](http://www.decompileandroid.com/).

A search for `xilinus` in the source quickly lead to the appropriate API calls.
In `/ch/iAgentur/i20Min/maps/GoogleMapCluster.java` the API call asking for the coordinates
of the users happens.

```java
aobj = String.format(
    Locale.ENGLISH, (
        "https://20min.xilinus.com/20min/_clusterize" +
        "?groupingDistance=%d&ne=%f,%f" +
        "&sw=%f,%f&withoutMarkerProperties=true" +
        "&zoom=%d&location=coordinates&property=marker:id"
    ), new Object[] {
        Integer.valueOf(GoogleMapConstants.mGroupingDistance),
        Double.valueOf(GoogleMapConstants.ne_lat),
        Double.valueOf(GoogleMapConstants.ne_lng),
        Double.valueOf(GoogleMapConstants.sw_lat),
        Double.valueOf(GoogleMapConstants.sw_lng),
        Integer.valueOf(GoogleMapConstants.mZoomLevel + 2)
    }
);
```

Calling this API prompted for [HTTP basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication).
A quick search through the source code and the user and password combination shows up
in `/ch/iAgentur/i20Min/dataloaders/AppMaptimizeDataLoader.java`.

```java
asynchttpclient = new AsyncHttpClient();
asynchttpclient.setBasicAuth("obviousUsername", "quiteShortPassword");
```

And now we were able to make API calls.

## Scrape user data

The API uses clustering to provide a good overview on large zoomout. To get the detailed user coordinates
one needs to set the `groupingDistance` of the clustering to `1` and choose a low enough bounding box
(the `ne_lat`, `ne_lng`, `sw_lat` and `sw_lng` parameters) and high enough zoom level.
Now the users are displayed as single coordinates.

To scrape all the user locations we need to divide Switzerland into a grid and
fetch the locations for this bounding box.

![Switzerland divided into tiles](/media/tiles_switzerland_small.png)

The Python script below produces one [GeoJSON](http://geojson.org/)
file every 5 minutes allowing us to track users over a longer time period.
In order to drill down on the tiles to a good zoom level we used the great mercantile library.

```python
def all_descendant_tiles(x, y, zoom, max_zoom):
    """Return all subtiles contained within a tile"""
    if zoom < max_zoom:
        for child_tile in mercantile.children(x, y, zoom):
            yield child_tile
            yield from all_descendant_tiles(child_tile.x, child_tile.y,
                                            child_tile.z, max_zoom)"

```

And to query only all tiles of a distinct zoom level.

```python
def min_resolution_tiles_switzerland():
    tiles = all_descendant_tiles(
        x=SWITZERLAND_TILE_INDEX[0],
        y=SWITZERLAND_TILE_INDEX[1],
        zoom=SWITZERLAND_TILE_INDEX[2],
        max_zoom=MIN_RESOLUTION_ZOOM
    )

    for tile in tiles:
        if tile.z == MIN_RESOLUTION_ZOOM:
            yield tile
```

And then fetch all points.

```python
def fetch_all_points_switzerland():
    for tile in min_resolution_tiles_switzerland():
        bounds = mercantile.bounds(tile.x, tile.y, tile.z)
        north_east = (bounds.north, bounds.east)
        south_west = (bounds.south, bounds.west)

        yield from fetch_points(north_east, south_west)
```

## Analyze data

The coordinates retunred by the API call look like this.

```json
{
    "id":"48873230-508B-4D6A-BC80-22CBEAF8568D",
    "count":1,
    "lat":46.47650077990443,
    "lng":6.2317510333502355,
    "sw_lat":46.47650077990443,
    "sw_lng":6.2317510333502355,
    "ne_lat":46.47650077990443,
    "ne_lng":6.2317510333502355
}
```

We immediately were surprised to see an `id` field in the data because 20min claimed they anonymize their
data. But if you backtrack the coordinates using the same `id` fields you get complete user
paths ranging over a time span of 6 hours in some cases.
This is really disturbing. The map shows the top 10k ids that had most connections.

Now we have had a large collection of geojson files that we need to dump into the database
for better analyzing.
Using ogr2ogr you can inmport GeoJSON files into PostGIS.
It is very important that you sepcify the correct projection (`EPSG:4326`).

```bash
for file in *.geojson; do
    ogr2ogr -f PostgreSQL \
            -nln reader_location \
            -t_srs EPSG:4326 \
            -append \
	    PG:'user=osm password=osm host=localhost dbname=osm' \
            $file
done
```

And now do some queries.
Get top 10k users and their paths.

```sql
/* Add paths */
```

## Visualize Data

We will be using [Mapbox and it's Postgis integration](https://www.mapbox.com/guides/postgis-manual/)
to query the data and display it.

## Query Data

Check how long one ID has been tracked.

```sql
select id, count(id) as occurrence, (max(timestamp::timestamp) - min(timestamp::timestamp)) as tracked_time from reader_location group by id order by 2 d
esc limit 10
```

Make Linestring of data

```sql
( SELECT timestamp::date::text as day,
 ST_MakeLine(wkb_geometry ORDER BY timestamp::timestamp) AS wkb_geometry
 FROM reader_location WHERE id = '60'
 GROUP BY 1 
) AS data

```
