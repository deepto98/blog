---
title: Cloud Engineering 2 - Creating and Hosting a Blog on S3 using 11ty 
description:  Cloud Engineering 2 - Creating and Hosting a Blog on S3 using 11ty 
date: 2023-10-30
tags:
  - posts
layout: layouts/post.njk
---
In the last part, I created a S3 bucket and hosted a simple HTML file on it. Now, I want to host a blog on it (the same one you'll read this post on). I found 11ty to be a pretty simple static blog generator. Glitch (`https://glitch.com/`) is a cool site which allows quick live web editing, and has an 11ty blog as a template, so I'll start with that. 

### 1. Kickstarting 11ty Project
*  On Glitch, choose `Blog with Eleventy`   

     <img src="/assets/images/2023-10-28-15-17-26.png" width="1000">
* This gives us a full fletched 11ty project, ready for us to edit live. I'm not delving into the project structure, how to add posts,etc because the starter project on Glitch is pretty self-explanatory.  
    <img src="/assets/images/2023-10-28-15-17-07.png" width="1000">
* I don't want to edit the blog on Glitch itslef, instead I want to use this template, run it on my local machine and make changes there. The way to do that is:
    * Create a repo on Github 
    * In the 11ty project, go to `Tools > Import/Export > Export to Github`. On the dialog prompt, I gave the repo I created on Github. 
    ![]() 
        <img src="/assets/images/2023-10-29-12-35-39.png" width="800">
    * This exports the entire blog to the repo, in a branch called `glitch`
        ![](assets/2023-10-29-12-38-22.png)
    * Clone the repo locally, and open it using an IDE
    * Now we need to run the project:
        ```
        npm install
        npx @11ty/eleventy --serve
        ```    
    * Now I'll work adding some content. For a new blog, a new markdown file ha to be added in `src/posts`.
### 2. Working with 11ty
While adding the first blog to 11ty (which is the  Cloud Engineering 1 write up on domains, nameservers and static hosting on S3), I figured out some things about 11ty, noting them down here:   
1. Working with images :
    * Add an assets folder in the project. I added it at `src/assets/images`. Keep images here.  
    * In `.eleventy.js` add :  
        ``` 
        eleventyConfig.addPassthroughCopy("src/assets/images");

        ```
    * Now, inside a post, we can simply add images, like we would in markdown:
        ![](assets/2023-10-29-17-25-19.png) 
2. Chaning the sorting order of posts:  

    Both the `Home` and `Posts` pages contain a list of all posts, which by default is sorted from oldest to newest. I wanted to reverse this i.e show the latest posts first. For this, we need to add a filter to the loop in the respective layout files in `src/_includes/layouts`. For example, in `src/_includes/layouts/home.njk` (which contains the looping over posts logic for the index page), we just need to add `reverse` :
        ![](assets/2023-10-29-17-41-34.png)
        Change line 14 to : 
        ![](assets/2023-10-29-17-50-50.png) 

### 3. Hosting the 11ty blog on S3
Now comes the hard part. I've completed the first two blogs (the second being twhis very one).  I want to host this 11ty blog at `deepto.xyz`, where I had hosted a simple HTML page in the last post.  



most recent , images,  , most recent
