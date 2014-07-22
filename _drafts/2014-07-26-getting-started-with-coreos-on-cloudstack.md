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

Like many others I am amazed about the power and possibilities that Linux Containers (LXC) provide. The easiest tool to use LXC is Docker which provides all the tools necessary to quickly get productive. If you take the Docker doctrine of virtualization to the extreme, you'd want to virtualize every single applications and as a result no longer need a fully fledged OS on your VMs: CoreOS is a minimal, modern operating system which allows easy management and deep integration with docker containers, in my view it might be the next big thing (together with DockeR) in cloud computing.

So I wanted to try out CoreOS on [my new IAAS provider](http://iwstack.com/) that I'm trying out, which is based on Apache Cloud Stack. While CoreOS provides many [different installation methods](http://coreos.com/docs/running-coreos/platforms), they missed out on CloudStack and there is not much documentation about it.

There are several approaches how to create a CoreOS template that can be used to create new VMs.

## Booting the CoreOS image
The easiest way to install CoreOS is using an ISO to bootstrap the installation.

### Register CoreOS ISO
Visit the [CoreOS ISO installation page](http://coreos.com/docs/running-coreos/platforms/iso/) and copy the link for the [latest beta ISO]((http://beta.release.core-os.net/amd64-usr/current/coreos_production_iso_image.iso)).
Now go to templates, select the ISO view in the dropdown and register a new ISO.

![Select ISP page](/media/cloudstack/select-iso-page.png)

CoreOS is only meant to be installed on 64bit machines and **it is crucial that you choose `Other (64bit)` as OS Type**. Don't use `Other Linux (64bit)`: this will fail when booting from the ISO. Make sure you've selected `Bootable` and paste the previously copied link to the ISO in the URL field.

![Register new ISO](/media/cloudstack/register-iso.png)

Now you should see your newly created ISO.

### Booting the ISO

Let's create an instance and attach that ISO to it. You have to choose ISO as a template.

**Note:** A CloudStack template is meant to completly boostrap a new server with an Operating System that is prepared to run on CloudStack (for example by using the CloudStack tools to reset the root password) while an ISO is booted with tools like PXE and let you do stuff like install an Ubuntu Server or rescue data.

![Create instance from ISO](/media/cloudstack/create-instance-setup.png)

Now select your registered ISO. If it does not appear yet, you might have to reload the page and restart the wizard.

![Select CoreOS ISO](/media/cloudstack/create-instance-template.png)

Make sure to select at least 512 MB Ram to boot the image. I've tried with 360 MB and it does not seem to work.

![Select instance size](/media/cloudstack/create-instance-compute.png)

The disk size you choose now is for the root image we install CoreOS too. Because CoreOS is a very slick operating system 5GB does suffice.

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