---
layout: post
title: Github Realtime Relay with Nodejs 
tags: 
  - node 
  - web 
  - api 
  - realtime
categories: web
published: false
---

Github provides a public stream api. 

Twitter provides developers with good options regarding realtime applications
with it's realtime streaming API.
Github only provides a plain HTTP api. This means as a developer you have to
poll to get all the latest application updates and you also have to deal
with things like cache invalidation and duplicates in the events.

To make this easier and save you API calls I created open github realtime
relay. A service that polls for you and broadcasts the emit via socket.io
in realtime to your application.

The code is a very simple node application that just pool periodically 
removes the duplicates and streams the events to you.

We also allow CORS headers so that you can connect from any web app
and so easily create new services wihtout having a service

An example of such an application is the management console itself.


Very simple connect example:

```javascript

```

