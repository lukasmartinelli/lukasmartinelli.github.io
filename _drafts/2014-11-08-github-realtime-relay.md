---
layout: post
title: Github Realtime Relay Introduction
tags:
  - node
  - web
  - api
  - realtime
  - github
categories: web
published: false
---

Receive all GitHub events close to realtime with [socket.io](http://socket.io/) from the [Github Realtime Relay](http://ghrr.gq).

Building realtime applications on top of GitHub is kind of a pain
because GitHub only provides a plain HTTP API it's public events.
This is why I built the [GitHub Realtime Relay (GHRR)](http://ghrr.gq)
which polls all public events and then relays them directly via websockets.

This is probably the simplest way to create a realtime application on top of Github.

Head over to [GitHub](https://github.com/lukasmartinelli/ghrr) for instructions
how to use http://ghrr.gq or continue reading.

## Usage Example

To get started all you need is an HTML file.
We pull in the socket.io-client library and listen for events
of type [PushEvent](https://developer.github.com/v3/activity/events/types/#pushevent) and append them to a list.

![Screenshot of static website listening on GHRR socket](/media/screenshot_ghhr_static_site.png)


```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Github Events</title>
    <script src="http://cdn.jsdelivr.net/socket.io-client/1.2.0/socket.io.js"></script>
    <script>
      var url = 'http://ghrr.gq:80/events';
      var socket = io(url);
      socket.on('pushevent', function(event) {
        var logItem = '<li>' + event.actor.login + 'pushed code to ' + event.repo.name + '</li>';
        document.getElementById("eventlog").innerHTML += logItem;
      });
    </script>
  </head>
  <body>
    <ul id="eventlog"></ul>
  </body>
</html>
```

And that's it. Because we support [CORS](http://www.html5rocks.com/en/tutorials/cors/) you are able to access the public websocket from anywhere.
