---
layout: post
title: PHP Denial of Service Attack Revisited
tags:
  - security
  - php
  - dos
categories: web
published: true
---
In 2011 the Chaos Computer Club [revealed a major complexity attack vulnerability](http://events.ccc.de/congress/2011/Fahrplan/attachments/2007_28C3_Effective_DoS_on_web_application_platforms.pdf)
that works across all major languages. PHP addressed the vunlerability
for forms but nowadays every web application uses a JSON API, which is still
vulnerable to complexity attacks.

There is already a nice article written about [how to do that in PHP](http://nikic.github.io/2011/12/28/Supercolliding-a-PHP-array.html).

PHP [addressed this vulnerability](http://svn.php.net/viewvc?view=revision&revision=321038)
by introducing a `max_input_vars` directive in the `php.ini` config file - by default this is set to 1000, so you cannot send more than a
thousand form fields in one request. A thousand collisions are not that bad, in fact
it only ratio of 1:3 compared to a normal request.

However as the web evolved to a net of APIs we are perhaps forgetting that PHP
is still vulnerable to Hash Collision attacks everywhere where user input and an array
is used.

Web APIs typically support JSON and therefor use the `json_decode` method of the standard
PHP library. This will by default parse all the Keys in a JSON file into the PHP map,
causing many insertion collisions.

![CPU usage during the tests](/media/cpu_hash_collision.png)


..more

PHP stores all `POST` fields in the `$POST` map.
![CPU usage during the tests](/media/json_decode_time.png)
![CPU usage during the tests](/media/api_time.png)
