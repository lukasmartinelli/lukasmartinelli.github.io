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
that works across all major languages. PHP addressed the vulnerability
for forms but nowadays every web application uses a JSON API, which is still
vulnerable to complexity attacks.


## How it works

[Hash Tables](https://en.wikipedia.org/wiki/Hash_table) are optimized to be
very fast in the average case. But if someone inserts keys
that all collide with each other, we suddenly get really bad performance.

Operation  | Average Case | Worst Case
-----------|--------------|------------
**search** | `O(1)`       | `O(n²)`
**insert** | `O(1)`       | `O(n²)`
**delete** | `O(1)`       | `O(n²)`

If the hash table implementation uses open addressing, a colliding key
is checked against all elements in the linked list (to see whether the key
is a duplicate).

This means that if you insert `n` elements you check
`(n-1) * (n-2)/2` elements in the linked list which is a complexity
of `O(n²)`

<img style="max-width:350px" src="/media/hash-collisions.gif" alt="Hash Collisions animation" />

If you want to know more about how this works in PHP you should definitely read
[this very informative blog post](http://nikic.github.io/2011/12/28/Supercolliding-a-PHP-array.html).

## Using POST data as attack

PHP stores all POST fields in the $POST map.

```php
<?php echo $_POST ["param"]; ?>
```

If you send a POST request like below to the above PHP page, you will already cause `5` collisions. If you send `2^16` keys you will keep an i7 core busy
for 30 seconds.

```bash
curl --data "4vq=key1&4wP2=key2&5Uq=key3&5VP=key4&64q=key5" http://example.com/form.php
```

While in most languages (e.g [Python](http://bugs.python.org/issue13703) the hash function has been modified accordingly to prevent such attacks, PHP [addressed this vulnerability](http://svn.php.net/viewvc?view=revision&revision=321038)
by introducing a `max_input_vars` directive in the `php.ini` config file.

By default this directive is set to 1000, so you cannot send more than a
thousand form fields in one request. A thousand collisions are not that bad, in fact it is only a slowdown of 1:3 compared to a normal request.

## Using JSON APIs as attack

As the web evolved to a net of APIs we are perhaps forgetting that PHP
is still vulnerable to Hash Collision attacks everywhere where user input and an array is used.

Web APIs typically support JSON and therefor use the `json_decode` method of the standard PHP library. This will by default parse all the Keys in a JSON file into the PHP map, causing many insertion collisions.

Below is a very simple API that returns the name and email of the
sender.

```php
<?php
header('Content-Type: application/json');
$body = file_get_contents('php://input');
$params = json_decode($body);
$response = array('name' => $params->{'name'}, 'email' => $params->{'email'});
echo json_encode($response);
?>
```

If we send this API a rigged JSON request, we have the same effect
as with the POST parameters.

```bash
curl -v -X POST \
-H "Accept: application/json" \
-H "Content-type: application/json" \
-d '{"4vq":"key1", "4wP2":"key2", "5Uq":"key3", "5VP":"key4", "64q":"key5" }' \
 http://example.com/api.php
```

This is a [known vulnerability](https://web.nvd.nist.gov/view/vuln/detail?vulnId=CVE-2009-1271) but has not been fixed until today!

## Tests

I plotted the time used for `json_decode` and it gives you a nice quadratic
function. The outliers happening after `2^16` keys are happening because
a different hash mask is when the array grows beyond 2^16 elements and our
collisions are precomputed for a 16Bit hash mask.

![CPU usage during the tests](/media/json_decode_time.png)

If we host the `api.php` on a real server and make some attacks, we can
see that you get the same effect with a JSON api. The plateau of the function occurs because the webserver is limited to 30s max proccessing time per request.

![CPU usage during the tests](/media/api_time.png)

I ran a test on AWS with one attacker (blue) and one victim (yellow) and made
a screenshot of the CPU usage.
You see that while the attacker barely does anything apart from sending the post requests the victims capability to serve webpages is affected.

![CPU usage during the tests](/media/cpu_hash_collision.png)

## Try it yourself

I put everything on the Github repo:
https://bitbucket.org/the_hash_crowd/php-dos-attack

