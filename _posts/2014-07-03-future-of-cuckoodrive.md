---
layout: post
title: Future of Cuckoo Drive
published: true
hidden: true
tags:
  - idea
  - cloud
categories: idea
---

Even though I have a working prototype for my [cloud storage filesystem](http://lukasmartinelli.ch/idea/2014/03/11/using-the-cloud-storages-as-one-big-encrypted-disk.html), I don't want to write yet another [Distributed File System](http://en.wikipedia.org/wiki/Clustered_file_system#Distributed_file_systems). Instead I could help others doing so, by providing a common API to consumer cloud providers.

## A working prototype
I sat down and wrote a working
[prototype](https://github.com/lukasmartinelli/cuckoodrive)
for my [distributed file system for cloud idea](http://lukasmartinelli.ch/idea/2014/03/11/using-the-cloud-storages-as-one-big-encrypted-disk.html). One can test it by using local filesystems or a PyFilesystem  [implementation](https://github.com/lukasmartinelli/fs-dropbox) for Dropbox. There is also [an article on wikipedia](https://en.wikipedia.org/wiki/Distributed_file_system_for_cloud) that explains what a distributed file system for cloud is.

I used the already described [architecture](http://lukasmartinelli.ch/python/2014/03/13/cuckoo-drive-architecture.html) and I am pretty happy with it. Using PyFilesystem saved me a lot of
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
My current approach was writing a [PyFilesystem implementation](http://docs.pyfilesystem.org/en/latest/implementersguide.html) for each cloud
storage provider. This is quite a tedious task and a bit repetitive as most
of the cloud storages have similar concepts but use different APIs to express them.
There is also some work to do, to work around the fact that providers like Google Drive have no idea what a path or a file is, they work more like a Key-Value store for documents.

But there was the nice side effect of providing a **common API** to all those cloud storages, even though some features got lost or had to be emulated.

## Providing one API to rule them all
So I searched the web for a project that provides one common API for most of the cloud storage providers. 

[**SharpBox**](http://sharpbox.codeplex.com/)
They have exactly the same goal as I described: They want the programmer to write the cloud storage access code only once and support multiple providers.
This seems like a very cool project, altough limited to the .NET platform. They might be trying to do too much by also abstracting a Key-Value store.
Sadly they only support a few storage providers (without GoogleDrive).

[**Apache Libcloud**](http://libcloud.apache.org/)
This project is more oriented towards Cloud integration in common (like controlling virtual machines) but provide a storage API along the way. But the target providers are all commercial cloud storages (like Amazon or Rackspace) for businesses.

[**Storage Made Easy**](http://storagemadeeasy.com/personal_solution/)
This is actually a bit like my initial proposal of Cuckoo Drive but is "an entry point to multiple clouds". Sadly this is not Opensource and you have to pay for the software.

[**Cloud Elements Documents Hub**](http://www.cloud-elements.com/hubs/documents-hub/)
I found this a bit later and it is exactly what we need. But it is not open source and it is not free (one has to [pay](http://www.cloud-elements.com/pricing/) for serious use). It will cost you $250 per month with 100 active accounts and then $0.50 per additional user (while you can only connect to 3 cloud providers). Sometimes I feel like every good idea is already monetized.

![Cloud Elements Documents Hub Diagram](/media/documents_hub.png)

[**Kloudless**](https://developers.kloudless.com/)
Integrates more providers than cloud Elements and is focused primarily on cloud storages. You pay $5 to $10 per 10k requests depending on your workload. It includes 10GB bandwidth after which $0.25 is charged per GB. They currently support 9 storage providers (Box, Bitcasa, ShareFile, OneDrive, GoogleDrive, Dropbox, SugarSync, Egnyte, Copy). This seems like the best solution that provides a common API.

**What is missing?**
What is missing is a **common API to end user cloud storages** (like Dropbox, Google Drive, Box.net and all those) that is **opensource and free**.

If I would provide such an API, the developers of those
Distributed Fileystems could integrate it and actually create my [Cuckoo
Drive](http://lukasmartinelli.ch/idea/2014/03/11/using-the-cloud-storages-as-on
e-big-encrypted-disk.html) by themselves.
I want to make it possible for Projects like [Bazil](http://bazil.org/) or [Syncany](https://www.syncany.org/) to do
their thing without worrying about implementing cloud sto
rage adapters. I already have some knowledge of the various cloud storage APIs but there is definitely more
research to be done.

## Cuckoo Drive and similar Projects
While doing research for this project, I encountered something called "Project Hydra" from 2012, which had the same goal as Cuckoo Drive but failed. The man behind it made some very informative blog posts:

- [http://codecrafter.wordpress.com/2012/09/01/14-cloud-storage-services-and-apis/](http://codecrafter.wordpress.com/2012/09/01/14-cloud-storage-services-and-apis/)
- [http://codecrafter.wordpress.com/2012/09/02/cloud-storage-aggregators/](http://codecrafter.wordpress.com/2012/09/02/cloud-storage-aggregators/)

The most promising project at the moment seems to be [Syncany](https://www.syncany.org/). Their website looks awesome and there are quite a few people working on it.
