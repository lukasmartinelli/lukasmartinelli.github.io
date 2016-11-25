---
layout: post
title: Using Python to Parse iCalendar File
published: true
tags: 
  - "python, icalendar, productivity"
categories: python
---

```golang
numbers := int[]{1, 2, 3, 4, 5}
var anything []interface{} = numbers
```

```bash
cannot use dataSlice (type []int) as type []interface { } in assignment
```

The official explanation is to just convert it explicit.

```golang
numbers := []int{1, 2, 3, 4, 5}
var anything []interface{} = make([]interface{}, len(numbers))
for i, n := range numbers{
    anything[i] = n
}
```

However this quickly get's tedious.
If we write functions that want to operate on generic collections.


```golang
func foo(anything []interface{}) {
    for _, s := range anything {
       fmt.Println(s) 
    }
}
```

In order to call this we would need to convert every collection explicitely into
an interface.
Luckily this is not the end of the story.

Golang supports variadic functions which do get implicitly converted.
So all you have to do is to rewrite `foo`.

```golang
func foo(anything ...interface{}) {
    for _, s := range anything {
       fmt.Println(s) 
    }
}
```


### Practical Example

In a REST API you sometimes need to have a JSON envelope around your actual results.


```
struct Collection {
    Results []interface{}  `json: "results"`
}

func WrapResults(results ...interface[]) Collection {
    return Collection { results }
}
```
