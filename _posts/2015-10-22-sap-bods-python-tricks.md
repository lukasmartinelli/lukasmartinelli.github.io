---
layout: post
title: Python Tips for SAP BODS
hidden: true
published: true
tags:
  - python
  - sap
categories: python
---

Some months ago I had to implement a user defined transform (UDT) for
[SAP Business Object Data Services](http://help.sap.com/bods40) in Python.
We integrated social media services into a SAP based platform and there
are a few things I stumbled upon while trying to implement it.

This post is meant as an extension to the excellent post by Jake Bouma
on [Better Python Development for BODS: How and Why](https://scn.sap.com/community/data-services/blog/2014/04/23/faster-cleaner-python-development-for-bods).

## Read the Manual

**Read chapter 11** of the [official manual of SAP for the topic](http://help.sap.com/businessobject/product_guides/sbods42/en/ds_42_reference_en.pdf)
which is the best and only source of information you have.
There is also an [official blog plog](http://scn.sap.com/community/data-services/blog/2013/01/31/how-to-use-userdefined-transform-in-sap-bodsbusiness-object-data-services)
giving a high level overview.

## Develop Locally

The first step to being more productive is testing and developing the UDT on
your local machine and only deploy it when it is ready.
The BODS Python editor is unusable for development because
you need a fast feedback loop when developing your program.
Look at the BODS editor as deployment method for your Python code.

In order to execute your UDT on the local machine and on the SAP platform
you need to design it like regular Python programs and mock out the SAP
interface for testing.

### Design UDTs as regular Python programs

The official SAP documentation is not a good example for
[idiomatic Python code](http://docs.python-guide.org/en/latest/writing/style/).

Structure your script into functions and an entrypoint - just like you would do with a local command
line tool.  Keep the SAP integration separate to keep your code testable.

```python
def insert_newest_tweets():
   print 'Fetching newest tweets'
   tweets = fetch_newest_tweets('@lukmartinelli')
   for tweet in tweets:
       create_record(tweet)
       print 'Successfully added {} to collection'.format(tweet.id)
   print 'Finished collecting {} tweets'.format(len(tweets))


if __name__ == '__main__':
    insert_newest_tweets()
```

The `__name__ == '__main__'` clause will
check if the code is executed as
[standalone program or imported as library](http://effbot.org/pyfaq/tutor-what-is-if-name-main-for.htm).

### Check the interpreter

You can test in your program whether you are running inside SAP or an other environment
by checking the interpreter that executes your script.

```python
import sys

RUNS_IN_SAP = sys.executable.endswith(u'al_engine.exe')
```

This allows you to import the mocked SAP interface in case you are not running on the SAP platform.

```python
if not RUNS_IN_SAP:
    from sap import Collection, DataManager
```

Another example is configuring a corporate proxy when code is running in production.

```python
if RUNS_IN_SAP:
    PROXY = u'proxy.corp.local:8080'
```

### Emulate substitution parameter

If you are using substitution parameters in production you can
emulate those with environment variables.
Substitution parameters are replaced at runtime by the SAP Python
interpreter.

This function checks whether the value has been replaced
and if not returns default value.

```python
def load_substitution_param(substitution, default_value):
    if substitution.startswith('[$$'):
        return default_value
    else:
        return substitution
```

Using it together with local environment variables.

```python
POST_LIMIT = int(load_substitution_param(r'[$$FACEBOOK_POST_LIMIT]',
                                         os.environ.get('POST_LIMIT', 200)))
```

### Mock out the SAP interface

To be able to unit test your code you need to mock out the SAP interface.
The easiest way is to create a new file `sap.py` and import it
only when running locally (like described above).

```python
if not RUNS_IN_SAP:
    from sap import Collection, DataManager
```

I've written some code that mimics the BODS `Collection` and
`Record` functionality. The classes are exported as global singletons so you
can use them in the same fashion as the normal API.

You can use the mocked interface to write unit tests or read
from `stdin` for testing your code locally.

```python
"""
This module enables local testing of python code
used for User Defined Transforms in SAP BODS
"""

class FIDataCollection:
    records = []

    def AddRecord(self, record):
        """
        Add a new record(returned by DataManager.NewDataRecord()) to the
        collection.
        For every NewDataRecord(), you can call AddRecord() only once.
        After you call AddRecord(), do not call DeleteDataRecord().
        """
        self.records.append(record)

    def DeleteRecord(self, record):
        """Removes the specified record from collection."""
        self.records.remove(record)

    def GetRecord(self, record, index):
        """Get a record at a given index from the collection."""
        if index < 1:
            raise ValueError("Indizes in SAP BODS start at 1 and not 0!")
        for key, value in self.records[index-1].values.iteritems():
            record.SetField(key, value)

    def Size(self):
        """
        Counts the number of records in the collection.
        Returns number of records in a collection.
        """
        return len(self.records)

    def Truncate(self):
        """Removes all the records from collection."""
        self.records = []


class FIDataManager:
    def NewDataRecord(self, ownership=1):
        """
        Creates a new record object. Do not use this method in a loop,
        otherwise the Python expression may experience a
        memory leak. Depending on the expression, you'll probably want to
        place this method at the beginning of the expression.
        Returns a new object of type FlDataRecord.
        """
        return FIDataRecord()

    def DeleteDataRecord(self, record):
        """
        Deletes the memory allocated to the record object.
        Do not call DeleteDataRecord() after calling AddRecord().
        """
        del record


class FIProperties:
    values = {}

    def GetProperty(self, property_name):
        """Returns the value of given property."""
        if not isinstance(property_name, unicode):
            raise ValueError("You must use unicode for property name")
        return self.values[property_name]


class FIDataRecord:
    values = {}

    def SetField(self, field_name, value):
        """Stores a value in the specified field."""
        if not isinstance(field_name, unicode):
            raise ValueError("You must use unicode for field name")
        if not isinstance(value, unicode):
            raise ValueError("You must use unicode for setting the value")
        self.values[field_name] = value

    def GetField(self, field_name):
        """Get a field from record."""
        if not isinstance(field_name, unicode):
            raise ValueError("You must use unicode for field name")
        return self.values[field_name]


Collection = FIDataCollection()
DataManager = FIDataManager()
Properties = FIProperties()
```

## Other Tricks

### Timestamp format for SAP

Format a Python `time` object in a SAP compatible format.

```python
def sap_timestamp(timestamp):
    return time.strftime('%Y.%m.%d %H:%M:%S', timestamp)
```

### Keep Business logic and SAP integration separate

Create a class in Python or use a [namedtuple](https://docs.python.org/2/library/collections.html#collections.namedtuple)
and write the mapping to the data records separately.

```python
class Tweet(object):
    def __init__(self, screen_name, created_at, id, text, favourites,
                 retweets, followers, friends):
        self.screen_name = screen_name
        self.created_at = created_at
        self.id = id
        self.text = text
        self.favourites = favourites
        self.retweets = retweets
        self.followers = followers
        self.friends = friends
```

And now create a help function to create the record.

```python

def create_record(tweet):
    rec = DataManager.NewDataRecord(1)

    rec.SetField(u'SCREEN_NAME', unicode(tweet.screen_name))
    rec.SetField(u'TIME_STAMP', unicode(sap_timestamp(tweet.created_at)))
    rec.SetField(u'TWEET_ID', unicode(tweet.id))
    rec.SetField(u'TWEET_TEXT', unicode(tweet.text))
    rec.SetField(u'FAV_COUNT', unicode(tweet.favourites))
    rec.SetField(u'RETWEETS', unicode(tweet.retweets))
    rec.SetField(u'FOLLOWERS_COUNT', unicode(tweet.followers))
    rec.SetField(u'FRIENDS_COUNT', unicode(tweet.friends))

    Collection.AddRecord(rec)

    # We need to remove the rec reference because it is an external object
    del rec
```

## Conclusion

I hope you can use these tricks when creating UDTs with Python.
Remember that writing a separate Python program to integrate other services
into SAP is probably the better way but sometimes you are restricted
by the environment you work in.
