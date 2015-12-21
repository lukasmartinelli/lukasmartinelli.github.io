---
layout: post
title: Extract Data from BFS STAT-TAB
published: true
tags:
  - opendata
  - government
categories: cloud
---

The Swiss Federal Statistical Office [BFS](http://www.bfs.admin.ch/) has a lot of valuable open data
that is just in the wrong format. The STAT-TAB database allows anyone to download the data in the
[PX data](http://www.scb.se/sv_/PC-Axis/Programs/PX-Web/) format.
To transform this data into a better format requires a few steps that are explained in this tutorial.

## Download Data Cube

On the [STAT-TAB website](https://www.pxweb.bfs.admin.ch/) download a data cube of your interest
in the PX format.  In my case I am interested in all data about swiss communities.

![Download PX File from STAT-TAB website](/media/download_px_stattab.png)

## Setup PX-Axis 2008

[Download and install PX-Axis 2008](http://www.scb.se/sv_/PC-Axis/Programs/PC-Axis/PC-Axis-2008/) on a
Windows XP machine.
The easiest way to get started is using a XP VM image from the [Modern.IE project](https://dev.windows.com/en-us/microsoft-edge/tools/vms/) which provides free VM images in different formats for different Windows versions.

## Open File in PX-Axis

Open the file with PX-Axis and select the dimensions you want to export.
To export the data into CSV it is best to omit the aggregated values and
focus on a single dimension.

![Open file with PX-Axis](/media/focus_single_dimension.png)
![View of file in PX-Axis](/media/single_dimension_px_axis.png)

## Export as CSV

Use `File` > `Save as` to open the export wizard. Switch to the `Convert` tab and choose the `CSV` format for export.

![Convert file to CSV in PX-Axis](/media/px_axis_convert_csv.png)

## Clean up CSV

Because we've selected only a single dimension we can now delete the first dimension column
and have a valid CSV file that we can use in other programs.

![Valid CSV file](/media/valid_csv_file.png)
