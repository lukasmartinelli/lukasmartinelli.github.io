---
layout: post
title: Getting started with CoreOS on CloudStack
tags:
  - cloud
  - coreos
  - cloudstack
categories: cloud
published: false
---

Installation guide how to install CoreOS on a CloudStack system.

CoreOS allow a bunch of [different installation method](http://coreos.com/docs/running-coreos/platforms).
The easiest way to install CoreOS is using an ISO to bootstrap the installation.

Visit the [CoreOS ISO installation page](http://coreos.com/docs/running-coreos/platforms/iso/) and copy the
link for the latest beta ISO.

http://beta.release.core-os.net/amd64-usr/current/coreos_production_iso_image.iso

Go to templates, select ISO in the view dropdown and register a new ISO.

![Select ISP page](/media/cloudstack/select-iso-page.png)

CoreOS is only meant to be installed on 64bit machines and it is crucial that you choose
`Other (64bit)` in the OS Type field. Don't use `Other Linux (64bit)`, this will fail when booting from
the ISO. Paste the previously copied link into the URL field. In my case this is:
[http://beta.release.core-os.net/amd64-usr/current/coreos_production_iso_image.iso](http://beta.release.core-os.net/amd64-usr/current/coreos_production_iso_image.iso)
Make sure you've selected Bootable.

![Register new ISO](/media/cloudstack/register-iso.png)

Now you should see your newly created ISO.
Let's create an instance and attach that ISO to it.

![Create instance from ISO](/media/cloudstack/create-instance-setup.png)


![Select CoreOS ISO](/media/cloudstack/create-instance-template.png)

Make sure to select at least 512 MB Ram.

![Select instance size](/media/cloudstack/create-instance-compute.png)

Use the disk size for the root image to be installed.

![Add additional storage](/media/cloudstack/create-instance-data-disk.png)
![Select instance network](/media/cloudstack/create-instance-network.png)
![Review and start instance](/media/cloudstack/create-instance-review.png)

Check network connectivity because you need internet access to download
the CoreOS production image.
Now you have to create a cloud config and therefore login via SSH.
Because you can't paste something in the web console.

To login via SSH I first tried to find out or set the password for
the current `core` user. They only allow authentication via SSH keys which is
great from a security perspective but makes the installation work a bit more
complicated.

We need to create a cloud config and include our SSH key there.
Because we cannot paste something in the web console and I don't trust myself
typing a SSH fingerprint by hand the best method is to use your Github keys!

First create a `cloud-config.yaml` file:
```
#cloud-config

users:
  - name: <user name>
    coreos-ssh-import-github: <your github username>
```

Now let's bootstrap the installation on `/dev/sda`:
```
sudo coreos-install -d /dev/sda -C beta -c cloud-config.yaml
```

Now we stop the instance and detach the ISO.
If we restart the VM it uses the newly created disk as a boot image.
Let's connect with the web console to inspect the state: You should be prompted with a login.

Because you added your Github keys you should be able to connect for any of your machines you
used with Github before.

```
ssh lukasmartinelli@<ip>
```

Now this somehow did not work for me :)
So i use a method where I manually generate a hashed password.
```
openssl passwd -1 > cloud-config.yaml
```

And now I edit my cloud-config.yaml to look like this:
```
#cloud-config

users:
  - name: <user name>
    passwd: <hashed password>
```

This is a very complicated method of doing things, you can also boot a live ISO image of ubuntu where you can
probably ssh in and install CoreOS like this.

Now we stop the instance and detach the ISO.
If we restart the VM it uses the newly created disk as a boot image.
Let's connect with the web console to inspect the state: You should be prompted with a login.

Login via SSH and type in your password:

```
ssh lukasmartinelli@<ip>
```

This did not work either so I used a CentOS live image where at least I could ssh into and paste my
SSH fingerprint.
I used a Finnix rescue live image because this was one of the few live ISOs available at my provider.

Now you should stop the image.

Let's create a new VM with that existing image in order to test.
Now you have a usable template to kickstart your  CoreOS vms.


