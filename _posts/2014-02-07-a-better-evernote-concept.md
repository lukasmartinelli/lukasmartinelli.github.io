---
layout: post
published: true
tags: 
  - idea
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

### Notes with References
A note is basically just a metadata container with text remarks to external references.

![Notes that use references instead of embedded content](/media/notes_with_references.png)

## Notes with Embedded References
With the concept of references, you could also reference ressources embedded in the note. Please note that the rich text in the note is not mapped as a ressource, it is always directly in the note itself, for the sake of simplicity.

The biggest problem of using references to external ressources is, that files can change their location. This is a very convincing reason to use embedded references but this would also make accessing these files for other services very impractical and increases the complexity of a syncing mechanism.

## Concept of ressources
Every ressource is addressed with an URI.
For websites this will look very familiar.

Now wether a user is on a phone or on it's computer, provided he does have access to a dropbox file, he can access that ressource.

If you use the file uri file:// you can only access it if it s at that exact location of your computer.

Supported schemas:
Note
Http
Dropbox
File
Bittorrent Sync





