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

## Authentication

Everyone uses OAuth!

Provider     | OAuth 1 | OAuth 2 |                    
-------------|----------------------------------------------------
Dropbox      | Yes     | Yes     |
Google Drive | Yes     | Yes     |            
Box          | No\*     | Yes     |
One Drive    | No\*     | Yes
Sugar Sync   | Ye

## Listing files

Provider     | Method and URL                                     
-------------|----------------------------------------------------
Dropbox      | `GET /metadata/dropbox/{path to folder}?list=true` 
Google Drive | `GET /files/{folder id}/children`                  
Box          | `GET /folders/{folder id}/items`                
One Drive    | `GET /{folder id}/files                    
Sugar Sync   | `GET /folder/{folder id}/contents`                 

We see that Dropbox does have a separate Metadata Ressource, which makes the separation between the file metadata and file data obvious (that is why you have to specify `list=true`). Like mentioned above Google Drive does not know about folders and therefore uses the File Ressource.
Box, Sugar Sync and One Drive operate on a property of the Folder Ressource (items, files, contents, children).

Provider     | Specify Fields | Paging 
-------------|----------------|---------------------------
Dropbox      | Not supported  | Not supported
Google Drive | Include fields | Url Param `maxResults` and `pageToken`
Box          | Include fields | Url Param `limit` and `offset`
One Drive    | Not supported  | Not supported
Sugar Sync   | Not supported  | Url Param `start` and `max`

Paging is done by using tokens (Google Drive) or a given offset and limit (Box and Sugar Sync). One Drive and Dropbox lack the ability to do paging - which doesn't have to be bad, as you probably rarely store more 25'000 files in one folder.

Google Drive and Box let you specify which fields of the listed Ressource you want included while the others just include everything.

### Examples


## Download File

Provider     | Method and URL                      | Partial download
-------------|-------------------------------------|-----------------------------
Dropbox      | `GET /files/dropbox/{path to file}` | HTTP Range header
Google Drive | `GET {download link}`               | HTTP Range header
Box          | `GET /files/{file id}/content`      | Not supported
One Drive    | `GET /{file id}/content`            | Not supported
Sugar Sync   | `GET /file/{file id}`               | Not supported

When using Google Drive, one has first to obtain the download link by issueing a metadata request: `GET /files/{file id}`. The response contains the download link. If the requested file is a Google Document it has to be exported into a file first.

Provider     | Partial download  | Metadata included                   
-------------|-------------------|-------------------------------------
Dropbox      | HTTP Range header | HTTP `x-dropbox-metadata` header    
Google Drive | HTTP Range header | Metadata request is required anyway 
Box          | Not supported     | Not supported
One Drive    | Not supported     | Not supported
Sugar Sync   | Not supported     | Not supported

It seems that using the HTTP Range header for specifying partial downloads is best practice. Therefore Box, One Drive and Sugar Sync should implement this functionality. 
Dropbox let's you include metadata about the file (even though metadata is a separate ressource, which is a bit inconsistent). Every provider returns the raw file data (without mixed metadata) so consumers don't have to worry about encoding.

### Examples

#### Dropbox

**Request:**
```
curl https://api-content.dropbox.com/1/dropbox/document.pdf \
-H "Authorization: Bearer {access token}"
```
**Response:**
```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Length: 10506
x-dropbox-metadata: {"revision"....
}
```

#### Googledrive



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
One Drive    | File contents or 
Sugar Sync   | File contents

Provider     | Metadata Response           | Partial upload
-------------|-----------------------------------------------------------------------
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
-------------|-----------------------------------------------------------------------
Dropbox      | bytes                    | modified, client_mtime
Google Drive | fileSize, quotaBytesUsed | createdDate, modifiedDate, modifiedByMeDate, lastViewedByMeDate, markedViewedByMeDate, sharedWithMeDate
Box          | size                     | created_at, modified_at, trashed_at, purged_at, content_created_at, content_modified_at
One Drive    | size                     | created_time, updated_time, client_updated_time
Sugar Sync   | size                     | timeCreated, lastModified

Provider     | Thumbnail                      | Hash          | Deleted
-------------|--------------------------------------------------------------------
Dropbox      | thumb_exists                   | hash          | is_deleted
Google Drive | thumbnailLink, thumbnail.image | md5Checksum   | explicitlyTrashed
Box          | Not supported                  | sha1          | item_status
One Drive    | Not supported                  | Not supported | Not supported
Sugar Sync   | Not supported                  | Not supported | Not supported

Provider     | Support revisions | Image metadata         | Permissions
-------------|--------------------------------------------------------------------
Dropbox      | rev               | photo_info, video_info |
Google Drive | headRevisionId    | imageMediaMetadata     | userPermissionm permissions, shared
Box          | version_number    | Not supported          | shared_link, owned_by, permissions
One Drive    | Not supported     | Not supported          | shared_with, access
Sugar Sync   | versions          | image                  | publicLink

## Status Codes


### Examples
Dropbox

Authorize app to access
```
firefox https://www.dropbox.com/1/oauth2/authorize?client_id={public app key}&response_type=code
```
Request:
```
curl https://api.dropbox.com/1/oauth2/token \
-d grant_type=authorization_code \
-d code={auth code} \
-u {app key}:{app secret}
```

```
curl GET https://api-content.dropbox.com/1/files/auto/ \
-H "Authorization: Bearer {access token}}" \
```
Googledrive

```
firefox https://accounts.google.com/o/oauth2/auth?client_id={public app key}&response_type=code&scope=https://www.googleapis.com/auth/drive&redirect_uri=urn:ietf:wg:oauth:2.0:oob
```

List files
```
curl GET https://api-content.dropbox.com/1/files/auto/ \
-H "Authorization: Bearer {access token}}" \
```

curl GET https://accounts.google.com/o/oauth2/token \
-d grant_type=authorization_code \
-d code={auth code}
-d client_id={app key}
-d client_secret={app secret}
-d redirect_uri=urn:ietf:wg:oauth:2.0:oob
```

