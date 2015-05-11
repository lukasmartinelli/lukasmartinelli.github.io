---
layout: post
title: Simple Stateful Services with CoreOS and AWS
tags:
  - coreos
  - fleet
  - docker
  - aws
categories: cloud
published: true
---

A simple guide how to create stateful service with [CoreOS fleet](https://coreos.com/using-coreos/clustering/) and [AWS volumes](https://aws.amazon.com/ebs/).
If you need to run a stateful service which does not need to be highly available
this guide will get you up to speed.

The goal is to setup a Postgres container writing to an AWS EBS volume.
If one host goes down we can mount the EBS volume to a different host
and restart the Postgres container. While this is not highly available it is
fault tolerant and easy to manage because not many components are involved.

Below you see a visualization of the Postgres
container `postgres@vol-5afc0745` running on `core1`.
The EBS volume `vol-5afc0745` is attached to `core1` as `/dev/xvdb`.
Once `core1` goes down we need to reattach `vol-5afc0745` to
`core2` and restart `postgres@vol-5afc0745`.

![Docker volume migration](/media/docker_volume_migration.gif)

## Create the Service

We will be using the [official postgres image](https://registry.hub.docker.com/_/postgres/)
in our service file.  This container mounts `/data/postgres` to the Postgres data directory
and therefore requires the `data-postgres.mount` unit being activated.
It also cannot run together with other Postgres instances because there exists
only one `/data/postgres` mountpoint.

Because our service is not stateless we cannot schedule it on
every machine. The fleet `MachineMetadata` directive allows us
to constrain the possible hosts a service is allowed to run.
Using the fleet templating feature we restrict this service to run
only on hosts with the Metadata key `postgres` matching the service prefix.

I stripped out useful timeouts from the service file below to make
it more readable.

```bash
[Unit]
Description=PostgreSQL
After=docker.service
Requires=docker.service

[Service]
ExecStartPre=/usr/bin/docker pull postgres:9.4
ExecStart=/usr/bin/docker run --name postgres-%i \
-v /data/postgres:/var/lib/postgresql/data \
-e POSTGRES_PASSWORD=axti31lxb4123xhqaef355hh8ys \
-p 5432:5432 \
-t postgres:9.4

[X-Fleet]
MachineMetadata="postgres=%i"
Conflicts=postgres*
```

Now we need to create a templated unit. I like to use soft links
to easily reschedule the services.
This templated unit now runs only on EC2 hosts where the
volume `vol-5afc0745` has been attached to.

```bash
ln -s postgres@.service postgres@vol-5afc0745.service
```

## Create a Volume

In AWS create an empty volume in your availability zone.

![AWS create volume](/media/create_volume.png)

Attach it as `/dev/xvdb` to the running CoreOS instance.

![AWS attach volume](/media/attach_volume.png)

## Format Volume

On the CoreOS instance check whether the volume has been mounted with `lsblk`.
You should seee `/dev/xvdb` with an empty mountpoint.

```bash
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
xvdb    202:16   0   50G  0 disk
```

Now format the volume with the filesystem of your choice.
For this example I will [use BTRFS](http://www.palepurple.co.uk/filesystem-magic-aws-ebs-volumes-btrfs).

```bash
mkfs.btrfs -L PostgreSQL /dev/xvdb
```

Now power down the CoreOS node because we are going to modify the cloud config file.

## Modify Cloud Config

Because we don't want our stateful service on which other services might depend on
to go down at random we turn off CoreOs automatic updates.

```yaml
coreos:
  update:
    reboot-strategy: off
```

Now that we formated `/dev/xvdb` we need to mount it at startup.
The unit needs to be called `data-postgres.mount` according to the
path it is mounted to.

```yaml
  units:
    - name: data-postgres.mount
      command: start
      content: |
        [Mount]
        What=/dev/xvdb
        Where=/data/postgres
        Type=btrfs
```

Now modify the Metadata to let the fleet scheduler know
that the volume has been attached.

```yaml
  fleet:
    metadata: postgres=vol-c65cfad5
```

Now start the Machine and ssh into it after it is ready.
Check whether the `data-postgres.mount` service is up and running.

```bash
systemctl status data-postgres.mount
```

If you execute `lsblk` you should see your `/dev/xvdb` correctly mounted
to `/data/postgres`.

```bash
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
xvdb    202:16   0   50G  0 disk /data/postgres
```

## Run Service

Now start the PostgreSQL service and watch it startup successfully.

```bash
fleetctl start postgres@vol-5afc0745
fleetctl journal --follow postgres@vol-5afc0745
```

You might want to register the PostgreSQL server into etcd
so other services can query it.

```bash
ExecStartPost=/usr/bin/etcdctl set /postgres/host ${COREOS_PRIVATE_IPV4}
ExecStartPost=/usr/bin/etcdctl set /postgres/port 5432
ExecStopPost=/usr/bin/etcdctl rm --recursive /postgres
```

## Use Service

If you have other apps using your stateful service you can now
query the information from etcd.

Below is an example of a Django container connecting to our postgres service.

```
ExecStart=/bin/sh -c 'docker run --rm -m 256m --name django-app \
-e DB_NAME=django_app \
-e DB_USER=postgres \
-e DB_PASSWORD=axti31lxb4123xhqaef355hh8ys \
-e DB_HOST=$(etcdctl get /dreicloud/postgres/host) \
-e DB_PORT=$(etcdctl get /dreicloud/postgres/port) \
-p 6001:8000 -t random/django-app:latest'
```

## Next steps

You now know the basics of creating stateful service on CoreOS. It will be interesting to improve this design once AWS EFS will come out. You might also
create automatic attaching of EBS volumes instead of doing it by hand.
