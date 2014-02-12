---
layout: post
published: true
tags: 
  - idea
  - productivity
categories: idea
---

Because of the recent events I try to move away from US services that contain too much of my life's private information. Evernote has been the #1 reason that I finally managed to get organized: I dump everything into the green elephant's brain to access it later. I've become so dependant on it, that the thought someone could read or parse my evernote notes, makes me shudder.

Sadly there are no viable opensource alternatives out there yet, that are as complete and easy to use as Evernote. That's why I want to create an open source solution for the problems Evernote and its competitors solve.

## Evernote Use Cases
Evernote is a huge toolset that can solve many problems,  I listed the three most popular use cases Evernote users have below.

### Organizing Paperwork
A common task I find myself solving with Evernote is digitalizing and organizing paper work like invoices, business cards, letters, appointments etc.
People who have been organized before the digital age, have put these papers into folders (the real ones) and labelled them properly. With the computer the next approach was to scan the papers and with the Smartphone I can simply take a photo and it is stored and cannot be forgotten.
Evernote improves this workflow even more by cropping the picture and adjusting the contrast and brightness, so that it looks like a decent scan. You label the note and tag it appropriatly and voilà: you got organized.

If we take a step back we notice, that this isn't actually note taking, this is about organizing and labelling resources. We are actually adding metadata like a Date, Place, Name and Tags to a digital file.

### Archiving the Web
Evernote keeps everything I've read and liked on the web and makes it searchable.
If I mark something on feedly it goes to Evernote, if I've read an interesting article on Pocket it goes to Evernote, if I've discovered an awesome website or article it goes to Evernote as well.

We're collecting and referencing external resources and adding metadata to it, so it is archived and we can go back to it later to enhance the information even more.

### Actual Note Taking and alot of Edge Cases
The more you add, the more useful Evernote becomes. I add everything that comes to my mind and might be useful for later to Evernote. Wether I am working on a project and have to take notes or studying and writing a quick outline of a lecture: I am creating actual content and enhancing it with metadata.

### Overview
![Workflows with Evernote](/media/evernote_flows.png)

## What are notes?
What we actually need, is a system that holds together all that loose information and enhances it with metadata.
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
You don't need a feature-rich text processor like word for notetaking, but you still want some control over the text. Markdown is perfect for the task, it can be customized to work perfectly with the ressource concept defined above and it has many great open source editors already available.

### Metadata
To store the metadata associated with the note, I suggest an approach that is used in Jekyll and is called [Front Matter](http://jekyllrb.com/docs/frontmatter/). Front Matter means every file does have a YAML Header containing metadata.

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

### Example
Example of a note with a short remark to a photo of an invoice.
{% highlight yaml %}
---
title: Invoice
date: 2010-02-11 11:02:57
geo: +48.8577, +002.295
tags: invoice, finance
---
Remember to pay the bill!
![Image from Dropbox](dropbox://Camera-Uploads/invoice.jpg)
{% endhighlight %}

### Synchronizing the note itself
For a notetaking solution it is important to have the notes (and ressources) available on every device.
For synchronizing the notes with each other I wan't to prevent a standard server-client setup, as the average notetaker doesn't always have a server at hand. That's why I want to use the Bit Torrent Sync API to synchronize the notes.
As a conflict resolution strategy I would like to have an auto-merge approach like Version Control Systems have. This approach shouldn't be to difficult to implement, as the note structure is so simple.

## Editing Excperience
The resulting HTML from Markdown is perfect for viewing your notes on any device.  The big problem is that casual users probably won't accept bare metal markdown editor like [Dillinger](http://dillinger.io/) or [StackEdit](https://stackedit.io/) even though they are absolutely lovely.
What you need is a Visual Editor, because for notes you immediately want to see the end result. [Simplenote](http://simplenote.com/) and [Texts](http://www.texts.io/) are good examples for visual editors. What would also work is something like [Macchiato](http://getmacchiato.com/), which let's you edit real markdown but also give's you a visual hint.

Perhaps most important is, that you always see the preview of your images of files, wether your viewing or editing the note.

### Opensource Visual Editors
Sadly there are no Open Source visual editors on the market (except for the Web, but those work with the HTML InlineEdit feature).

So either one has to build something like that or use a baremetal markdown editor.

#### Technical References
- [HalloJs](http://hallojs.org/demo/markdown/): Javascript editor that performs conversion of HTML into Markdown back and forth and is previewing it live.
- [Mashable](http://mashable.com/2013/06/24/markdown-tools/ "Mashable Markdown Tools"): An overview of Markdown tools and products
- [MarkdownView](http://gun.io/blog/markdown-view-for-android/): A Markdown viewer for Android
- [EpicEditor](http://oscargodson.github.io/EpicEditor/): Javascript MarkDown Dropin for websites.
- [HNotes](https://play.google.com/store/apps/details?id=com.hly.notes): Android Rich Text notetaking App


