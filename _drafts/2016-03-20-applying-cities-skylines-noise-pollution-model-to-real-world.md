---
layout: post
title: Applying Cities Skyline Noise pollution model to the Real world
published: true
tags:
  - cartography
categories: gis
---

I am not a huge gamer but I really do like [Cities Skylines](https://en.wikipedia.org/wiki/Cities:_Skylines)
which is an awesome city building simulation.

Cities skylines has the [concept of noise pollution](http://www.skylineswiki.com/Pollution#Noise_pollution)
affecting the value of properties. Something that exists in the real world as well.
We want to apply this simple model to the real world for fun.

## Noise Pollution Model in Cities Skylines

> Roads, industry, commercial zones, and various buildings (such as power plants and unique buildings) cause sound pollution.
  A high level of noise pollution reduces land value and citizen happiness.

Roads with high traffic cause a lot of pollution, as do commercial zones and industrial zones.

![Cities Skylines Noise pollution](http://www.skylineswiki.com/images/2/2d/Noise_Pollution_Info_View_SS.png)

In this image you can see quite well how heavy traffic roads
and commercial buildings on the left have a big noise pollution impact

![](http://s3.amazonaws.com/simnation-articles/article_assets/137/images/content_sound_pollution.jpg)

## Apply to the real world

For each road which is a highway or primary or secondary road system we emit a certain radius of noise pollution
that decreases. We cannot easily do the levelling pollution spread that cities skylines does but we instead work
with different levels of noise.

For example a highway has a

- 50m radius of strong noise
- 100m radius of medium noise
- 200m radius of weak noise

A commercial building emits

- 5m radius of strong noise
- 10m radius of medium noise
- 20m radius of weak noise

## Apply to the real world

First we need to get some real world data. OSM is one of the best things to get geospatil
data about the real world. I've grown to love it more and more.

Can we do global coverage? Yes we can.

After we import the OSM dataset.
