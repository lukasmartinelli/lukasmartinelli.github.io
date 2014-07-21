---
layout: post
title: Comparison of Cloud Storage HTTP APIs
tags:
  - cloud
  - architecture
  - api
categories: cloud
published: true
---

I will compare and review the different APIs of end user cloud storage providers. I will only look at the HTTP API aspect, not how this API is implemented for various languages.
The motiviation behind this is research for my [common cloud storage API](http://lukasmartinelli.ch/idea/2014/07/03/future-of-cuckoodrive.html).

## Is Cloud Storage a Remote Filesystem?
Most Cloud Storage providers either try to be a filesystem in the cloud or
use their own concepts of files and folders.

One feature of a [**traditional filesystem**](http://en.wikipedia.org/wiki/File_system#Aspects_of_file_systems) is that is has a notion of:

- **File name** Identify a storage location by using path components like host, directory, name and type (through extension).
- **Directory** A hierarchical filesystem is organized by having parent-child relationships between directories and subdirectories

Provider                                                          | File Identifier     | File Type      | Hierarchy
------------------------------------------------------------------|---------------------|----------------|----------
![Dropbox](/media/cloudstorage/dropbox.png) Dropbox               | Path                | File Extension | Path
![Google Drive](/media/cloudstorage/googledrive.png) Google Drive | File ID             | Mime-Type      | Parent ID
![Box](/media/cloudstorage/box.png) Box                           | File and Folder ID. | File Extension | Parent ID
![One Drive](/media/cloudstorage/onedrive.png) One Drive          | Path *or* Folder ID | File Extension | Parent ID
![Sugar Sync](/media/cloudstorage/sugarsync.png) Sugar Sync       | File and Folder ID  | Mime-Type      | Parent ID

Only Dropbox and One Drive have an API that comes close to a filesystem. The others work with the IDs of files or folder. Hierarchy is established by saving the Parent ID on the File Ressource. Children of a Parent ID can usually be requested through the Folder Ressource.
Dropbox is a very good example in keeping the learning curve low by mimicing a filesystem.
Google Drive does not even have folders (only a specific folder mime-type), which makes Google Drive difficult to understand at first sight.

## Authentication

The good news is that everyone uses OAuth 2 nowadays!

Provider                                                          | OAuth 1 | OAuth 2
------------------------------------------------------------------|---------|--------
![Dropbox](/media/cloudstorage/dropbox.png) Dropbox               | Yes     | Yes
![Google Drive](/media/cloudstorage/googledrive.png) Google Drive | Yes     | Yes
![Box](/media/cloudstorage/box.png) Box                           | No\*    | Yes
![One Drive](/media/cloudstorage/onedrive.png) One Drive          | No\*    | Yes
![Sugar Sync](/media/cloudstorage/sugarsync.png) Sugar Sync       | Yes     | Yes

## Listing files

Provider                                                          | Method and URL
------------------------------------------------------------------|---------------------------------------------------
![Dropbox](/media/cloudstorage/dropbox.png) Dropbox               | `GET /metadata/dropbox/{path to folder}?list=true`
![Google Drive](/media/cloudstorage/googledrive.png) Google Drive | `GET /files/{folder id}/children`
![Box](/media/cloudstorage/box.png) Box                           | `GET /folders/{folder id}/items`
![One Drive](/media/cloudstorage/onedrive.png) One Drive          | `GET /{folder id}/files
![Sugar Sync](/media/cloudstorage/sugarsync.png) Sugar Sync       | `GET /folder/{folder id}/contents`

We see that Dropbox does have a separate Metadata Ressource, which makes the separation between the file metadata and file data obvious. Like mentioned above Google Drive does not know about folders and therefore uses the File Ressource to access folders.
Box, Sugar Sync and One Drive operate on a property of the Folder Ressource (`items`, `files`, `contents`, `children`).

Provider                                                          | Specify Fields | Paging
------------------------------------------------------------------|----------------|---------------------------------------
![Dropbox](/media/cloudstorage/dropbox.png) Dropbox               | Not supported  | Not supported
![Google Drive](/media/cloudstorage/googledrive.png) Google Drive | Include fields | Url Param `maxResults` and `pageToken`
![Box](/media/cloudstorage/box.png) Box                           | Include fields | Url Param `limit` and `offset`
![One Drive](/media/cloudstorage/onedrive.png) One Drive          | Not supported  | Not supported
![Sugar Sync](/media/cloudstorage/sugarsync.png) Sugar Sync       | Not supported  | Url Param `start` and `max`

Paging is done by using tokens (Google Drive) or a given offset and limit (Box and Sugar Sync). One Drive and Dropbox lack the ability to do paging. Dropbox does not allow you to list more than 25k ressources.

Google Drive and Box let you specify which fields of the listed Ressource you want included while the others just include everything.

## Download File

Provider                                                          | Method and URL                      | Partial download
------------------------------------------------------------------|-------------------------------------|------------------
![Dropbox](/media/cloudstorage/dropbox.png) Dropbox               | `GET /files/dropbox/{path to file}` | HTTP Range header
![Google Drive](/media/cloudstorage/googledrive.png) Google Drive | `GET {download link}`               | HTTP Range header
![Box](/media/cloudstorage/box.png) Box                           | `GET /files/{file id}/content`      | Not supported
![One Drive](/media/cloudstorage/onedrive.png) One Drive          | `GET /{file id}/content`            | Not supported
![Sugar Sync](/media/cloudstorage/sugarsync.png) Sugar Sync       | `GET /file/{file id}`               | Not supported

When using Google Drive, one has first to obtain the download link by issueing a metadata request: `GET /files/{file id}`. The response contains the download link. If the requested file is a Google Document it has to be exported into a file first.
It seems that using the HTTP Range header for specifying partial downloads is best practice.

Provider     | Partial download  | Metadata included
-------------|-------------------|------------------------------------
Dropbox      | HTTP Range header | HTTP `x-dropbox-metadata` header
Google Drive | HTTP Range header | Metadata request is required anyway
Box          | Not supported     | Not supported
One Drive    | Not supported     | Not supported
Sugar Sync   | Not supported     | Not supported

Dropbox let's you include metadata about the file (even though metadata is a separate ressource, which is a bit inconsistent). Every provider returns the raw file data (without mixed metadata) so consumers don't have to worry about encoding.

## Upload File

Provider     | Method and URL
-------------|----------------------------------------------------
Dropbox      | `PUT/POST /files_put/dropbox/{path to file}`
Google Drive | `POST /files?uploadType={ media, multipart or resumable }`
Box          | `POST /files/content`
One Drive    | `PUT/POST /{folder id}/files/{file name}
Sugar Sync   | `PUT /file/{existing file id}/data`

Provider     | Request Body
-------------|-----------------------------------------------------------------------
Dropbox      | File contents
Google Drive | File contents, Multipart
Box          | Filename, Parent ID, Timestamps or Filepart (for POST multipart upload)
One Drive    | File contents
Sugar Sync   | File contents

Provider     | Metadata Response           | Partial upload
-------------|-----------------------------|-----------------------------------------
Dropbox      | Full metadata               | Chunked Upload
Google Drive | Full metadata (unnecessary) | Three options
Box          | Full metadata               | Not supported
One Drive    | Partial metadata            | Not supported
Sugar Sync   | Not supported               |

The APIs differ quite a bit for uploading content.
Dropbox does not use a RESTful url for the uploading part (but otherwise uses the REST approach quite strict). Dropbox and google Drive provider methods to upload huge files in partial requests.
Most of the Providers return the full metadata for the created object. This is a bit unnecessary for Google Drive as we already have the metadata, because we have to create an object in advance.

## File Metadata

Provider     | Size                     | Time
-------------|--------------------------|--------------------------------------------------------------------------------------------------------
Dropbox      | bytes                    | modified, client_mtime
Google Drive | fileSize, quotaBytesUsed | createdDate, modifiedDate, modifiedByMeDate, lastViewedByMeDate, markedViewedByMeDate, sharedWithMeDate
Box          | size                     | created_at, modified_at, trashed_at, purged_at, content_created_at, content_modified_at
One Drive    | size                     | created_time, updated_time, client_updated_time
Sugar Sync   | size                     | timeCreated, lastModified

Dropbox does not provide all the time information that might be interesting. Google Drive provides alot of information about time related actions (they have to be explicitely included in a metadata request though). Box differntiates between actions performed on the content or on the metadata.

Provider     | Thumbnail                      | Hash          | Deleted
-------------|--------------------------------|---------------|-------------------
Dropbox      | thumb_exists                   | hash          | is_deleted
Google Drive | thumbnailLink, thumbnail.image | md5Checksum   | explicitlyTrashed
Box          | Not supported                  | sha1          | item_status
One Drive    | Not supported                  | Not supported | Not supported
Sugar Sync   | Not supported                  | Not supported | Not supported

Some providers expose the hashes, which makes the developers life a bit easier because he can compare hashes instead of timestamps. One Drive and Sugar Sync do not have the notion of a deleted ressource, while the others let you request deleted ressources until they are finaly purged.

Provider     | Support revisions | Image metadata         | Permissions
-------------|-------------------|------------------------|-----------------------
Dropbox      | rev               | photo_info, video_info |
Google Drive | headRevisionId    | imageMediaMetadata     | userPermissionm permissions, shared
Box          | version_number    | Not supported          | shared_link, owned_by, permissions
One Drive    | Not supported     | Not supported          | shared_with, access
Sugar Sync   | versions          | image                  | publicLink

Some kind of versioning is common among the providers (as usual with the exception of One Drive).
They normally use a moving version number.
Dropbox, Google Drive and Sugar Sync know based on the mime type of a ressource that it is an image and provide you with information (width, height, encoding) about it.
Everyone implements permissions but this is highly dependent of the provider. One can say however that everyone offers you to share the file via a public link.

## Conclusion
All cloud storage APIs are doing a good job. They are all trying hard to help you as a developer to understand their concepts (through examples or documentation). Alot of the core operations are basically the same just with different naming of the attributes and parameters (sad that no standard evolved yet). I personally think that Box provides the most elegant API, Dropbox is the easiest one to use and Google Drive has all the features you want.

### Dropbox
I am really fond of the Dropbox API because using a path instead of an ID proved to be easier to use
as a developer. However accessing a ressource via its ID makes more sense from a RESTful standpoint.
Dropbox uses ressources but is not that consistent about it (`/files_put` or `/commit_chunked_upload`).
The API of Dropbox is feature rich but still easy to use.

### Google Drive
Google Drive exposes alot of metadata and supports even more features (three different way to upload file content!) and actions than Dropbox does. It provides excellent documentation as well. The API however is not that easy to use because there are alot of counter-intuitive things (no folder ressource, listing files by using a query, create ressource first before uploading content to it, Google Docs/Spreadsheets are not downloadable).

### Box
The Box API makes everything right. They provide a well structured and elegant REST API that behaves like you expect it. They don't provide all the features Dropbox and Google Drive do but this is not really a problem because the basic and most used operations are all there.

### One Drive
One Drive has a spartanic documentation und only provides a minimal set of features. This is not necessarily bad as it makes it easy to grasp the structure at one glance. The file and folder IDs look a bit confusing at first sight (`file.a6b2a7e8f2515e5e.A6B2A7E8F2515E5E!184`). To directly compete with the others One Drive needs to implement more features but it has a solid API one can easily use today.

### Sugar Sync
Sugar Sync has a very similar API to Box and this is a good thing! Their product is not all about storage which and you can see that reflected in their API. They explicitely rely on XML which might put off many of nowadays JSON purists. But they have a very good documentation and solid set of features.

## Common denominator
If one would write an middleware to provide a common interface for those APIs (like [kloudless](https://developers.kloudless.com/) or [Cloud Elements](https://console.cloud-elements.com/elements/api-docs/#!/documents/storage_GET)) we have to choose the lowest common denominator for the APIs.

This means that only the most basic form of the features can be used and only features that can be emulated should be implemented. I'll probably write more about that in a later post.
