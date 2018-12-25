---
layout: default
category: project
title: hadolint
tags: haskell, docker, linting, ast, parser
github_repo: hadolint/hadolint
order: 12
---

A smarter Dockerfile linter that helps you build [best practice Docker images](https://docs.docker.com/engine/articles/dockerfile_best-practices/). The linter is parsing the Dockerfile into an AST and performs rules on top of the AST. It additionally is using the famous [Shellcheck](https://github.com/koalaman/shellcheck) to lint the Bash code inside `RUN` instructions.
