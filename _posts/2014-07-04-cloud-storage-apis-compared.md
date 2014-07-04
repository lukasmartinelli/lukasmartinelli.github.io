---
layout: post
title: Comparison of Cloud Storage HTTP APIs 
tags: 
  - cloud
  - architecture
  - api
categories: web 
published: false
---

I will compare and review the different APIs of end user cloud storage providers. I will only look at the HTTP API aspect, not how this API is implemented for various languages.
The motiviation behind this is research for my [common cloud storage API](http://lukasmartinelli.ch/idea/2014/07/03/future-of-cuckoodrive.html).

## Is Cloud Storage a Remote Filesystem?
Most Cloud Storage providers either try to be a filesystem in the cloud or
use their own concepts of files and folders.

On feature of a **traditional filesystem** is that is has a notion of:

- **File name**
- **Directory**
- **Metadata**


## Upload a file

### Dropbox



### Box.net
Box.net uses the multipart POST method to do uploads.

```
curl https://upload.box.com/api/2.0/files/content \
-H "Authorization: Bearer ACCESS_TOKEN" \
-F filename=@FILE_NAME \
-F parent_id=PARENT_FOLDER_ID
```

### Google Drive



### Dropbox


SSL only
App folder permissions
UTF-8 encoding

```
GET /files/<root>/<path>?rev=mostRecent
Example:

```

## Download a file

### Dropbox
```
https://api-content.dropbox.com/1/files_put/<root>/<path>?param=val

```

### Metadata
```
https://api.dropbox.com/1/metadata/<root>/<path>
```

## Fileops
Copy
Create
Delete
Move

