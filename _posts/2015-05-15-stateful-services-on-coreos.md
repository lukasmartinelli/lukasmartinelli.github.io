---
layout: post
title: Simple Stateful Services with CoreOS and AWS
tags:
  - coreos
  - fleet
  - docker
  - aws
  - postgres
categories: cloud
published: true
---

A simple guide how to create a stateful service with [CoreOS fleet](https://coreos.com/using-coreos/clustering/) and [AWS volumes](https://aws.amazon.com/ebs/).
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

You need to create a [unit file](https://coreos.com/docs/launching-containers/launching/fleet-unit-files/) template `postgres@.service`.
Inside a template you can use `%i` to capture the value after the `@`.
If you start the service `postgres@vol-5afc0745.service` then the `%i` specifier
will resolve to `vol-5afc0745`.

We are using the [official postgres image](https://registry.hub.docker.com/_/postgres/).
This container mounts `/data/postgres` to the PostgreSQL data directory
and therefore requires the `data-postgres.mount` unit being activated.
We prevent the unit from being collocated with other PostgreSQL instances
with the `Conflicts` option because there exists
only one `/data/postgres` mountpoint.

Because our service is not stateless we cannot schedule it on
every machine. The fleet `MachineMetadata` option allows us
to constrain the possible machines a service is allowed to run on.
Using the fleet templating feature we restrict this service to run
only on machines with a `postgres` entry that matches the `%i` systemd specifier.

I stripped out useful timeouts from the service file below to make
it more readable.

```bash
[Unit]
Description=PostgreSQL
After=docker.service
Requires=docker.service
After=data-postgres.mount
Requires=data-postgres.mount

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
This templated unit now only runs on EC2 hosts where the
volume `vol-5afc0745` has been attached to.

```bash
ln -s postgres@.service postgres@vol-5afc0745.service
```

## Create the Volume

In AWS create an empty volume in your availability zone.

![AWS create volume](/media/create_volume.png)

Attach it as `/dev/xvdb` to the running CoreOS instance.

![AWS attach volume](/media/attach_volume.png)

On the CoreOS instance check whether the volume has been mounted with `lsblk`.
You should see `/dev/xvdb` with an empty mountpoint.

```bash
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
xvdb    202:16   0   50G  0 disk
```

Now [format the volume](Linxu formatting link) with the filesystem of your choice.
For this example I will [use BTRFS](http://www.palepurple.co.uk/filesystem-magic-aws-ebs-volumes-btrfs).

```bash
mkfs.btrfs -L PostgreSQL /dev/xvdb
```

Now power down the CoreOS node because we are going to modify the [cloud config file](https://coreos.com/docs/cluster-management/setup/cloudinit-cloud-config/).

## Modify Cloud Config

You can change the cloud config of a CoreOS machine by changing the user data
in AWS.

![Modify user data](/media/change_userdata.png)

Because we don't want our stateful service to go down at random we 
[turn off CoreOs automatic updates](https://coreos.com/docs/cluster-management/setup/update-strategies/).

```yaml
coreos:
  update:
    reboot-strategy: off
```

Now that we formatted `/dev/xvdb` we need to [mount it at host startup](http://www.freedesktop.org/software/systemd/man/systemd.mount.html).
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
    metadata: postgres=vol-5afc0745
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

Check if the metadata is set correctly with `fleetctl list-machines`.
You should see your machine with the attached volume name as metadata.

```bash
MACHINE         IP              METADATA
8886bfe9...     10.0.1.72       vol-5afc0745
```

## Run Service

Now start the PostgreSQL service and watch it startup successfully.

```bash
fleetctl start postgres@vol-5afc0745
fleetctl journal --follow postgres@vol-5afc0745
```

You might want to register the PostgreSQL server into [etcd](https://coreos.com/docs/distributed-configuration/getting-started-with-etcd/)
so other services can query it.

```bash
ExecStartPost=/usr/bin/etcdctl set /postgres/host ${COREOS_PRIVATE_IPV4}
ExecStartPost=/usr/bin/etcdctl set /postgres/port 5432
ExecStopPost=/usr/bin/etcdctl rm --recursive /postgres
```

Make sure your [security group](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_SecurityGroups.html) allows inbound connections for port `5432`. 

## Query Database

We can now spin up a [dev tools container](http://www.hokstad.com/docker/patterns) and connect to our database.

```bash
docker run --rm -it dreipol/ops-tools
```

Using the docker image `dreipol/ops-tools` you can use the excellent [pgcli](http://pgcli.com/)
to connect to your PostgreSQL server.

```
pgcli -h 10.0.0.230 -U postgres
```

If you don't like the terminal you can use my [pgstudio container](link to pgstudio) for a graphical interface.

```
docker run --rm -p 8080:8080 lukasmartinelli/pgstudio
```

![Pgstudio](/media/pgstudio.png)

## Use Service

If you have other apps using your stateful service you can now
query the information from etcd.  Below is an example of a Django container connecting to our PostgreSQL server.

```bash
docker run --rm -m 256m --name django-app \
-e DB_NAME=django_app \
-e DB_USER=postgres \
-e DB_PASSWORD=axti31lxb4123xhqaef355hh8ys \
-e DB_HOST=$(etcdctl get /dreicloud/postgres/host) \
-e DB_PORT=$(etcdctl get /dreicloud/postgres/port) \
-p 6001:8000 -t random/django-app:latest
```

## Conclusion

**Advantages over traditional setup:**

- Allows you to schedule a stateful service in your existing CoreOS cluster
- No need for deployment tools like [Puppet](https://puppetlabs.com/) or [Ansible](http://www.ansible.com/home).
- Easy failure recovery and backups with [EBS snapshots](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-creating-snapshot.html)
- All Docker advantages like easy installation of newer or older versions

**Next steps:**

You now know the basics of creating stateful service on CoreOS.
There are alot of other options like the recently announced [AWS EFS](https://aws.amazon.com/efs/) or [Flocker](https://github.com/ClusterHQ/flocker).
For higher availability you might also [reattach volumes automatically](https://github.com/SeanBannister/aws-helper-scripts/blob/master/bin/i-attach-volume) once
the Postgres container starts up.
Or you might also create daily database backups [explained here](https://github.com/colinbjohnson/aws-missing-tools/tree/master/ec2-automate-backup).
