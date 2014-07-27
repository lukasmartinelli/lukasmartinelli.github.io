---
title: Transparent Hosting of Opensource Software
layout: post
published: false
tags:
  - cloud
  - opensource
  - cryptography
  - docker
categories: idea
---

The internet has a trust problem. When we shifted away from desktop applications
to server based websites we also now need to trust the Application hoster.

The the problem I want to solve is this post is the following:

    How do you know, what code your SaaS provider is running?

When you connect to a server, you verify with certificates that the host responding,
is indeed the server you're meant to connect.

...all crap above

There are some web application which take user privacy serious. But how can you really provide
a transparent service to your user?

Let's assume you want to host the next Lavabit, or the newly created Protonmail, software
which biggest selling point is user privacy. But how do you know what they are effectively running
on their server? You have to trust the provider and let's even say they are good people who
really want to protect you from 3rd parties (like the government).

Usually they can provide security along two attack vectors:
- Connection is done via a secure channel
- Data is stored encrypted

Now the problem is that you have to trust that their doing this. How can you be sure that
they are effectively doing this? They simply have to use Opensource and now you can inspect
their code for bugs, malicous intent and check the privacy concerns.

However, even though their Software is Opensource, you have no guarantee, that they are effectively
running this version. Is it possible to verify that a server is indeed using the specified Code?

Perhaps..perhaps not.

### Requirements

#### Open Source Repository
All your Code and process necessarily need to be Open Source. They should be hosted on a 3rd party
repository like Github or Bitbucket, which users can trust.
Releases have to be signed by the developers and therefore a user can now, which version of the software
should run on the server.

#### Deployment
To make sure that the state of deployed system is as expecting, your best of with using a container technology
like Docker. The deployment system pushes your code to the server and therefore knows the current state of the system.

Now if the host has control of the application server, we can't be sure whether he or a hacker mutated the state.
This is the tricky part: How can we verify that the system state has not changed.

With a container it is simple: we calculate a hash for the content of the container and compare it with the
original hash in the release.
Then we communicate the hash to the user and he can compare it with release.
But we have total control of the server.. so we could just send the hash they were expecting?
We need a 3rd party here, like HTTPS uses the CA's to take care of certificate trust.
Let's call this CCA for Code Certificate Authority, which basically verifies that a piece of code has not changes.

One way to realize it is, that the Container just calculates the hash of itself.



