---
layout: post
title: Future of Cuckoo Drive
published: true
tags: 
  - idea
  - cloud
categories: idea
---

Even though I have a working prototype for my [cloud storage filesystem](http://lukasmartinelli.ch/idea/2014/03/11/using-the-cloud-storages-as-one-big-encrypted-disk.html), I don't want to write yet another Distributed File System. Instead I could help others doing so, by providing a common API to consumer cloud providers.

## A working prototype
I sat down and wrote a working
[prototype](https://github.com/lukasmartinelli/cuckoodrive)
for my cloud storage filesystem
[idea](http://lukasmartinelli.ch/idea/2014/03/11/using-the-cloud-storages-as-on
e-big-encrypted-disk.html). One can test it by using local filesystems or a
[PyFilesystem implementation](https://github.com/lukasmartinelli/fs-dropbox)
for Dropbox.

I used the already described
[architecture](http://lukasmartinelli.ch/python/2014/03/13/cuckoo-drive-archite
cture.html) and I am pretty happy with it. Using PyFilesystem saved me a lot of
time and made the task easier.

### One does not simply write a Distributed Filesystem
While writing the filesystem I found myself solving problems, that a lot of
people already are trying to solve (or have solved) like caching, encryption,
compression and redundancy.

I don't want to reinvent the wheel and write yet another DFS (a bit like "Don't
write your own Crypto"). Writing fileystems is hard and I don't think I'm up to
the task to do it. However, while hacking together the prototype I found many
subproblems that have to be solved and they are also quite tricky.

![One does not simply write a Distributed Filesystem](/media/one-does-not-simply-write-a-dfs.jpg)

### Writing PyFilesystem Implementations for Cloud Storage Providers
My current approach was writing a PyFilesystem implementation for each cloud
storage provider. This is quite a tedious task and a bit repetitive as most
of the cloud storages are not suited for implementing a filesystem directly
(e.g. no concept of a filesystem path). But there was the nice side effect of
providing a common API to all those cloud storages.

## Providing one API to rule them all
So I searched the web and only found a solution ([Apache
Libcloud](http://libcloud.apache.org/)) that provides a common API to
commercial cloud storages (like Amazon or Rackspace). What is missing is a
common API to end user cloud storages (like Dropbox, Google Drive, Box.net
and all those). If I would provide such an API, the developers of those
Distributed Fileystems could integrate it and actually create my [Cuckoo
Drive](http://lukasmartinelli.ch/idea/2014/03/11/using-the-cloud-storages-as-on
e-big-encrypted-disk.html) by themselves.
I want to make it possible for Projects like [Bazil](http://bazil.org/) to do
their thing worrying about implementing cloud storage adapters. I already have
some knowledge of the various cloud storage APIs but there is definitely more
research to be done.