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
* This gives us a full fletched 11ty project, ready for us to edit live. I'm not delving into the project structure, how to add posts, etc because the starter project on Glitch is pretty self-explanatory.  

    <img src="/assets/images/2023-10-28-15-17-07.png" width="1000">
* I don't want to edit the blog on Glitch itslef, instead I want to use this template, run it on my local machine and make changes there. The way to do that is:
    * Create a repo on Github 
    * In the 11ty project, go to `Tools > Import/Export > Export to Github`. On the dialog prompt, I gave the repo I created on Github. 
  
        <img src="/assets/images/2023-10-29-12-35-39.png" width="800">
    * This exports the entire blog to the repo, in a branch called `glitch`  

        <img src="/assets/images/2023-10-29-12-38-22.png" width="800">
    * Clone the repo locally, and open it using an IDE
    * Now we need to run the project:
        ```
        npm install
        npx @11ty/eleventy --serve
        ```    
    * Now I'll work on completing the first blog. For a new blog, a new markdown file has to be added in `src/posts`.
### 2. Working with 11ty
While adding the first blog (which is the  Cloud Engineering 1 write up on domains, nameservers and static hosting on S3) to 11ty , I figured out some things about 11ty, so I'm noting them down here:   
1. Working with images :
    * Add an assets folder in the project. I added it at `src/assets/images`. Keep images here.  
    * In `.eleventy.js` add :  
        ``` 
        eleventyConfig.addPassthroughCopy("src/assets/images");

        ```
    * Now, inside a post, we can simply add images, like we would in markdown:  
        <img src="/assets/images/2023-10-29-17-25-19.png" width="500"> 
2. Chaning the sorting order of posts:  

    Both the `Home` and `Posts` pages contain a list of all posts, which by default is sorted from oldest to newest. I wanted to reverse this i.e show the latest posts first. For this, we need to add a filter to the loop in the respective layout files in `src/_includes/layouts`. For example, in `src/_includes/layouts/home.njk` (which contains the looping over posts logic for the index page), we just need to add `reverse` :  
        <img src="/assets/images/2023-10-29-17-41-34.png" width="1000">  
        Change line 14, add the `| reverse` filter :   
        <img src="/assets/images/2023-10-29-17-50-50.png" width="1000"> 

### 3. Hosting the 11ty blog on the S3 bucket with Github Actions
Now comes the hard part. I've completed the first two blogs (the second being this very write-up i.e Cloud Engineering 2).  I want to host this 11ty blog at `deepto.xyz`, where I had hosted a simple HTML page in the last post.  
Refer to the last blog for the bucket creation, setting permissions, and static hosting an HTML file  

-  ####  Part 1.  Creating a IAM policies and AWS user 
    First, we need to create an AWS user, and IAM policies which allows the user to write to the bucket   
    1. Go to the AWS IAM Dashboard - https://us-east-1.console.aws.amazon.com/iamv2 > Policies > Create Policy
    2. It allows us to build policies using a visual editor, or create one from JSON. I found a similar JSON policy in another article (the one in references):  

    ``` 
        {
        "Version": "2012-10-17",
        "Statement": [
                {
                    "Sid": "VisualEditor0",
                    "Effect": "Allow",
                    "Action": [
                        "s3:PutObject",
                        "s3:GetObject",
                        "s3:ListBucket",
                        "s3:DeleteObject",
                        "s3:GetBucketLocation"
                    ],
                    "Resource": [
                        "arn:aws:s3:::www.deepto.xyz" 
                    ]
                }
            ]
        }
    ```
    3. Choose `JSON` > Add the policy > Add a Name > Create Policy      
     <img src="/assets/images/2023-10-29-19-50-49.png" width="1200">   
    <img src="/assets/images/2023-10-29-19-54-52.png" width="800"> 
    4. Now, we need to create an user.  Go to the AWS IAM Dashboard > Users > Create User  
    <img src="/assets/images/2023-10-29-19-58-38.png" width="900"> 
    5. Choose `Attach policies directly` and choose the policy we created.  
    <img src="/assets/images/2023-10-29-20-07-45.png" width="800"> 
    6. Review and click `Create User`  
    <img src="/assets/images/2023-10-29-20-08-39.png" width="800"> 
    7. Now, we need to create an Access Key for the User. On the User page, go to Access Keys > Create Access Key  
     <img src="/assets/images/2023-10-29-21-04-59.png" width="500"> 
    8. We can ignore the alternatives and select any use case.  
    <img src="/assets/images/2023-10-29-21-10-30.png" width="500"> 
    9. Optionally, add tags  
    <img src="/assets/images/2023-10-29-21-11-16.png" width="500"> 
    10.  Store the key somewhere ASAP, we'll have to add them in our Github repo as secrets  
    <img src="/assets/images/2023-10-29-21-12-23.png" width="800"> 
-  ####  Part 2.  Creating the Github Actions Workflow
    We'll use a Github action to publish our blog to the S3 bucket. 
    1. Before proceeding, first we need to add the AWS access key and secret to our Github repo. Go to repo > Settings >  Security > Secrets and Variables > Actions > New Repository Secret.  
    2. Add 2 secrets - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` and set their values to the ones we got on AWS
     ![](assets/2023-10-29-22-12-37.png)
    3. Also add the S3 bucket name as a secret :
    ![](assets/2023-10-29-22-14-59.png)
    4. Now we'll create the Actions workflow. Go to the repo > Actions > Setup a Workflow Yourself.
    5. This is the workflow script we'll use (found it on https://monicagranbois.com/blog/webdev/use-github-actions-to-deploy-11ty-site-to-s3/#yml):
    ```yml  
        name: Build and Deploy to S3
        on: [push]
        jobs:
          build_and_deploy:
            runs-on: ubuntu-latest
            steps:
              - name: Checkout repository
                uses: actions/checkout@v2.3.4
        
              # Uncomment if you want to specify a certain 
              # Node version. Otherwise the Node version installed
              # on the GitHub VM will be used. For more details
              # see: https://github.com/actions/virtual-environments 
              # - name: Setup Node.js environment
              #   uses: actions/setup-node@v2.1.4
              #   with:
              #     node-version: '15.7.0'
        
              # Uncomment if your project uses dependencies
              # - name: Install dependencies
              #   run: npm ci
        
              - name: Build the website
                run: npx @11ty/eleventy
              
              - name: Configure AWS Credentials
                uses: aws-actions/configure-aws-credentials@v1
                with:
                  aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
                  aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
                  aws-region: ap-south-1
        
              - name: Upload files to S3 with AWS CLI
                run: |
                  aws s3 sync _site/ s3://${{ secrets.S3_BUCKET }} --delete 
    ``` 
    6. Commit this script.
 ### References:
*  https://jrb.nz/blogue/eleventy-aws-s3/
*  https://www.youtube.com/watch?v=h-iowIY4DCU

 