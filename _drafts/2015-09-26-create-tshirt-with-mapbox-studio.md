---
layout: post
title: Create a T-Shirt with Mapbox Studio
published: true
tags:
  - idea
  - cartography
  - geojson
  - mapbox
categories: gis
---

In summer of 2015 a good friend and I did a biketour from Switzerland to Greece across the Balkan states.
The entire tour was GPS tracked and as a special memory of this experience I wanted to build a T-shirt of
our journey.

## Result

On the left you see the scaled down export from [Mapbox Studio](https://www.mapbox.com/mapbox-studio-classic)
and on the right the printed T-shirt in comparison.
The print quality is surprisingly good. The colors don't match exactly though.

<img style="width: 49%;" src="/media/biketour_tshirt_export_small.png">
<img style="width: 50%;" src="/media/biketour_shirt_small.jpg">

## Key Takeaways

- Export in the highest possible resolution
- Choose few colors
- Make the map transparent
- Optimize the map for one zoom level
- Choose a thick T-shirt

## Tutorial

### Choose a good Base Map

You don't want too many features printed on your chest. Choose a base map with good contrast
and customize it to show only the features you want.
Especially the stylistic base maps will probably yield good results while anything with
height textures and satellites images will be more difficult.

![Mapbox good basemaps for T-shirts](/media/mapbox_good_basemap_tshirt.png)

In my case I chose a completly different basemap based on the
[Mapbox Geography Class Example](https://www.mapbox.com/blog/customizing-geography-class/).
You can clone the Mapbox Studio project repository from [here](https://github.com/klokantech/vector-tiles-sample).

### Create a custom source

Create a new source and import your data. You can import GPX traces or in my case
I used [GeoJson](http://geojson.org/) files.
Just make sure you have enough attributes to style the data later.

![Custom source](/media/mapbox_studio_custom_source.png)

In the style project you now have to combine the two source.
In `Layers > Change Source` enter the Mapbox id of your basemap layer followed
by the id of your custom source layer.

![](/media/mapbox_multiple_sources.png)

In your style projects you should now see the layers of both sources.

## Adapt Styles

Now start customizing your map styles.
You should remove any clutter on the map you don't want to see.

[CartoCSS supports filters](https://www.mapbox.com/guides/cartocss-in-studio/#text-comparison-filters)
to explicitely hide or show feature layers.


In my case I only wanted to show countries I actually travelled and wanted to hide a few labels.

```css
#country-name {
    text-face-name: @sans_bold;
    text-fill: #6161b9;
    text-size: 16;
    text-name: ''; // Hide the label by default

    [ADM0_A3='CHE'] { text-name: [NAME]; }
    [ADM0_A3='ITA'] { text-name: [NAME]; }}
}
```

Because you are optimizing for a single zoom level to export an image
you can optimize the position of the labels by hand.

```css
[ADM0_A3='GRC'] {
    text-dy: -18;
    text-dx: -23;
}
```

I also wanted to show my track. Make it thick enough and in a color that it
is visible.

```css
#track {
    line-color: #d92e26;
    line-width: 4;
    line-join: round;
    line-cap: round;
}
```

And I also wanted to display all places we camped.

```css
#timeline[marker-symbol='campsite'] {
    marker-file: url(maki/campsite.svg);
    marker-fill: #810e09;
    marker-width: 25;
    marker-allow-overlap: true;
}
```

### Export image

Now you need to [export a image](https://www.mapbox.com/blog/high-res-prints-from-mapbox-studio/).
Choose the highest possible resolution `600ppi` and the `PNG` format.

![Mapbox good basemaps for T-shirts](/media/mapbox_export.png)


### Post Processing with GIMP / Photoshop

Now make sure that your map edges are transparent (which will yield better results).
In my case I [chose white as the base layer color and then replaced white with an alpha
channel](http://docs.gimp.org/en/plug-in-colortoalpha.html).
If your map is transparent it will also be possible to print it on different
T-shirt colors.

### Create the T-shirt

Alot of parameters depend on your T-shirt manufacturer.
Most online printing services allow you to upload a high resolution image
and preview the result in the browser.

Now find a T-shirt printing service and upload your image.


I used mc-shirt but this is because I was limited to order from Switzerland.
I am sure there are much better services, just do a quick google search.

<img style="width: 53%;" src="/media/mcshirt_create_with_map.png" alt="Shirt editor preview">
<img style="width: 46%;" src="/media//real_shirt.jpg" alt="Real shirt">

### Collect the Data

I used the free and open source [GPSLogger for Android](http://code.mendhak.com/gpslogger/)
to record GPX traces of the tour and update an API endpoint so my friends and family
could follow me during the tour.

http://biketour.lukasmartinelli.ch/

I also pulled in my tweets and displayed them on the map through Twitter's location API.
While a webmap is a cool thing, I wanted to create something more memorable out of it.
And just printing the webmap on a t-shirt would not cut it.

![Biketour Webmap](/media/biketour_webmap.png)

## Choose a baselayer

You don't want to meany features on a T-Shirt. Good styles to start from are black and white
or have single colors. In my case I took the tilemill geography example.

## Import the Data
