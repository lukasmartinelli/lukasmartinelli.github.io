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

One feature of a [**traditional filesystem**](http://en.wikipedia.org/wiki/File_system#Aspects_of_file_systems) is that is has a notion of:

- **File name** Identify a storage location by using path components like host, directory, name and type (through extension).
- **Directory** A hierarchical filesystem is organized by having parent-child relationships between directories and subdirectories

Provider     | File Identifier     | File Type      | Hierarchy         
-------------|---------------------|----------------|-------------------
Dropbox      | Path                | File Extension | Path              
Google Drive | File ID             | Mime-Type      | Parent ID         
Box          | File and Folder ID. | File Extension | Parent ID         
One Drive    | Path *or* Folder ID | File Extension | Parent ID         
Sugar Sync   | File and Folder ID  | Mime-Type      | Parent ID

Only Dropbox and One Drive have an API that comes close to a filesystem. The others work with the IDs of files or folder. Hierarchy is established by saving the Parent ID on the File Ressource. Children of a Parent ID can usually be requested through the Folder Ressource.
Dropbox is a very good example in keeping the learning curve low, by mimicing a filesystem.
Google Drive does not even have folders (only a specific folder mime-type), which makes Google Drive difficult to understand at first sight.

## Listing files

| Provider     | Method and URL 
|--------------|----------------------------------------------------
| Dropbox      | `GET /metadata/dropbox/{path to folder}?list=true`
| Google Drive | `GET /files/{folder id}/children`
| Box          | `GET /folders/{folder id}/items`
| One Drive    | `GET /{folder id}/files
| Sugar Sync   | `GET /folder/{folder id}/contents`

## Upload a file in a folder

| Provider     | Method and URL 
|--------------|----------------------------------------------------
| Dropbox      | `PUT/POST /files_put/dropbox/{path to file}`
| Google Drive | `POST /files?uploadType={ media | multipart | resumable }`
| Box          | `POST /files/content`
| One Drive    | `PUT/POST /{folder id}/files/{file name}
| Sugar Sync   | `POST /folder/{parent folder id}`


### Dropbox



### Box
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