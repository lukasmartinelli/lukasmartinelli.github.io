---
layout: post
title: Monitor CoreOS cluster
tags:
  - data
  - github
  - ci
categories: cloud
published: true
---

I am currently migrating all our services at Dreipol to a CoreOS cluster.
What was missing was some monitoring. There are a few paid options out there
like Datadog, which has quite good monitoring support but is just too expensive.

Should you really host metrics monitoring yourself?
I think not but there weren't any alterntives out there that provided the same flexibility
and price. Log management is actually much pricier for me.

## Log Management

CoreOS log management is a bit different from other systems because everything 
gets logged by journald. Instead of forwarding syslog or files we need to forward
mostly log messages from docker containers.

## Logentries

Logentries is a very simple service and I like that about it.
It is basically a managed Elastic Search server with a simple querying interface.
I create one Log file per cluster.

```
[Unit]
Description=Forward Systemd Journal to logentries.com

[Service]
TimeoutStartSec=0
ExecStartPre=-/usr/bin/docker kill journal-2-logentries
ExecStartPre=-/usr/bin/docker rm journal-2-logentries
ExecStartPre=/usr/bin/docker pull quay.io/kelseyhightower/journal-2-logentries
ExecStart=/usr/bin/bash -c \
"/usr/bin/docker run --name journal-2-logentries \
-v /run/journald.sock:/run/journald.sock \
-e LOGENTRIES_TOKEN=81048aad-4acb-4b11-8b6a-c57fba0943aa \
quay.io/kelseyhightower/journal-2-logentries"

[X-Fleet]
Global=true
```



## System Metrics

In addition to collecting logs you also want to be informed about the state of your cluster.



## Influxdb

Influxdb is a time series db.

Setup a persistent service.

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

## Grafana

Grafana dashboard.

```
[Unit]
Description=grafana
After=docker.service
Requires=docker.service

[Service]
EnvironmentFile=/etc/environment
TimeoutStartSec=10m
Restart=always
RestartSec=10s
ExecStartPre=-/usr/bin/docker kill grafana
ExecStartPre=-/usr/bin/docker rm -f grafana
ExecStartPre=/usr/bin/docker pull tutum/grafana
ExecStart=/usr/bin/bash -c 'docker run --name grafana \
-p 8090:80 \
-e HTTP_USER=admin \
-e HTTP_PASS=admin \
-e INFLUXDB_HOST=influxdb.dreicloud.ch \
-e INFLUXDB_PORT=8086 \
-e INFLUXDB_NAME=dreicloud \
-e INFLUXDB_USER=root \
-e INFLUXDB_PASS=root \
-e INFLUXDB_IS_GRAFANADB=true \
-t tutum/grafana'
ExecStartPost=/usr/bin/etcdctl set /dreicloud/load-balancer/subdomains/grafana/${COREOS_PRIVATE_IPV4} ${COREOS_PRIVATE_IPV4}:8090
ExecStop=/usr/bin/docker stop -t 2 grafana
ExecStop=/usr/bin/etcdctl rm --recursive /dreicloud/load-balancer/subdomains/grafana/

[X-Fleet]
MachineMetadata="type=spot"
```

## Sysinfo

Log normal system metrics.

```
[Unit]
Description=Log system metrics to InfluxDB

[Service]
User=core
Restart=always
RestartSec=120s
EnvironmentFile=/etc/environment
ExecStartPre=/usr/bin/bash -c 'wget -P /home/core/bin -nc https://github.com/novaquark/sysinfo_influxdb/releases/download/0.5.3/sysinfo_influxdb && chmod +x /home/core/bin/sysinfo_influxdb'
ExecStart=/usr/bin/bash -c '/home/core/bin/sysinfo_influxdb --fqdn -D \
-h $(etcdctl get /dreicloud/influxdb/host) \
-u root -p root \
-d dreicloud -P $(hostname)'

[Install]
WantedBy=multi-user.target

[X-Fleet]
Global=true
```

## Cadvisor

Cadvisor collects metrics from containers.
Heapster could be used for monitoring but for my case it did not work.
Instead I setup my own monitoring and I am quite happy with it.

```
[Unit]
Description=cadvisor
Requires=docker.socket
After=docker.socket

[Service]
User=core
Restart=always
RestartSec=120s
EnvironmentFile=/etc/environment
ExecStartPre=-/usr/bin/docker kill %p
ExecStartPre=-/usr/bin/docker rm %p
ExecStartPre=/usr/bin/docker pull google/cadvisor:latest
ExecStart=/usr/bin/bash -c 'docker run --rm \
--volume=/:/rootfs:ro \
--volume=/var/run:/var/run:rw \
--volume=/sys:/sys:ro \
--volume=/var/lib/docker/:/var/lib/docker:ro \
--publish=8080:8080 \
--name=%p -t google/cadvisor:latest \
--logtostderr \
-storage_driver=influxdb \
-storage_driver_db=dreicloud \
-storage_driver_table=$(hostname).container \
-storage_driver_host=$(etcdctl get /dreicloud/influxdb/host)'
ExecStopPost=-/usr/bin/docker rm -f %p

[Install]
WantedBy=multi-user.target

[X-Fleet]
Global=true
```

## Fleet UI

```
s[Unit]
Description=fleet-ui
After=docker.service
Requires=docker.service

[Service]
EnvironmentFile=/etc/environment
ExecStartPre=-/usr/bin/docker kill %p
ExecStartPre=-/usr/bin/docker rm %p
ExecStartPre=/usr/bin/docker pull purpleworks/fleet-ui:0.1.10
ExecStart=/usr/bin/docker run --rm --name %p -e ETCD_PEER=${COREOS_PRIVATE_IPV4} -p 8700:3000 -t purpleworks/fleet-ui:0.1.10
ExecStartPost=/usr/bin/etcdctl set /dreicloud/load-balancer/subdomains/fleet-ui/${COREOS_PRIVATE_IPV4} ${COREOS_PRIVATE_IPV4}:8700
ExecStop=/usr/bin/docker stop %p
ExecStopPost=/usr/bin/etcdctl rm --recursive /dreicloud/load-balancer/subdomains/fleet-ui/

[Install]
WantedBy=multi-user.target

[X-Fleet]
MachineMetadata="type=spot"
```
