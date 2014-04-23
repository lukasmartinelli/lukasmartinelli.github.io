---
layout: post
published: false
---

## A New Post

The 'PartedFS' is a virtual filesystem that splits big files into multiple small ones. This is a very essential functionality to effectively distribute big files evenly among many providers.

Let's assume we have the following folder structure with backup files of a photo collection:
```
`-- backups  
        |-- older
        |   |-- backup-2012.zip (80MB)
        |   `-- backup-2013.zip (150MB)
        `-- current_year
            `-- backup-2014.zip (300MB)
```
Now we want to store those files on multiple cloud providers but they each only allow a maximum size of 100MB per file then we can configure PartedFS to always split files into parts (with maximum size of 100MB) if the file is bigger than the 100MB.

The folder structure mentioned above will translate into:
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

### Path translation
  - Directory paths will always remain unchanged.
  - Every file path will at least be translated into a '.part0' file

Reason for always appending the '.part0' extension:
It is much easier to treat all files the same, whether they are big enough to split or not. Otherwise we would have a different path translation for big and small files.
It would also mean, that if a small file grows big enough or a big file would shrink enough, it would have to be renamed.

All directories will remain unchanged but every file path will at least translate into a '.part0' file.
Now one thought was to leave the file as it is and not appending a .part extension if it is small enough. However it is much easier just treating them always as part because what if a once small file get's bigger then the max part size, we would need to handle that separatly.

### Fileobject implementation
The file has an internal pointer that moves along with the write, read and seek commands. This pointer always points to the next byte that is relevant for an operation. So if you open a new file it's position will be 0. Then if you write 10 Bytes it will be 10. And if you seek again to the start and read 5 bytes it will be 5.