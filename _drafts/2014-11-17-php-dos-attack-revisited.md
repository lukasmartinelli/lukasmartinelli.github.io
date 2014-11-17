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
is checked against all elements in the linked list.
If you insert `n` elements you check `1+2+3+..+(n-1)` elements for equality
(a complexity of `O(n²)`).

<img style="max-width:350px" src="/media/hash-collisions.gif" alt="Hash Collisions animation" />

If you want to know more about how this works in PHP you should definitely read
[this informative blog post](http://nikic.github.io/2011/12/28/Supercolliding-a-PHP-array.html).

## Using POST data as attack

PHP stores all POST fields in the `$POST` map for easy access.

```php
<?php echo $_POST ["param"]; ?>
```

The POST request below targeted at the PHP page above, will cause `5` collisions. 
If you send `2^16` keys you keep an i7 core busy for 30 seconds.

```bash
curl --data "4vq=key1&4wP2=key2&5Uq=key3&5VP=key4&64q=key5" http://localhost:8080/index.php
```

While in some languages (e.g [Python](http://bugs.python.org/issue13703)) the hash function has been modified accordingly to prevent such attacks, PHP [addressed this vulnerability](http://svn.php.net/viewvc?view=revision&revision=321038)
by simply introducing a `max_input_vars` directive in the `php.ini` config file.

By default this directive is set to 1000, which means that you cannot send more than a thousand form fields in one request. A thousand collisions is not really a problem because it is only a slowdown of 1:3 compared to a normal request.

## Using JSON APIs as attack

As the web evolved to a net of APIs we are perhaps forgetting that PHP
is still vulnerable to Hash Collision attacks everywhere where user input and an array is used.

Web APIs typically support JSON and therefore use the `json_decode` method of the standard PHP library. This will by default parse all the keys in a JSON file into the PHP map, causing many collisions.

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

If we send this API a modified JSON request, we have the same effect
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

I plotted the time used for `json_decode` and it results in a scary quadratic
function. The outliers happening after `2^16` keys are happening because
a different hash mask is when the array grows beyond `2^16` elements and our
collisions are precomputed to cause collisions for a 16 Bit hash mask.

![CPU usage during the tests](/media/json_decode_time.png)

If we host the JSON API sample above on a real server and make some attacks, we get the same effect.
The plateau of the function occurs because the Apache webserver is limited to 30s proccessing time per request.

![CPU usage during the tests](/media/api_time.png)

I ran a test on AWS with one attacker (blue) and one victim (yellow) and made
a screenshot of the CPU usage.
You see that while the attacker barely does anything apart from sending the post requests the victims capability to serve webpages is affected.

![CPU usage during the tests](/media/cpu_hash_collision.png)

### Other potential attack vectors

It is interesting that parsing xml does not use a hash map internally.

Operation for 2^16 elements  | Average Case [s]| Worst Case [s]
-----------------------------|-----------------|---------------
Insert into array            | 0.0239019393920 | 37.62498283386
Deserializing JSON           | 0.0125000476837 | 36.51837182045
Deserializing PHP Object     | 0.0123610496521 | 30.02556109428
Parsing XML                  | 0.0004470348358 | 0.000726938247

I am sure there are alot of other cases where user data is used together with a hash table.

## Try it yourself

I put the testing scripts and sample pages into a github repository.
I even added a few thousand self colliding keys.

[https://github.com/lukasmartinelli/php-dos-attack](https://github.com/lukasmartinelli/php-dos-attack)