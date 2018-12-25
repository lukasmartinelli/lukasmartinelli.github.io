---
layout: default
category: project
title: redis-pipe
tags: golang, redis, cli
github_repo: lukasmartinelli/redis-pipe
order: 50
popular: no
---

**redis-pipe** allows you to treat [Redis Lists](http://redis.io/topics/data-types#lists) as if they were [Unix pipes](https://en.wikipedia.org/wiki/Pipeline_%28Unix%29). It basically connects `stdin` and `stdout` with `LPUSH` and `LPOP`.
