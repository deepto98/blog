---
title: Cloud Engineering 1 - Domain, Nameserver and Static Site Hosting using S3 
description:  Cloud Engineering 1 - Baby Steps - Buying a Domain, Migrate its Nameserver to Cloudflare and Static Site Hosting using S3
date: 2023-10-29
tags:
  - posts
layout: layouts/post.njk
---

#### Buying a Domain, Migrating its Nameserver to Cloudflare and Static Site Hosting using AWS S3

### 1. Buying the domain
* There's a hack to find super cheap domains through SEO. In incognito, Google "Namecheap/Godaddy 1$ domain". This returns a lot of promotional offers with coupon codes that let us buy domains with very low prices for the first year.  

  <img src="/assets/images/2023-09-15-19-32-36.png" width="500">

  <img src="/assets/images/2023-09-15-19-33-01.png" width="500">

* The companies selling domains are called Registrars eg. Godaddy, Namecheap, Bigrock, etc
* I found the domain `deepto.xyz` (my name being Deepto) available on Namecheap and went for it, and with the promo code, the total did come to just over $1 including taxes.
* This is how the Namecheap Domain management page looks like:  

  <img src="/assets/images/2023-09-15-19-44-09.png" width="800">
### 2. Changing the Nameserver to Cloudflare
The guide from Cloudflare itself, documents how to setup Cloudflare Nameservers well - [https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)   
Namecheap has a guide as well : [https://www.namecheap.com/support/knowledgebase/article.aspx/9607/2210/](https://www.namecheap.com/support/knowledgebase/article.aspx/9607/2210/)how-to-set-up-dns-records-for-your-domain-in-cloudflare-account/

1. Login to or create a Cloudflare Account - [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. `Add site > Added `deepto.xyz` here > Review your DNS records > Continue >`. It shows us the DNS records and then shows us the nameservers we need to add on the registrar.  

    <img src="/assets/images/2023-09-15-21-03-09.png" width="500">
    <img src="/assets/images/2023-09-15-21-03-48.png" width="500">  
3. On the registrar (Namecheap) dashboard, first `disable DNSSEC` if enabled.
4. Go to the `Domain settings > Nameservers`. Change from Namecheap Basic DNS to Custom DNS, and add the nameservers from the cloudflare page  

    <img src="/assets/images/2023-09-15-21-14-17.png" width="500">
5. Re enable DNSSEC, if disabled before
6. Now we have to wait for upto 24 hours, for the NS change to reflect
7. Ways to verify the nameserver -
    * https://lookup.icann.org/en/lookup , or 
    * `dig deepto.xyz NS`, or
    * https://www.whatsmydns.net

    In my case, the ICANN lookup returned the updated NS immediately:  
    <img src="/assets/images/2023-09-15-21-26-32.png" width="500">  

    But dig still returned the old one:   
    <img src="/assets/images/2023-09-15-21-25-47.png" width="500">

    Reason : It may take up to 24-48 hours (in rare cases more) for local ISPs to update their DNS caches so that everyone can see your website. Since the caching time varies between ISPs, it takes time for DNS changes to be totally in effect.  
    
    Here's what https://www.whatsmydns.net/ showed:  
    <img src="/assets/images/2023-09-15-21-30-08.png" width="700">  
    As we can see most locations' ISPs show the cached results

    After a while, when I checked it with dig, it reflected there as well:  
      <img src="/assets/images/2023-10-27-16-58-29.png" width="600">
8. Now we've successfully changed the NS of our domain from Namecheap to Cloudflare.

### 3. AWS Bucket and Static Hosting
I want to create a blog (we'll do the blog in the next part though, for now I'll use a simple HTML file), put it on an S3 bucket, and point `www.deepto.xyz` to it. To do that, we need to :
* First, create a bucket with a suitable name i.e `deepto.xyz`
* Second, tell my Cloudflare DNS where the bucket is using CNAME (Canonical Name)

    #### 1. Creating a bucket
  1. Go to the AWS S3 Console - `https://s3.console.aws.amazon.com/` > Create bucket >
  2. The bucket name must match the intended website on which its to be hosted, including the subdomain (ie abc. xyz.com). For me, its `www.deepto.xyz`  

      <img src="/assets/images/2023-10-28-14-38-26.png" width="500">
  3. Allow public access   

      <img src="/assets/images/2023-10-28-02-57-20.png" width="500">
  4. Now we can see the bucket, but it has no objects :  

      <img src="/assets/images/2023-10-28-14-39-58.png" width="500">
  5. For now, we'll just create a simple HTML file as an object. This will be served on our endpoint. `Add Files > Choose File > Upload`  
  
       <img src="/assets/images/2023-10-28-14-42-34.png" width="600" align="center">
       <img src="/assets/images/2023-10-28-14-43-41.png" width="600" align="center">
  6. Now we can view the object: 
   
       <img src="/assets/images/2023-10-28-14-44-30.png" width="1300">
  7. But if we go to the object url, we get an Access denied error:  

      <img src="/assets/images/2023-10-28-14-45-23.png" width="800">
  8. This is because objects aren't public by default, and have to be made public through it's Permissions. The default Permissions are - only readable and writable by the owner :   

      <img src="/assets/images/2023-10-28-14-46-44.png" width="700">     
  9. To change it, we need to create a bucket policy. Go to the `Bucket Page > Permissions > Bucket policy > Edit`:  

      <img src="/assets/images/2023-10-28-14-48-56.png" width="600"> 
  10. We can use sample policies, or the Policy Generator. I need a policy to allow public read access to objects in my Amazon S3 bucket. Found a article - https://repost.aws/knowledge-center/read-access-objects-s3-bucket. The policy (made some changes, though the version date to stay same I realized):
      ```
          {
            "Version":"2012-10-17",
            "Statement":[
              {
                "Sid":"AddPublicRead",
                "Effect":"Allow",
                "Principal": "*",
                "Action":["s3:GetObject"],
                "Resource":["arn:aws:s3:::deepto.xyz/*"]
                }
            ]
          }
      ```
      <img src="/assets/images/2023-10-28-14-50-50.png" width="700">
  11. Now if I hit the object  URL for the `test.html` object (https://s3.ap-south-1.amazonaws.com/www.deepto.xyz/index.html), I get served the html page:  

      <img src="/assets/images/2023-10-28-14-51-59.png" width="500">
  12. One last thing we need to do is to allow static site hosting for the bucket. This will also give us the site representation of the bucket, which we'll put at our domain's CNAME in CLoudflare. Go to `Amazon S3 > Buckets > deepto.xyz > Properties > Static website hosting > Enable this`    
    <img src="/assets/images/2023-10-28-08-25-50.png" width="500" align="center">
    <img src="/assets/images/2023-10-28-14-53-55.png" width="500" align="center">
    
        Now when we go to `Static Website Hosting`, we get an URL, which is what we need to add for the CNAME in DNS. This is the site representation of the bucket. This URL also leads us to the object HTML page.  

         <img src="/assets/images/2023-10-28-14-54-48.png" width="500"> 

    #### 2. Changing the DNS 

    Now we need to tell the Cloudlare DNS to go to my bucket, when we hit `www.deepto.xyz`.   
    * Go to `Cloudlare Dashboard > DNS > Records`  
        <img src="/assets/images/2023-10-28-08-07-52.png" width="500">  
    * Here, we want the CNAME for www i.e the endpoint `www.deepto.xyz` to point to the static hosting URL we have. Had we used another subdomain for our blog, e.g `blog.deepto.xyz`, we would've added a CNAME record for blog. Since I'll host the blog at the root i.e www.deepto.xyz, I'll edit the existing CNAME for `www`. We also disable the Proxy (https://developers.cloudflare.com/dns/manage-dns-records/reference/proxied-dns-records/). So we edit it:  

        <img src="/assets/images/2023-10-28-14-56-56.png" width="800">
    * Succcess, now if I hit `www.deepto.xyz`, I get served the HTML from the static hosting url, which fetches the html object from the `www.deepto.xyz` S3 bucket:  
        <img src="/assets/images/2023-10-28-14-58-17.png" width="400">
### References:
1. CNAME : https://www.cloudflare.com/learning/dns/dns-records/dns-cname-record/
2. https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/getting-started-s3.html

### Todos:
There's two DNS transfers we can do - 
1. nameserver transfer, which we did in this blog
2. seller transfer, where we transfer the ownership of the entire domain from one provider to another. I should try this later
