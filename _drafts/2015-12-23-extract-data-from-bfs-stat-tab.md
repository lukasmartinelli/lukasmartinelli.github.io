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
focus on a single dimension (in this case population of swiss people and foreigners).

![Open file with PX-Axis](/media/choose_dimensions.png)
![View of file in PX-Axis](/media/px_axis_file.png)

## Export as CSV

Use `File` > `Save as` to open the export wizard. Switch to the `Convert` tab and choose the `CSV` format for export.

![Convert file to CSV in PX-Axis](/media/px_axis_convert_csv.png)

## Clean up CSV

Now you have the data available in CSV format but you usually want to extract distinct dimensions
of the data and skip the aggregates.

![Skip aggregates](/media/skip_take.png)

I use a small Python script to only extract the data of the communities (and skip district and canton aggregates). Make sure the data is saved as UTF-8 in order to use it.

```python
import csv
import sys


def extract_values(reader):

    def parse_row(community, nationality, row):
        parts = community.split(' ')
        community_id = parts[0]
        community_name = " ".join(parts[1:])
        return [community_id, community_name, nationality] + row[4:]

    def skip():
        next(reader)

    def parse_header_row():
        header_row = next(reader)
        additional_fields = ['community_id', 'community_name', 'nationality']
        return additional_fields + header_row[4:]

    yield parse_header_row()
    for row in reader:
        is_community = len(row) > 1 and row[1].startswith('......')
        if is_community:
            community = row[1].replace('......', '')

            skip()
            yield parse_row(community, 'Switzerland', next(reader))
            skip()
            yield parse_row(community, 'Foreign', next(reader))


if __name__ == '__main__':
    args = docopt(__doc__, version='0.1')

    with open(args.get('<csv_file>')) as csv_file:
        reader = csv.reader(csv_file, delimiter='\t', quotechar='"')
        writer = csv.writer(sys.stdout, delimiter='\t', quotechar='"')

        for row in extract_values(reader):
            writer.writerow(row)

```

## Resulting CSV File

You now have a CSV file you can use in other programs and languages or also import into a database.

![Cleaned CSV file](/media/cleaned_csv_file.png)

