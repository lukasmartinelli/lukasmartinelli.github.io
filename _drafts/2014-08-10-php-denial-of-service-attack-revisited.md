---
layout: post
title: PHP Denial of Service Attack Revisited
tags:
  - security
  - php
  - dos
categories: security
published: false
---
In 2011 the Chaos Computer Club reveiled a major complexity attack vulnerability.
that works across all major languages.
After that many languages fixed the problem by randomizing the hash function or
passing the problem further to the web frameworks.


PHP addressed this vulnerability by introducing a `max_input_vars` directive in the `php.ini` config filei - by default this is set to 1000, so you cannot send more than a
thousand form fields in one request. A thousand collisions are not that bad, in fact
it only ratio of 1:3 compared to a normal request.

However as the web evolved to a net of APIs we are perhaps forgetting that PHP
still is vulnerable to Hash Collision attacks everywhere where user input and an array
is used.

Web APIs typically support JSON and therefor use the `json_decode` method of the standard
PHP library. This will by default parse all the Keys in a JSON file into the PHP map,
causing many insertion collisions.


![CPU usage during the tests](/media/cpu_hash_collision.png)


..more

PHP stores all `POST` fields in the `$POST` map.

<iframe height=940 width=1920 src="//docs.google.com/a/lukasmartinelli.ch/spreadsheets/d/1cSUBZb9jHSsXjHkmhxA7FatiB6GRsdMZB87m6x4jvIE/gviz/chartiframe?oid=2126819715" seamless frameborder=0 scrolling=no></iframe>

<iframe height=940 width=1920 src="//docs.google.com/a/lukasmartinelli.ch/spreadsheets/d/1JN3MTzPXyQlV2lwh1-ltIzs6OhCjVA1r1oYA4-z8JQo/gviz/chartiframe?oid=1521835348" seamless frameborder=0 scrolling=no></iframe>
