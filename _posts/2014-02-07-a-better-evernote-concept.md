---
layout: post
published: true
tags: 
  - idea
  - productivity
categories: idea
---

I recently try to move away from US services that contain too much of my life's private information. Evernote has been the #1 reason that I finally managed to get organized: I dump everything into the green elephant's brain to access it later. I've become so dependant on it, that the thought someone could read or parse my evernote notes, makes me shudder

Sadly there are no viable opensource alternatives out there, that were as complete and easy to use as Evernote. That's why I want to create an open source solution for the problems Evernote and its competitors solve.

## Evernote Use Cases
Evernote is a huge toolset that can solve many problems,  I listed the three most popular use cases Evernote users have.

### Organizing Paperwork
A common task I find myself solving with Evernote is digitalizing and organizing paper work like invoices, business cards, letters, appointments etc.
People who have been organized before the digital age, have put these papers into folders (the real ones) and labelled them properly. With the computer the next approach was to scan the papers and with the Smartphone I can simply take a photo and it is stored and cannot be forgotten.
Evernote improves this workflow even more by cropping the picture and adjusting the contrast and brightness, so that it looks like a decent scan. You label the note and tag it appropriatly and voilà: you got organized.

If we take a step back we notice, that this isn't actually note taking, this is about organizing and labelling resources. We are actually adding metadata like a Date, Place, Name and Tags to a digital file.

### Archiving the Web
Evernote keeps everything i've read and liked on the web and makes it searchable.
If I mark something on feedly it goes to Evernote, if I've read an interesting article on Pocket it goes to Evernote, if I've discovered an awesome website or article it goes to Evernote as well.

We're collecting and referencing external resources and add metadata to it, so it is archived and we can go back to it to enhance the information even more.

### Actual Note Taking and alot of Edge Cases
The more you add, the more useful Evernote becomes. I add everything that comes to my mind and might be useful for later to Evernote. Wether I am working on a project and have to take notes or studying and writing a quick outline of a lecture: I am creating actual content and enhance it with metadata.

### Overview
![Workflows with Evernote](/media/evernote_flows.png)

## What are notes?
What Evernote provides and what we actually need, is a system that holds together all that loose information and enhances it with metadata.
A note is just metadata with references to external resources like files or websites.

### Notes with References to External Ressources
A note is basically just a metadata container with text remarks to external references.

![Notes that use references instead of embedded content](/media/notes_with_references.png)

## Notes with Ressources to Embedded Ressources
With the concept of references, you could also reference ressources embedded in the note. Please note that the rich text in the note is not mapped as a ressource, it is always directly in the note itself, for the sake of simplicity.

The biggest problem of using references to external ressources is, that files can change their location. This is a very convincing reason to use embedded references but this would also make accessing these files for other services very impractical and increases the complexity of a syncing mechanism.
![Notes using references to embedded files](/media/embedded_notes.png)

## Ressource Address Schema
Every ressource is addressed with an URI.
Following URI Schemes are supported:

- file: Absolute location in a file system
- dropbox: Specifies location of a file in the user's Dropbox home directory 
- btsync: File in a Bit Torrent Sync folder (adressed by secret)
- http: File accessable via HTTP
- note: Reference to ressource embedded inside the note

Possible additions:
- ftp: Location in a FTP folder
- drive: Google Drive

### Examples

#### File
Absolute locations in a filesystem are probably the worts variant of references, but it is still possible. This won't work very good with different clients, as the users would need to have exactly the same directory structure.

#### Dropbox
If a note is referenced with a dropbox file, this might be on the already synced Dropbox folder on the user's system, or it might also be in the folder of the Dropbox App (on Android). If there is no Dropbox installed on the system, the file can be accessed via the Dropbox Api.

#### Bit Torrent Sync
Notes that are in a Folder that is synced via Bit Torrent Sync. The file is in the folder identified by the secret, if it is not in the user's filesystem, the file can be selectively synced in order to be accessed.

#### Http
Reference to Websites will always point to the same ressource location for all users

#### Note
If you choose to use notes with embedded resource, the note schema shows that the file is embedded in the note.
![Ressource schemes on different clients with their containers](/media/ressources_schemes.png)

## Note Structure
For notetaking you don't need a high end text processor like word, but you still want some control over the text. Markdown seems perfect for the task, it can be customized to work perfectly with ressources and it has many greate open source editors readily available.

#### Example
{% highlight markdown %}
---
title: Invoice
date: 2010-02-11 11:02:57
geo: +48.8577, +002.295
tags: invoice, finance
---
Remember to pay the bill!
![Image from Dropbox](dropbox://Camera-Uploads/invoice.jpg)
{% endhighlight %}

### Metadata
To store the metadata associated with the note, im leaning torwards an approach that is used in Jekyll and is called [Front Matter](http://jekyllrb.com/docs/frontmatter/). Basically every file does have a YAML Header containing metadata.

{% highlight markdown %}
---
title: Invoice
date: 2010-02-11 11:02:57
geo: +48.8577, +002.295
tags: invoice, finance
---
Lorem ipsum...and more Markdown
{% endhighlight %}

### Markdown and Ressources
To make a reference to a ressource you use the same syntax as you would use to embedd an Image (also an external ressource):

{% highlight markdown %}
![Image from Dropbox](dropbox://Camera-Uploads/invoice.jpg)
![Pdf from Bittorrent Sync](//btsync://biqln05zbek134/letter.pdf)
![Website from Internet](http://blog.com/site.html)
{% endhighlight %}