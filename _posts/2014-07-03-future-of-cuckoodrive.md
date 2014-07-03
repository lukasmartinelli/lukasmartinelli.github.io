---
layout: post
published: false
---

## A working prototype
I sat down and wrote a [working prototype](https://github.com/lukasmartinelli/cuckoodrive) for my cloud storage filesystem [idea](http://lukasmartinelli.ch/idea/2014/03/11/using-the-cloud-storages-as-one-big-encrypted-disk.html). One can test it by using local filesystems or a [PyFilesystem implementation](https://github.com/lukasmartinelli/fs-dropbox) for Dropbox.

I used the already described [architecture](http://lukasmartinelli.ch/python/2014/03/13/cuckoo-drive-architecture.html) and I am pretty happy with it. Using PyFilesystem saved me alot of time and made the task easier.

## One does not simply write a Distributed Filesystem
While writing the filesystem I found myself solving problems, that alot of people already are trying to solve (or have solved):
- caching
- encryption
- compression
- self-balancing
- failure-tolerant
- redundancy

I don't want to reinvent the wheel and write yet another DFS (a bit like "Don't write your own Crypto"). Writing fileystems is hard and I don't think I'm up to the task to do it. However, while hacking together the prototype I found many subproblems that have to be solved and they are also quite tricky.

### Managing the cloud storage credentials
This is a task that has to be done right. I have experimented with a "configuration file per host" approach and think that might do it. But there is alot more to it: One has to secure does credentials, one has to manage the OAuth tokens and one has to react when authentication fails.

### Writing PyFilesystem