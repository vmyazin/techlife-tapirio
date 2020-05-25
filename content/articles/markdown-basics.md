---
title: Getting The Markdown Basics
date: 05-20-2020
author: Vasily Myazin
description: For those who need rich text without delving into HTML.
image: https://d33wubrfki0l68.cloudfront.net/e3541891e3115642d605aca52e4556d397e95c6f/4e2ba/images/quicktourexample.png
tags: markdown, blogging
---
![Markdown](https://d33wubrfki0l68.cloudfront.net/e3541891e3115642d605aca52e4556d397e95c6f/4e2ba/images/quicktourexample.png)

Markdown is a lightweight [markup language](https://en.wikipedia.org/wiki/Markdown) with plain-text-formatting syntax developed by John Gruber.

Even people experienced in HTML, [Pug](https://pugjs.org/api/getting-started.html) and the like can find it weary to use intricate markup langauges for blogging, as opposed to plain text. It is important to note that classic HTML is fully supported inside of the MD files on Tapirio. Markdown is as close to the so called _"rich plain text"_ as we can get today. The beauty of it is that it doesn't necessarily need to be "rich," unless you need to turn some chunks of text into links and insert images. Let's review some examples.

## Adding an H1 Heading

<div class="highlight">
  <pre># Main Heading</pre>
</div>

By adding the **#** (hash) symbol we control the number of the heading, i.e. **## = h2, ### = h3,** etc.

## Styling lists

### Unordered

<div class="highlight">
  <pre>
    - First item
    - Second item
    - Third item</pre>
</div>

The code above results in:

- First item
- Second item
- Third item

### Ordered

<div class="highlight">
  <pre>
    1. First item
    2. Second item
    3. Third item</pre>
</div>

Results in:

1. First item
2. Second item
3. Third item

## Adding links

Another thing to add to your muscle memory as a Markdown blogger is typing a link.

<div class="highlight">
  <pre>[DuckDuckGo Search](https://www.duckduckgo.com/)</pre>
</div>

This will show up as a link to our preferred alternative to Google search called [DuckDuckGo](https://www.duckduckgo.com/).

## Inserting Images

Very similar to links is the syntax for referencing images. You just need to add **!** in front of the opening square bracket.

<div class="highlight">
  <pre>![DuckDuckGo Search](https://images.techhive.com/images/article/2014/05/duckduckgo-logo-100266737-large.jpg)</pre>
</div>

![DuckDuckGo Search](/images/blog/duckduckgo-logo.jpg)

This is something to get you started. An entirely comprehensive list of Markdown syntax examples can be [found here](https://www.markdownguide.org/basic-syntax).

## Native OS Editors

Our recommendation for a macOS MD editor is [MacDown](https://macdown.uranusjr.com) created by [Tzu-ping Chung](https://uranusjr.com), it is influenced by [Chen Luo](https://twitter.com/chenluois)’s [Mou](http://mouapp.com/).

For Windows you can  give [MarkdownPad](https://markdownpad.com/) a shot.
