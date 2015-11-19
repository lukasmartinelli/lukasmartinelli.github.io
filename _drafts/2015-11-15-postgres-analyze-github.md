---
layout: post
title: Analyze Github with PostgreSQL
tags:
  - github
  - postgres
  - json
  - bigdata
categories: cloud
published: true
---

In my [repostruct project](https://github.com/lukasmartinelli/repostruct)
I downloaded 10 million GitHub repositories to extract 1 billion filepaths
for analysis.
In this post I will show you how to import and play with the data in PostgreSQL.

## Dataset

Each repository is a valid JSON record on a single line containing metadata and
the actual filepaths.
A similar format is used in the [GitHub Archive](https://www.githubarchive.org/).

Below is an example record of a repository.

```json
{
  "metadata":{
    "repo":"npmcomponent/pazguille-musique",
    "summary":{
      "branches":"1",
      "contributors":"0",
      "releases":"0",
      "commits":"19"
    },
    "language_statistics":[["JavaScript", "100.0"]],
    "social_counts":{"forks":"0", "stars":"0", "watchers":"1"}
  },
  "filepaths":[
    ".travis.yml", "LICENSE", "musique.js", "README.md",
    "package.json", "component.json", "Gruntfile.js", "Makefile",
    "dist/musique.js", "dist/musique.min.js", "test/spec.js"
  ]
}
```

The download is split up into several 1GB files.

```bash
wget https://s3-eu-west-1.amazonaws.com/repostruct/repos.json.gz
```

Extract the gzipped files. This will result in ~100 GB uncompressed files.

```bash
gunzip repos.json.gz
```

## Import JSON data into PostgreSQL

You can parse the files yourself or import them into PostgreSQL to make analyzing easier.

### Install pgfutter

Using my [PostgreSQL import tool pgfutter](https://github.com/lukasmartinelli/pgfutter) you can easily import JSON files like these.
You can download static binaries or head over to the [installation section](https://github.com/lukasmartinelli/pgfutter#install) for more detailed instructions.

```bash
# OSX
wget -O pgfutter http://git.io/v43HL

# Linux
wget -O pgfutter http://git.io/v43Hr

# Windows
wget -O pgfutter http://git.io/v43HS

chmod +x pgfutter
./pgfutter --help
```



### Import JSON

Import all files into the same table `import.repos`.
If you need to [modify the connection settings](https://github.com/lukasmartinelli/pgfutter#database-connection)
you can use specific arguments or set environment variables.

```bash
./pgfutter --table repos --db repostruct \
  --port 5432 --host localhost \
  --user repo_analysis --pass awes0me \
  json repos.json
```

## Create Views for Querying

pgfutter will import everything into a single `JSON` column called `data`.
You can either work on this data directly or create a better suited schema
for making querying easier.

It is faster to work on the 10 million GitHub repositories directly via
the awesome JSON support of PostgreSQL instead of normalizing them into a
`repository` and `filepaths` table.

Four our case we will use a view to make working with the data easier.

Let's create an unique index on the repository name embedded in the `data` JSON field.

```sql
CREATE UNIQUE INDEX ON import.repos((data->'metadata'->>'repo'))
CREATE INDEX ON import.repos((data->'metadata'->'language_statistics'->0->>0))
```

We flatten they array structure of filepaths into records.
We also ensure that all filepaths are in lower case so we can do case
insensitive matching without using `ILIKE`.

```sql
CREATE OR REPLACE VIEW public.filepaths AS (
  SELECT data->'metadata'->>'repo' as repo,
         lower(json_array_elements_text(data->'filepaths')) as filepath
  FROM import.repos
);
```

Flatten the nested property graphs into columns.
Language statistics are already ordered by their usage and selecting
the most used languages will suffice for this case.

```sql
CREATE OR REPLACE VIEW public.repos AS (
    SELECT data->'metadata'->>'repo' as repo,
           data->'metadata'->'language_statistics'->0->>0 as primary_language,
           data->'metadata'->'language_statistics'->1->>0 as secondary_language,
           data->'metadata'->'language_statistics'->2->>0 as tertiary_language,
           data->'metadata'->'summary'->>'branches' as branches,
           data->'metadata'->'summary'->>'contributors' as contributors,
           data->'metadata'->'summary'->>'releases' as releases,
           data->'metadata'->'summary'->>'commits' as commits,
           data->'metadata'->'social_counts'->>'forks' as forks,
           data->'metadata'->'social_counts'->>'stars' as stars,
           data->'metadata'->'social_counts'->>'watchers' as watchers
    FROM import.repos
);
```

## Query

A very handy function will be to extract the filename of a filepath.

```sql
CREATE OR REPLACE FUNCTION filename(filepath TEXT) RETURNS TEXT
AS $$ SELECT regexp_replace(filepath, '^.+[/\\]', '') AS filename $$
LANGUAGE SQL;
```

We can search for `README.md` files across all languages.

```sql
SELECT repo, filepath
FROM public.filepaths
WHERE filename(filepath) = 'readme.md'
```

We want to find out which languages use which `README` format.
GitHub supports [alot of README formats](https://github.com/github/markup).
Because the query will take a very long time to complete I like
to create a materialized view to look at the results later on.

```sql
CREATE MATERIALIZED VIEW readme_formats AS (
SELECT
  r.primary_language as language,
  COUNT(CASE WHEN f.filepath = 'readme' THEN 1 ELSE 0 END) as raw,
  COUNT(CASE WHEN f.filepath = 'readme.md'
               OR f.filepath = 'readme.markdown'
               OR f.filepath = 'readme.mdown'
               OR f.filepath = 'readme.mkdn'
             THEN 1 ELSE 0 END) as md,
  COUNT(CASE WHEN f.filepath = 'readme.asciidoc'
               OR f.filepath = 'readme.adoc'
               OR f.filepath = 'readme.asc'
             THEN 1 ELSE 0 END) as asciidoc,
  COUNT(CASE WHEN f.filepath = 'readme.textile' THEN 1 ELSE 0 END) as textile,
  COUNT(CASE WHEN f.filepath = 'readme.rdoc' THEN 1 ELSE 0 END) as rdoc,
  COUNT(CASE WHEN f.filepath = 'readme.org' THEN 1 ELSE 0 END) as org,
  COUNT(CASE WHEN f.filepath = 'readme.creole' THEN 1 ELSE 0 END) as creole,
  COUNT(CASE WHEN f.filepath = 'readme.mediawiki' THEN 1 ELSE 0 END) as mediawiki,
  COUNT(CASE WHEN f.filepath = 'readme.pod' THEN 1 ELSE 0 END) as pod,
  COUNT(CASE WHEN f.filepath = 'readme.rst' THEN 1 ELSE 0 END) as rst,
  COUNT(CASE WHEN f.filepath = 'readme.txt' THEN 1 ELSE 0 END) as txt
FROM public.filepaths f
INNER JOIN public.repos r ON r.repo = f.repo
WHERE f.filepath like 'readme.%'
GROUP BY r.primary_language
);
```

