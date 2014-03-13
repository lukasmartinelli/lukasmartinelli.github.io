---
layout: post
published: false
---


## Cuckoo Drive
My initial idea is to act as if the cloud storages are normal filesystems. To realize that I have to write an implementation against a filesystem interface, that uses the APIs of the various Cloud Storages. Because we act as if the cloud storages are filesystems we have many tools and possibilities that can help us and that already exist (take rsync as an example).
These drives are combined into one big superdrive (which is basically the concept of a distributed filesystem). We now have abstracted the problem of distributing the files across the cloud systems to a very general problem of distributing files of a drive across other drives. There might be already a solution for that and if I have to write it myself, it is easy testable, understandable and perhaps even applicable to other scenarios. The whole part of implementing clouds as drives and combining them into a distributed filesystem is the Cuckoo Drive.

## Cuckoo Sync

Now my first thought was to write directly to this filesystem and write a fuse implementation. The advantage is that you don't need the space that used by the distributed filesystem on your machine as well. When you access a file it is actually fetched via the network. The downside is, that this will get a pretty complicated task.
The other idea is, that the user can simply select folders he wants to have in the Cuckoo Drive. The Cuckoo Sync then takes care of synchronizing them automatically with the distributed filesystem and also allows to restore previous versions from that filesystem. The synchronizing process simple takes care of how to version the files and how to sync them, the task of distributing the files is completly abstracted by Cuckoo Drive.
