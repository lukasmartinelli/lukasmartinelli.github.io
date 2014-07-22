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

The disk size you choose now is for the root image we install CoreOS too. Because CoreOS is a very slim operating system 5GB does suffice.

![Add additional storage](/media/cloudstack/create-instance-data-disk.png)

Now select your instance network. You need access to the servers of CoreOS to pull down the image, so you have to connect to network with access to the internet.

![Select instance network](/media/cloudstack/create-instance-network.png)

Set a good hostname and ramp up the VM!

![Review and start instance](/media/cloudstack/create-instance-review.png)

Now connect with the web console (because you won't get SSH with the CoreOS image) and check network connectivity.

### Installing to Disk

This step is analogous to what is [described in the CoreOS docs](https://coreos.com/docs/running-coreos/bare-metal/installing-to-disk/). Because we've booted the CoreOS image we have everything needed to install CoreOS to disk.

Now the first thing we have to do is creating a cloud config. This is executed at first start and if you don't create one you won't be able to login in via the web console or connect via SSH. [Cloud config](http://coreos.com/docs/cluster-management/setup/cloudinit-cloud-config/) is the CoreOS version of [cloud init](http://cloudinit.readthedocs.org/en/latest/) (used by OpenStack and AWS) and only implements a subset cloud init's functionalities.

In the cloud config you have to define how you want to authenticate.

### Use your Github SSH keys to authenticate

Sadly you can't paste something in the web console! I don't want to type a whole SSH fingerprint into the console so the quickest and most comfortable option is to simply import your SSH fingerprints of your Github Account.

Create a `cloud-config.yaml` file:
```
#cloud-config

users:
  - name: deploy
    coreos-ssh-import-github: lukasmartinelli
```
The first line `#cloud-config` is required even though it is a comment. Don't leave it out. Below `users` you can define the users to create on the system (I always use a special `deploy` user) and set the `coreos-ssh-import-github` option along with your Github username.

### Configure SSH fingerprint

Afterwards I wanted to restrict access to a single SSH fingerprint and this proved to be quite difficult because again, you can't simply paste the fingerprint.
You also cannot set the password for the `core` user with `passwd` and connect via SSH because you can only authenticate via SSH (which is
great from a security perspective but makes the installation work a bit more
complicated).

If you're web console supports copy and paste this is not a problem for you but I ended up so desperate, that I booted a Finnix Rescue ISO, downloaded the [CoreOS installation script](https://raw.github.com/coreos/init/master/bin/coreos-install) and connected with SSH to propertly configure my `cloud-config.yaml`.

You could also create a Gist, paste your SSH key there and use `curl` to get the SSH fingerprint on your server.

But now create a `cloud-config.yaml` file:
```
#cloud-config

ssh_authorized_keys:
  - ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDPF+tdQM.....Xds3 me@lukasmartinelli.ch
```

### Install with coreos-install
Now let's bootstrap the installation on the attached disk `/dev/sda`:
```
sudo coreos-install -d /dev/sda -C beta -c cloud-config.yaml
```
This will install everything needed. You can also specify to use the CoreOS alpha channel with `-C alpha`.

### Detach and reboot
After `coreos-install` has succeeded stop the instance and afterwards detach the ISO.
If we restart the VM it now uses the newly created disk as a boot image. Connect to the web console to inspect the state and you should be prompted with a login.

### Connect and be happy
Because you added your Github keys you should be able to connect for any of your machines you used with Github before or if you've explicitely specified an SSH key you an also use that. You find the IP of your machine under the NIC section if you click on your running instance.
```
ssh deploy@188.164.131.234
```

If you are not happy with your cloud config you can tweak it at `/var/lib/coreos-install/userdata`. If everything is set, stop the VM and select the quick actions of your stopped VM.


Let's create a new VM with that existing image in order to test.
Now you have a usable template to kickstart your  CoreOS vms.