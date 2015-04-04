---
layout: post
title: Which Languages use CI Services on Github?
tags:
  - data
  - github
  - ci
categories: cloud
published: true
---
I analyzed 370 million files of [614k Github repos](https://github.com/lukasmartinelli/repostruct/tree/master/repos)
to find out which Continous Integration services developers use.
I looked at public Github repos that were recorded in the [GHTorrent dataset
of 2015-01-29](http://ghtorrent.org/downloads.html) and are **not forks** of other projects.
The dataset is available at the [repostruct Github Repository](https://github.com/lukasmartinelli/repostruct).

> **tldr:** Travis has won the game but there are still alot of projects that don't use CI at all.

<link rel="stylesheet" href="/css/chart.css">
<script src="//cdn.jsdelivr.net/chart.js/1.0.2/Chart.min.js"></script>
<script src="/js/Chart.StackedBar.js"></script>

## CI Integration across Languages

<div class="chart">
<canvas id="ci-integration-chart" style="height: 500px;"></canvas>
<div class="legend" id="ci-integration-legend"></div>
</div>
<br clear="all" />

<script>

window.createLegend = function(legendId, chart) {
    var legendHolder = document.createElement('div');
    legendHolder.innerHTML = chart.generateLegend();
    document.getElementById(legendId).appendChild(legendHolder.firstChild);
};

window.githubIntegrationData = {
    "AppVeyor": {
        data: {
            javascript: 3181,
            java: 150,
            python: 573,
            ruby: 197,
            php: 224,
            cpp: 407,
            objc: 8,
            go: 17,
            csharp: 848,
            c: 345
        },
        color: "#46BFBD",
        highlight: "#5AD3D1"
    },
    "CircleCI": {
        data: {
            javascript: 719,
            java: 161,
            python: 156,
            ruby: 390,
            php: 84,
            cpp: 11 ,
            objc:10,
            go: 156,
            csharp: 2,
            c: 13

        },
        color: "#FDB45C",
        highlight: "#FFC870",
    },
    "Wercker": {
        data: {
            javascript: 847,
            java: 196,
            python: 183,
            ruby: 97,
            php: 37,
            cpp: 21,
            objc: 3,
            go: 431,
            csharp: 1,
            c: 12

        },
        color: "#C6388B",
        highlight: "#D559A2",
    },
    "Drone": {
        data: {
            javascript: 97,
            java: 21,
            python: 58,
            ruby: 43,
            php: 11,
            cpp: 8,
            objc: 0,
            go: 634,
            csharp: 0,
            c: 6
        },
        color: "#4D5360",
        highlight: "#616774",
    },
    "Travis": {
        data: {
            javascript: 58234,
            java: 17675,
            python: 19339,
            ruby: 20217,
            php: 19359,
            cpp: 5760,
            objc: 5221,
            go: 5943,
            csharp: 698,
            c: 4151
        },
        color: "#F7464A",
        highlight: "#FF5A5E",
    },
    "No CI": {
        data: {
            javascript: 162454,
            java: 136799,
            python: 81857,
            ruby: 51854,
            php: 55214,
            cpp: 45635,
            objc: 30060,
            go: 11089,
            csharp: 35387,
            c: 44602
        },
        color: "#ccc",
        highlight: "#ddd",
    }
};
window.chartData = function(lang) {
    var data = [];
    for (var key in window.githubIntegrationData) {
        if (window.githubIntegrationData.hasOwnProperty(key)) {
            var provider = window.githubIntegrationData[key];
            var value = provider.data[lang];
            data.push({
                label: key,
                color: provider.color,
                highlight: provider.highlight,
                value: value
            });
        }
    }
    return data;
};
window.createDoughnutChart = function(chartId, lang) {
    var data = window.chartData(lang);
    var ctx = document.getElementById(chartId).getContext("2d");
    var chart = new Chart(ctx).Doughnut(data, {
         animation: false,
    });
    return chart;
};
</script>

<script>
(function() {
var datasets = [];
for (var key in window.githubIntegrationData) {
    if (window.githubIntegrationData.hasOwnProperty(key)) {
        var provider = window.githubIntegrationData[key];
        var valuesArray = [];
        for (var seriesKey in provider.data) {
            if(provider.data.hasOwnProperty(seriesKey)) {
                valuesArray.push(provider.data[seriesKey])
            }
        }
        datasets.push({
            label: key,
            fillColor: provider.color,
            highlightFill: provider.highlight,
            data: valuesArray
        });
    }
}

var data = {
    labels: ["Javascript", "Java", "Python", "Ruby", "PHP", "C++", "Objective-C", "Go", "C#", "C"],
    datasets: datasets
};

var ctx = document.getElementById("ci-integration-chart").getContext("2d");
var chart = new Chart(ctx).StackedBar(data, {
     barShowStroke: false,
});
var legendHolder = document.createElement('div');
legendHolder.innerHTML = chart.generateLegend();
document.getElementById('ci-integration-legend').appendChild(legendHolder.firstChild);

})();

</script>

## Languages

<div class="chart">
<div class="legend" id="legend-languages"></div>
</div>
<div class="chart-section">
<h3>Javascript</h3>
<canvas style="width: 200px; height: 180px;" id="chart-javascript"></canvas>
</div>
<div class="chart-section">
<h3>Java</h3>
<canvas style="width: 200px; height: 180px;" id="chart-java"></canvas>
</div>
<div class="chart-section">
<h3>C++</h3>
<canvas style="width: 200px; height: 180px;" id="chart-cpp"></canvas>
</div>
<div class="chart-section">
<h3>Python</h3>
<canvas style="width: 200px; height: 180px;" id="chart-python"></canvas>
</div>
<div class="chart-section">
<h3>Ruby</h3>
<canvas style="width: 200px; height: 180px;" id="chart-ruby"></canvas>
</div>
<div class="chart-section">
<h3>Objective-C</h3>
<canvas style="width: 200px; height: 180px;" id="chart-objc"></canvas>
</div>
<div class="chart-section">
<h3>PHP</h3>
<canvas style="width: 200px; height: 180px;" id="chart-php"></canvas>
</div>
<div class="chart-section">
<h3>Go</h3>
<canvas style="width: 200px; height: 180px;" id="chart-golang"></canvas>
</div>
<div class="chart-section">
<h3>C#</h3>
<canvas style="width: 200px; height: 180px;" id="chart-csharp"></canvas>
</div>
<div class="chart-section">
<h3>C</h3>
<canvas style="width: 200px; height: 180px;" id="chart-c"></canvas>
</div>
<br clear="all" />

<script>
(function() {
    var goChart = window.createDoughnutChart('chart-golang', 'go');
    var jsChart = window.createDoughnutChart('chart-javascript', 'javascript');
    var javaChart = window.createDoughnutChart('chart-java', 'java');
    var cppChart = window.createDoughnutChart('chart-cpp', 'cpp');
    var pythonChart = window.createDoughnutChart('chart-python', 'python');
    var rubyChart = window.createDoughnutChart('chart-ruby', 'ruby');
    var phpChart = window.createDoughnutChart('chart-php', 'php');
    var objcChart = window.createDoughnutChart('chart-objc', 'objc');
    var csharpChart = window.createDoughnutChart('chart-csharp', 'csharp');
    var cChart = window.createDoughnutChart('chart-c', 'c');
    createLegend('legend-languages', goChart);
})();
</script>

## Findings

- Travis owns the CI market for Open Source projects.
  No one has even close the numbers Travis has across all languages.
- Users of dynamic languages use CI services the most.
  Projects written in Javascript, Ruby or PHP use CI services in 30% of the projects.
- Pythonistas use CI less than their dynamic companions (only 20%).
  Perhaps this might be because Python is used alot for scriping where testing
  is not as important.
- Java developers use CI services in only 10% of projects. That is as bad as C programmers.
  For a language with the most mature tooling this is astonishing.
  Perhaps this is because they rely on custom builds with [Jenkins](https://jenkins-ci.org/)
  or [Teamcity](https://www.jetbrains.com/teamcity/).
- C# projects have not yet arrived the age of CI (less than 5%).
- Projects with native code like C++ or Objective-C don't use CI as often, but surprisingly more often
  than Java. Approximately 15% of projects use CI. They are also more willing to use other CI services than Travis.
- The Go community is the most interesting. They use alot of services and Drone.io and Wercker
  start to gain traction among those projects. Go programmers are also exemplary
  in their usage of CI (40% of projects!)
- AppVeyor is the only CI service that can compete with travis, at least on a language basis.
  AppVeyor has some market share in Javascript, Python, C++, C and C# projects
  due the fact that they offer Windows based builds.
- [Travis](https://travis-ci.org/) is the **#1** for Open Source CI integration and it
  seems unlikely that will change in the future.
- [AppVeyor](http://www.appveyor.com/) is well positioned with its Windows based builds and they might get significant market share in
  languages where platforms matter like C++, C and C#.
   These languages still have some room to grow because they don't have a high CI usage yet (especially C#).
- [Drone](http://drone.io/) is mostly used by Go developers. No wonder as it is based on Docker and Go.
- Close to no one uses [SensioLabs](https://sensiolabs.com/) or [Solano](https://www.solanolabs.com/).
- [Wercker](http://wercker.com/) and [CircleCI](https://circleci.com/) are new kids on the block and
   therefore might be a bit underrepresented in this analysis.
   I think it will be tough for them to compete with Travis.  They need to convince the users creating new repositories.
   Looking at the Go community where most projects are very new, we see that Travis alternatives are used more.

There is still room for more CI services, but given that not all Projects on Github
are of serious nature, more than 50% of projects are unlikely to use CI.

> My guess is that Travis will remain the big player for Open Source projects in the future followed by AppVeyor.
The others will have a little share of the projects even though they have better features than Travis.

## Numbers

This is simply an educated guess. I would be very happy if the people working at those
Companies could confirm them.

CI Platform | Repos
------------|-----------
Travis      | 200'000+
AppVeyor    | 50'000+
CircleCI    | 5'000+
Wercker     | 5'000+
Drone.io    | 1'000+

Please note that if Projects don't use a configuration file I cannot relate them to a CI Platform.

## Data Quality

**Conclusion**: The data gathered is pretty accurate, perhaps not down to the number but the
distribution ratio of CI integration services is correct.

I verified the results with results from Google Search and Github Code search.
The results differ, but the ratio stays the same (Probably because I didn't get
the whole Github dataset).
If you scale Google Search with `0.3` and `1.5` and the Github search with `0.4` you get the same results.

Github has much more records for `.travis.yml` and `appveyor.yml` than I found.
Reasons might be:

- Github Code search includes forks
- A repository can have multiple CI config files (alot of Javascript people have the
  `node_modules` folder checked in)

CI config file    | repostruct   | Google Search  | Google Search (intitle)  | Github (in path)
------------------|--------------|----------------|--------------------------|-----------------
`.travis.yml`     | 15'6597      | 388'000        | 69'200                   | 4'044'062
`appveyor.yml`    | 5'950        | 6'780          | 1'270                    | 54'741
`.drone.yml`      | 878          | 2'720          | 626                      | 1'084
`circle.yml`      | 1'702        | 8'510          | 1'150                    | 4'725
`wercker.yml`     | 1'828        | 5'010          | 764                      | 4'999
`solano.yml`      | 21           | 277            | 6                        | 26
`.sensiolabs.yml` | 9            | 3'040          | 7                        | 31
`.scrutinizer.yml`| 3'877        | 9'290          | 3'010                    | 13'550

- **[Google Search](https://www.google.ch/search?q=.travis.yml+site:github.com)** with `site:github.com .travis.yml`
- **[Google Search](https://www.google.ch/search?q=intitle:.travis.yml+site:github.com)** with `site:github.com intitle:.travis.yml`
- **[Github Code Search](https://github.com/search?utf8=%E2%9C%93&q=.travis.yml+in%3Apath&type=Code&ref=searchresults)** with `.travis.yml in:path`

## Thanks

Thanks to [@m_st](https://twitter.com/m_st) and [@sfkeller](https://twitter.com/sfkeller) for providing
the monster server for analyzing the results.
