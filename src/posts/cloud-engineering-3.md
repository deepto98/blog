---
title: Cloud Engineering 2 - Creating and Hosting a Blog on S3 using 11ty 
description:  Cloud Engineering 2 - Creating and Hosting a Blog on S3 using 11ty 
date: 2023-10-30
tags:
  - posts
layout: layouts/post.njk
---
In the last part, I created an 11ty blog and hosted it on the S3 bucket. As of now, the domain still lies with Namecheap, with just the nameserver for `deepto.xyz` transfered to Cloudflare. A nameserver is a type of DNS server. It is the server that stores all DNS records for a domain, including A records, MX records, or CNAME records. Reference on all types of DNS records : https://developers.cloudflare.com/dns/manage-dns-records/reference/

However, deepto.xyz is different from www.deepto.xyz. If we run a few `dig` commands for both, here's what we get  :
* For A (Address) DNS records:  
    ![](assets/2023-10-30-23-45-50.png)  
    While writing this, I had a major AHA moment. `deepto.xyz` resides in Namecheap with the NS transferred to Cloudflare. However, the address (A) record should still lie in Namecheap, but the two URLs listed here, turned out to be Cloudflare ones.  
    ![](assets/2023-10-31-03-13-46.png)  
    I looked into the DNS records on Cloudflare and finally realized what was happening:  
    ![](assets/2023-10-31-03-14-54.png)  
    Here, for the A record, `deepto.xyz` was proxied. DNS queries for proxied DNS records resolve to Cloudflare Anycast IPs instead of their original DNS target. Its explained in depth in the reference  https://developers.cloudflare.com/dns/manage-dns-records/reference/proxied-dns-records/.  
    So, in this case, the `162.255.119.196` IP from Namecheap was proxied and we got two Cloudflare IPs for the address.  
    Then I turned off the proxying.  
    ![](assets/2023-10-31-03-20-52.png)  
    Now, dig returns the Namecheap IP:  
    ![](assets/2023-10-31-03-22-12.png)  
    In essence, the domain still lies with Namecheap, but after transferring the Nameservers toCloudflare, we're using Cloudflare to store DNS records. 
* For NS(Nameserver) records:
    ![](assets/2023-10-31-00-03-19.png)
* For CNAME(Canonical Name) records:
    ![](assets/2023-10-31-00-05-43.png)

In this post, we'll create a new subdomain in a new zone.
Zone : 