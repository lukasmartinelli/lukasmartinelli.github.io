---
layout: post
title: Using several Cloud Storages as one big encrypted Disk
published: true
tags: 
  - idea
  - productivity
  - cloud
  - encryption
categories: idea
---

There are many cloud storages that give you an initial free capacity to store data. After that, if you want more space you have to pay for it. It  is convenient to store all your data at the same cloud storage for the ease of access. But then your hitting the free space limit pretty quickly and you start paying.

## Existing cloud aggregators

There are some great cloud aggregators out there (like [Otixo](https://www.otixo.com/ "Otixo Cloud Aggregator") or [Jolidrive](http://www.jolicloud.com/ "Jolidrive Cloud Aggregator") that solve this problem by providing a common interface for all the different cloud storages and provide tools to interact between them. This is actually a great solution but has a few disadvantages:
- You have to trust the cloud aggregator
- Your data is unencrypted
- You have to move around the data to fully use your free limits
- You have to pay for them

I did a quick web research and found nothing that is both free of charge and secure.

## Usage Examples
Let's say you want to store all your backups in the cloud, because you want to follow 
the ["The Computer Backup Rule of Three"](http://www.hanselman.com/blog/TheComputerBackupRuleOfThree.aspx). You will hit the limit pretty soon and you have to start moving your files around different providers, create a new account for one provider an put your archive there and alot of other tricks. You also have to care about encryption and redundancy (Store backups at two different cloud storages) yourself. 

## Solution
The Cuckoo Drive is like a block device and acts as a normal drive for the user. He can store files and folders in it without having to worry where and how it will be saved. The data is then taken by the Cucko Sync Process and splitted into many small pieces, these pieces are encrypted and only the user can decrypt them. The Sync Process then uploads those pieces into the various cloud storages. You can easily add features like redundancy to store the pieces in multiple storages at the same time, giving you a download speed and data security advantage if a storage provider goes down. 
![Cuckoo Drive Concept](/media/cuckoodrive_concept.png)

Now I'm amazed that there is no solution like this out there, but perhaps there is and I haven't found it.

**Update**
I found an [article](http://www.pcworld.com/article/2037131/supersize-your-free-cloud-storage-to-100gb-or-more.html "Supersize your free cloud storage to 100GB or more") that was published a little earlier that explains the idea even better.

## Additional remarks

**Account Creation Wizard**
A wizard that creates accounts for all known storage providers. You get a huge amount of free storage without the hassle of registering for all the sites yourself.

**Dynamically change amount of allocated space**
You can set a fixed amount of space that should be reserved for Cuckoo Drive on the cloud storage provider. This allows you to have space for your documents or shared folders on Dropbox and use it for Cuckoo Drive as well.

**Synchronized folders or block device**
One could also use a folder on the system, that is then kept up to date by the Cucko Sync process instead of using a device mapper.

**Not a trivial application**
To write such an application is not such a trivial task. One has to take alot of factors into account, care about data integrity and know alot about encryption.

**About the name**
I thought of a Cuckoo that lays his eggs into foreign nests, except the eggs are protected by a very hard shell (encryption) that can't be broken.