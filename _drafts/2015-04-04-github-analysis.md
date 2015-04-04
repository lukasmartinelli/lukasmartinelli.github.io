---
layout: post
title: Github CI Integration
tags:
  - data
  - github
  - api
  - coreos
categories: web
published: true
---
<link rel="stylesheet" href="/css/chart.css">
<script src="//cdn.jsdelivr.net/chart.js/1.0.2/Chart.min.js"></script>
<script src="/js/Chart.StackedBar.js"></script>

I analyzed the files of 614k Github repos. One thing I wanted to find out
is how many people use Continous Integration and which services do they use.
[repostruct](https://github.com/lukasmartinelli/repostruct) Github Repository.

tldr: Travis has won the game but there are still alot of projects that
don't use CI at all.

## CI Integration

I can only detect CI integrations that make use of specific config files:
- AppVeyor
- CircleCI
- Drone
- SensioLabs
- Solano
- Travis
- Wercker

While analyzing I find out that close to no one uses SensioLabs and Solano so I excluded
them in the charts.

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

## Static Analysis Tools

Even though Scrutinizer support PHP, Ruby and Python it is mostly popular among PHP developers.
I could not check how many people use [Code Climate](http://codeclimate.com) another popular static analysis service because
there are no config files in the repo.

Language       | Repositories
---------------|--------------
**Python**     | 56
**PHP**        | 3612
**Javascript** | 203

## Data Quality

**Conclusion**: The data gathered is pretty accurate, perhaps not down to the number but the
distribution of CI integration services is correct.

I looked at public Github repos that were recorded in the [GHTorrent dataset
of 2015-01-29](http://ghtorrent.org/downloads.html) and are **not forks** of another project.

One way to do the analysis I did alot cheaper and faster is by simply
searching with the Github search, however I found that it is not quite accurate
but helps to verify the results.

Now the results have different numbers but still relate.
If you scale Google Search with `0.3` and `1.5` and the Github search with `0.4`
you get pretty much the same results.

However Github records much more records for `.travis.yml` and `appveyor.yml` than I found,
I think this is because alot of people have several config files per repositories
(alot of Javascript people have the `node_modules` folders checked in) or forked these projects
alot.
And for travis I can imagine that it is simply because I only analyzed a set of languages.

CI config file    | repostruct  | Google Search | Google Search (intitle) | Github (in path)
------------------|-------------|---------------|-------------------------|-----------------
`.travis.yml`     | 156597      | 388000        | 69200                   | 4044062
`appveyor.yml`    | 5950        | 6780          | 1270                    | 54741
`.drone.yml`      | 878         | 2720          | 626                     | 1084
`circle.yml`      | 1702        | 8510          | 1150                    | 4725
`wercker.yml`     | 1828        | 5010          | 764                     | 4999
`solano.yml`      | 21          | 277           | 6                       | 26
`.sensiolabs.yml` | 9           | 3040          | 7                       | 31
`.scrutinizer.yml`| 3877        | 9290          | 3010                    | 13550

- **[Google Search](https://www.google.ch/search?q=.travis.yml+site:github.com)** with `site:github.com intitle:.travis.yml`
- **[Google Search](https://www.google.ch/search?q=intitle:.travis.yml+site:github.com)** with `site:github.com intitle:.travis.yml`
- **[Github Code Search](https://github.com/search?utf8=%E2%9C%93&q=.travis.yml+in%3Apath&type=Code&ref=searchresults)** with `.travis.yml in:path`



