---
layout: post
published: false
---

## A working prototype
I sat down and wrote a [working prototype](https://github.com/lukasmartinelli/cuckoodrive) for my cloud storage filesystem [idea](http://lukasmartinelli.ch/idea/2014/03/11/using-the-cloud-storages-as-one-big-encrypted-disk.html). One can test it by using local filesystems or a [PyFilesystem implementation](https://github.com/lukasmartinelli/fs-dropbox) for Dropbox.

I used the already described [architecture](http://lukasmartinelli.ch/python/2014/03/13/cuckoo-drive-architecture.html) and I am pretty happy with it. Using PyFilesystem saved me alot of time and made the task easier.

## One does not simply write a Distributed Filesystem
While writing the filesystem I found myself solving problems, that alot of people already are trying to solve with DFS