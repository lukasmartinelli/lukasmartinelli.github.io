---
layout: post
hidden: true
title: Using Python to Parse iCalendar File
published: true
tags:
  - python
  - icalendar
  - productivity
categories: python
---

In the last learning phase I tried to use [Examtime](https://www.examtime.com/) to create my study plan in a celandar. After the exam I wanted to check how much time I've used for each lecture to prepare. So I wrote a small Python script and exported an `iCalendar` from Examtime.

![Examtime Calendar](/media/examtime-calendar.png)

##Parsing the .ical
To calculate the used time I have to get all the calendar events and count their time together.
In the `iCal` format the `VEVENT` Block marks an event subcomponent with properties like start time `DTSTART` and end time `DTEND`.

{% highlight bash %}
BEGIN:VCALENDAR
...
BEGIN:VEVENT
DTEND;TZID=Europe/Berlin;VALUE=DATE-TIME:20140113T123000
DTSTART;TZID=Europe/Berlin;VALUE=DATE-TIME:20140113T103000
DTSTAMP;VALUE=DATE-TIME:20131214T104201Z
UID:20140215121243023-3749894@examtime.com
DESCRIPTION:Asignatura: Math1I\nCategoría: exam\n
SUMMARY:P_An1I
END:VEVENT
...
{% endhighlight %}
The [iCalendar](http://icalendar.readthedocs.org/en/latest/) library makes parsing a breeze. You can iterate over all components of a certain type by using the `walk` function.
{% highlight python %}
from icalendar import Calendar

lectures = ['An1I', 'Math1I', 'Bsys1', 'CN1', 'EnglHTw', 'Prog1', 'ICTh']
file = open('examtime_export.ics', 'rb')
cal = Calendar.from_ical(file.read())
sessions = [(lecturize(e), calculate_time(e)) for e in cal.walk('vevent')]
{% endhighlight %}
I struggled at first with getting the time of the event but you simply have to call  the `dt` attribute and you get a normal `datetime` object.
{% highlight python %}
def calculate_time(event):
    start = event['DTSTART'].dt
    end = event['DTEND'].dt
    return end - start
{% endhighlight %}
The `lecturize` function searches for the lecture names in the event summary and then uses that lecture name as a key.
{% highlight python %}
def lecturize(event):
    summary = str(event['SUMMARY'])
    return [lecture for lecture in lectures if lecture in summary]
{% endhighlight %}
Now we have the data in a usable format.
{% highlight python %}
[('An1I', datetime.timedelta(0, 7200)),
 ('Prog1', datetime.timedelta(0, 9000)),
 ('EnglHTw', datetime.timedelta(0, 7200)),
 ...
]
{% endhighlight %}
##Calculating the used time
We group the records by it's lecture name and simply yield the sum of the timedeltas.
{% highlight python %}
from itertools import groupby
from operator import itemgetter
from datetime import timedelta

def time_per_lecture(events):
    lecture_name = itemgetter(0)
    sorted_events = sorted(events, key=lecture_name)
    for key, group in groupby(sorted_events, lecture_name):
        yield (key, sum(map(itemgetter(1), group), timedelta()))
{% endhighlight %}
Now we have the `used_time` foreach lecture and the `total_time` and are done.
{% highlight python %}
used_time = dict(time_per_lecture(events))
total_time = sum(used_time.values(), timedelta())

for lecture, time in used_time.items():
    print('{}\t{}h'.format(lecture, time.total_seconds() / 3600))

print('=============')
print('TOTAL\t{}h'.format(total_time.total_seconds() / 3600))
{% endhighlight %}
In my case that returned the time used while I was learning during December and January:
{% highlight bash %}
CN1	58.0h
An1I	63.5h
ICTh	49.5h
EnglHTw	16.0h
Bsys1	30.0h
Prog1	12.0h
Math1I	45.5h
=============
TOTAL	274.5h
{% endhighlight %}

I created a [Gist](https://gist.github.com/lukasmartinelli/9021795) with the code in case you're interested.
