---
layout: post
published: false
---

## A New Post

The 'PartedFS' is the first abstraction level that splits big files into multiple small ones. This is a very essential functionality to effectively distribute the files on many providers.

If we have the following folder structure with quite big backup files of let's say a photo collection that was growing over the year and wan't to store it on multiple cloud providers but they each only allow a maximum size of 100MB per file.

The PartedFS will always split files into parts of maximum 100MB. 
```
`-- backups  
        |-- older
        |   |-- backup-2012.zip (80MB)
        |   `-- backup-2013.zip (150MB)
        `-- current_year
            `-- backup-2014.zip (300MB)
```
This folder structure will translate into
```
`-- backups  
        |-- older
        |   |-- backup-2012.zip.part0 (80MB)
        |   |-- backup-2013.zip.part0 (100MB)
        |   `-- backup-2013.zip.part1 (50MB)
        `-- current_year
            |-- backup-2014.zip.part0 (100MB)
            |-- backup-2014.zip.part1 (100MB)
            `-- backup-2014.zip.part2 (100MB)
```
So all directories will remain unchanged but every file path will at least translate into a '.part0' file.
Now one thought was to leave the file as it is and not appending a .part extension if it is small enough. However it is much easier just treating them always as part because what if a once small file get's bigger then the max part size, we would need to handle that separatly.

### Fileobject implementation
The file has an internal pointer that moves along with the write, read and seek commands. This pointer always points to the next byte that is relevant for an operation. So if you open a new file it's position will be 0. Then if you write 10 Bytes it will be 10. And if you seek again to the start and read 5 bytes it will be 5. 

