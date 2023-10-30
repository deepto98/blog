---
title: Studying Databases 1 - Relational Model & Relational Algebra 
description:  Databases 1 - Relational Model & Relational Algebra
date: 2023-10-30
tags:
  - posts
layout: layouts/post.njk
---
I've been planning to dig deep into databases for a while, and eventually try and make one of my own. I found a great resource on Youtube - CMU's Intro to Database Systems lectures (https://www.youtube.com/playlist?list=PLSE8ODhjZXjaKScG3l0nuOiDTTqpfnWFf). I plan to study it and will document what I'm learning in the form of blog posts here.

### Databases
* A database is an organized collection of inter-related data that models some aspect of the real-world
* Its different from database management systems like MySQL, Oracle, MongoDB, Snowflake, which are softwares that manages a database

### Flat File Databases
* Data is stored in CSV (comma-separated value) files
* Separate file for every entity
* In our application backend, we parse these CSV files to read/write records
* Example of a CSV file, and Python code to query it:  
    ![](assets/2023-10-30-03-14-15.png)  
* Drawbacks of Flat File Systems :
    * Integrity : 
        * We can't ensure the identity of an entry, e.g if same artist has multiple albums ie multiple rows, we can't ensure itthe same artist 
        * A value can be overwritten with another of an incorrect type. e.g  year with a float
        * We can't have multiple artists for an album
        * Handling deletion is difficult e.g if we delete an artist, what happens to the albums
    * Implementation:
      *    