---
layout: post
title: Simple Stateful Services with CoreOS and AWS
tags:
  - coreos
  - fleet
  - docker
categories: cloud
published: true
---

A simple guide how to create stateful service with CoreOS fleet
and AWS volumes.

```
touch influxdb@.service
ln -s influxdb@.service influxdb@vol-bfdcbfa8.service
fleetctl list-machines | grep vol-bfdcbfa8
fleetctl start influxdb@vol-bfdcbfa8.service
```

## Create the Service

We want to create a stateful Postgres service using the
official postgres image. An introduction about creating services
with Systemd and Fleet can be found [here](https://coreos.com/docs/launching-containers/launching/getting-started-with-systemd/).

I stripped out useful timeouts from the service file below to make
it more readable.

```
[Unit]
Description=PostgreSQL
After=docker.service
Requires=docker.service

[Service]
ExecStartPre=/usr/bin/docker pull postgres:9.4
ExecStart=/usr/bin/docker run --name postgres-%i \
-v /data/postgres:/var/lib/postgresql/data \
-e POSTGRES_PASSWORD=a325haxh8ys \
-p 5432:5432 \
-t postgres:9.4

[X-Fleet]
MachineMetadata="postgres=%i"
Conflicts=postgres*
```

This container mounts `/data/postgres` and therefore is not stateless.
It also cannot run together with other Postgres instances because there exists
only one `/data/postgres` mountpoint.

A simple pattern how to schedule stateful services on CoreOS
using the Fleet templating feature.

Because our service is not stateless we cannot schedule it on
every machine. The fleet `MachineMetadata` directive allows us
to constrain the possible hosts a service is allowed to run.

A good pattern is to use the name of the application as Metadata key
and then the dependent ressource as value.

```
```

## Create a Volume

In AWS create an empty volume in your availability zone.  
Attach it as `/dev/xvdb` to the running CoreOS instance.

## Format Volume

On the coreos instance check whether the volume has been mounted with `lsblk`.
You should seee `/dev/xvdb` with an empty mountpoint.

Now format the volume. I like BTRFS alot so I use that.

```
mkfs.btrfs -L PostgreSQL /dev/xvdb
```

Now power down the CoreOS node because we are going to modify the cloud config file.

## Modify Cloud Config

This is advised against but because I don't want my stateful service to go
down at random I turn off CoreOs automatic updates.

```yaml
coreos:
  update:
    reboot-strategy: off
```

Now add a mount service.

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

Now modify the Metadata to register the volume.

```yaml
  fleet:
    metadata: postgres=vol-c65cfad5
```

Now start the Machine and ssh into it after it is ready.
Check whether the `data-postgres.mount` service is up and running.

```
systemctl status data-postgres.mount
```

## Start the service:w

When should you do it:

What this is not:
- Fault tolerant
- Highly Available


This is not a guide to build fault tolerant and highly available stateful services
but a pattern to setup non critical infrastructure.

Alot of non cloud native stateful applications are very hard to scale vertically.
Setting up a Postgres Cluster usually requires alot of work and if you want all of
that in the wonderful world of CoreOS it is even more work.

If you schedule a fleet unit on the cluster you set restrictions
on machine metadata where to schedule the container.

But you can also template the restrictions and therefore create
services that are bound to a single host.

If you are running CoreOS on AWS 

I am very excited about EFS. This could make it even easier.

## How to schedule a cluster

Clustering is mostly very unique to the relevant services.
In Postgres it is really hard while for Redis and MongoDB it
is somewhat easier.

I will show you how to do it for the example of influxdb.

You could also use a machine id.

## Attach Disks

```
ssh core@123.61.23.14
lsblk
mkfs.btrfs /dev/xvdb
```


## System Metrics

In addition to collecting logs you also want to be informed about the state of your cluster.


```
[Unit]
Description=InfluxDB
After=docker.service
Requires=docker.service

[Service]
User=core
EnvironmentFile=/etc/environment
TimeoutStartSec=10m
Restart=always
RestartSec=10s
ExecStartPre=-/usr/bin/docker kill %p-%i
ExecStartPre=-/usr/bin/docker rm -f %p-%i
ExecStartPre=/usr/bin/docker pull tutum/influxdb
ExecStart=/usr/bin/docker run --name %p-%i \
-v /data/influxdb:/data -m 2048m \
-p 8083:8083 \
-p 8086:8086 \
-p 8090:8090 \
-p 8099:8099 \
-e PRE_CREATE_DB=dreicloud \
-t tutum/influxdb
ExecStartPost=/usr/bin/etcdctl set /dreicloud/influxdb/host ${COREOS_PRIVATE_IPV4}:8086
ExecStop=/usr/bin/docker stop -t 2 %p-%i
ExecStopPost=/usr/bin/etcdctl rm /dreicloud/influxdb/host

[X-Fleet]
MachineMetadata="data=%i"
```

Fleet can also be restricted to schedule a unit always to th same machine. However this is not the same.


