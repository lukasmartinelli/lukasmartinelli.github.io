---
layout: post
published: false
---

## A New Post

If you need to write a PyFilesystem implementation that does not implement a real filesystem, but instead builds on top of other filesystems to provide some functionality like compression or encryption you should use the already existing WrapFS.
Now it is not a very difficult task to just build proxy methods for the underlying filesystem and change the functionality you need. But if you use the WrapFS you already get these proxy methods for free and some other functionalities to build upon. It is also the recommended method so that everyone can see you're building on top of an existing filesystem and not implementing a real one.

The WrapFS is particularly useful if you are handling paths differently. It does have two very important methods called _encode and _decode.
These methods actually provide a path translation from your virtual filesystem to the underlying filesystem. If you're manipulating paths you should definitly use those for clarity. 
_encode and _decode are always called for paths before they are handed over to the underlying filesystem. For example the simple methods isdir and isfile:

```python
@rewrite_errors
def isdir(self, path):
    return self.wrapped_fs.isdir(self._encode(path))

@rewrite_errors
def isfile(self, path):
    return self.wrapped_fs.isfile(self._encode(path))
```

The '@rewrite_errors' decorator is another very useful utility. It actualy translates the paths from the ResourceError's that happened in the underlying filesystem to the paths in the upper filesystem.
So let's say your underyling file part0 throws a NotFoundError this will bupple up and return to the user of the pyfilesystem as error for part0 not found, but instead the xxx file was not found. part 0 is just an implementation detail


Another useful method is the '_file_wrap' _method
This will allow you to wrap the FileObjects into your own object to modify for example read access. Most of the methods in wrapfs really look like proxy method.

What you need to be aware of is:
	> Encode and Decode don't differentiate between file names and directory names
There is another trap i fell into. If you change the implementation of the listdir method because for example your handling files differently, this won't affect the listdirinfo method like in the base FS class because WrapFS will try to call listdirinfo of the wrapped_fs. So you should modifiy this class as well.







