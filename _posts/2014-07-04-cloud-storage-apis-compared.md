---
layout: post
published: false
---

I will compare and review the different APIs of end user cloud storage providers. I will only look at the HTTP API aspect, not how this API is implemented for various languages.

## Upload a file

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

