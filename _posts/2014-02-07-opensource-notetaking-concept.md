---
layout: post
published: true
tags: 
  - idea
  - productivity
categories: idea
---

I switched over to Opensource software and have failed to find a viable alternative to a notetaking application like Evernote. That's why I want to create an open source solution for the problems Evernote and its competitors solve.

## Notetaking Use Cases
Evernote is a huge toolset that can solve many problems. I listed the three most popular use cases Evernote users have below.

### Organizing Paperwork
A common task I find myself solving with Evernote is digitalizing and organizing paper work like invoices, business cards, letters, appointments etc.
People who have been organized before the digital age, have put these papers into folders (the real ones) and labelled them properly. With the computer the next approach was to scan the papers and with the Smartphone I can simply take a photo and it is stored and cannot be forgotten.
Evernote improves this workflow even more by cropping the picture and adjusting the contrast and brightness, so that it looks like a decent scan. You label the note and tag it appropriatly and voilà: you got organized.

If we take a step back we notice, that this isn't actually note taking: this is about organizing and labelling resources. We are actually adding metadata like a Date, Place, Name and Tags to a digital file.

### Archiving the Web
Evernote keeps everything I've read and liked on the web and makes it searchable.
If I mark something on feedly it goes to Evernote, if I've read an interesting article on Pocket it goes to Evernote, if I've discovered an awesome website or article it goes to Evernote as well.

We're collecting and referencing external resources and adding metadata to it, so it is archived and we can go back to it later to enhance the information even more.

### Actual Note Taking and alot of Edge Cases
The more you add, the more useful Evernote becomes. I add everything that comes to my mind and might be useful for later to Evernote. Wether I am working on a project and have to take notes or studying and writing a quick outline of a lecture: I am creating actual content and enhancing it with metadata.

## Note Definition
From the use cases above we see that what we actually need, is a system that holds together all that loose information that floats around, enhances it with metadata and makes it searchable.

> A note is text and metadata with references to external ressources.

### Notes with References to External Ressources
A note is basically just a metadata container with text remarks to external references.

Let's say I'm researching opensource notetaking applications and I come around an interesting website. I write down a short remark and put it to the link. This link is a reference to a website on the web.
If I write down an idea for a product or an article I might write down my thoughts and take a picture of a rough sketch I draw by hand. The photo goes into my Dropbox camera folder and I simply make a reference to it.

![Notes that use references instead of embedded content](/media/notes_references_concept.png)

#### Advantage
- It is a very unique approach to the notetaking problem and makes it clear that notes are just metadata
- It makes it very easy to just integrate with existing systems
- It allows to only take care of the note itself, all other ressources are part of external systems we simply try to integrate with
- Ressources are only existing at one place and can easily be changed, backed up or reorganized

#### Disadvantage 
The biggest problem of using references to external ressources is, that files can change their location and therefore a reference becomes invalid.

#### Text
The note contains rich text describing the references, one could even create an own file out of that and reference it inside the note. But this seems a bit overkill and for the sake of simplicity, the text is always part of the note.

#### Solving problem of changing locations
One idea to solve this problem partially is to create hashes of the referenced ressources. If the reference becomes invalid, we just search all the external ressource containers for hashes that match and automatically move the reference to the new location of the ressource.

## Notes with References to Embedded Ressources
With the concept of references, you could also reference ressources that are embedded in the note.

So once I add something like a website or a photo, it is **copied** to the ressources section embedded in the note and a reference is made to that ressource.

![Notes using references to embedded files](/media/notes_embedded_references_concept.png)

#### Advantage
We don't have to take care how to access all these different ressources, as they are always embedded.
#### Disadvantage
- Now we actually duplicated the information, it exists on two places and if I edit the photo or decrease the resolution inside the note, I'm creating two different versions of the same content. If a ressource is embedded inside a ressource it makes it significantly harder to integrate with other applications.
- Synchronizing notes is much more complicated as we're also syncing embedded files that can change now

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

### Ressource Schemes and Ressource Containers
The URI approach allows very easy integration of different ressource containers.  

![Ressource schemes on different clients with their containers](/media/notes_schemes_concept.png)

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

## Note Structure

You don't need a feature-rich text processor like Word for notetaking, but you still want some control over the text. Markdown is perfect for the task, it can be customized to work perfectly with the ressource concept defined above and it has many great open source editors already available.

### Metadata
To store the metadata associated with the note, I suggest an approach that is used in Jekyll and is called [Front Matter](http://jekyllrb.com/docs/frontmatter/).

> Front Matter means every file has a YAML Header containing metadata.

{% highlight yaml %}
---
title: Invoice
date: 2010-02-11 11:02:57
geo: +48.8577, +002.295
tags: invoice, finance
---
Lorem ipsum...and more Markdown
{% endhighlight %}

The question is what metadata belongs into the header. The creation date and time of a note could be saved at several places:
- In the name (e.g. 2014-02-07-invoice.md)
- In the file creation time attribute of the file itself
- In the YAML header

### Markdown and Ressources
To make a reference to a ressource inside Markdown you use the same syntax as for embedding an Image (which is an external ressource):

{% highlight bash %}
![Image from Dropbox](dropbox://Camera-Uploads/invoice.jpg)
![Pdf from Bittorrent Sync](//btsync://biqln05zbek134/letter.pdf)
![Website from Internet](http://blog.com/site.html)
{% endhighlight %}

Based on the schema concept above, we could now fetch that ressource and process it.

## Architecture
The architecture should be very easy to integrate and **shouldn't require a server setup**.

#### Decoupled Note Data Directory
Synchronizing is a huge effort and a complicated process to deal with. That's why the application should be completly decoupled from a synchronizing service, it should just write to a data directory. This data directory is synchronized by external systems like Dropbox or Bit Torrent Sync or anything that has a file interface. This will make integration with other parties much easier.

#### Conflict Resolution
Synchronizing Systems don't necessarily support automatic resolution of conflicts. Dropbox for example creates a special copy of the file that is marked as a conflict.
The note editor might now resolve that conflict by using an auto-merge approach like Version Control Systems have. This approach shouldn't be to difficult to implement, as the note structure is very simple.

#### App Domain
The application consists of a note editor and a search indexer. The note editor will manage the note directory and process search queries, while the search indexer will index the notes and external ressources and write that to an index file.

#### Search
The realization of a search indexer in a decoupled system like this will probably the biggest challenge. One approach is that every indexer on each platform indexes everything he knows of:
- All notes in the note dir
- All currently accessible ressources that were referenced in the notes
The search index is not shared as this would be much more complicated. A long running task like indexing might be a problem on devices like mobile phones.

![Decoupled architecture for Opensource Notetaking](/media/notes_architecture.png)

## Note Editor
It is important that there are applications on all major devices. The resulting HTML from Markdown is perfect for viewing your notes on any device.

### Visual Editing
My guess is, that casual users won't accept bare metal markdown editor like [Dillinger](http://dillinger.io/) or [StackEdit](https://stackedit.io/) even though they are absolutely lovely.
What we need is a Visual Editor, because for notes you immediately want to see the end result like you're writing on a paper. While formatting is already expressed pretty well in Markdown, the most important thing is, that you always see the preview of your external ressources, wether your viewing or editing the note.

#### Existing Visual Editors
[Simplenote](http://simplenote.com/) and [Texts](http://www.texts.io/) are good examples for visual editors. What would also work is something like [Macchiato](http://getmacchiato.com/), which let's you edit real markdown but also give's you a visual hint.

#### Opensource Visual Editors
Sadly there are no Open Source visual editors on the market. So either we have to build an editor like that or use a baremetal markdown editor.

#### Links
- [HalloJs](http://hallojs.org/demo/markdown/): Javascript editor that performs conversion of HTML into Markdown back and forth and is previewing it live.
- [Mashable](http://mashable.com/2013/06/24/markdown-tools/ "Mashable Markdown Tools"): An overview of Markdown tools and products
- [MarkdownView](http://gun.io/blog/markdown-view-for-android/): A Markdown viewer for Android
- [EpicEditor](http://oscargodson.github.io/EpicEditor/): Javascript MarkDown Dropin for websites.
- [HNotes](https://play.google.com/store/apps/details?id=com.hly.notes): Android Rich Text notetaking App

### Desktop
The note editor for the desktop could either be a self hosted website or a normal desktop client.
The self hosted variant is the comfortable approach as we only have to build it once, but I'm note sure wether users will accept that because for something essential as a notetaking program I want a very fast and slick program with good system integration and I'm not sure wether I can provide the same experience with a web app.

## Summary
This concept might be working or it might be not. I've written down alot of information in this post and it should serve as a very generic concept of my idea of an opensource notetaking application. I'm not sure how big the effort would be to build such a thing or wether users would like it, but I just wanted to share my idea.
I'll keep you updated if I find something similar or take the courage to build a prototype.