---
title: Learning Rust
description:  Learning Rust
date: 2023-12-01
tags:
  - posts
layout: layouts/post.njk
draft: true
---
<i>In this series, I'll document my second attempt at learning Rust.</i> 

## 1. Installing Rust
There is an official Rust toolchain installer called Rustup which eases the installation with a shell script: `https://rustup.rs/`. A single shell script handles it for us, and also installs Cargo:  
`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

## 2. Hello World Program
Cargo, the Rust package manager, can be used to bootstrap Rust projects.
```
cargo new hello-world
cd hello-world
cargo run
```
![](assets/2023-12-02-04-56-00.png)

After creating the project with `cargo new hello-world`, the files we find are:
```
➜  hello-world git:(master) ✗ tree ./
./
├── Cargo.toml        // Project's metadata (name, version, dependencies, etc)
└── src               // Source code (.rs files)
    └── main.rs

1 directory, 2 files
``` 
The code in `src/main.rs`:
```
fn main() {
    println!("Hello, world!");
}
```
When we run `cargo run`, cargo compiles the code in debug mode and runs it. It also generates a few artifact files. Now the directory structure looks like:
```
➜  hello-world git:(master) ✗ cargo run
   Compiling hello-world v0.1.0 (/home/deepto/Projects/rust-learning/hello-world)
    Finished dev [unoptimized + debuginfo] target(s) in 0.63s
     Running `target/debug/hello-world`
Hello, world!
➜  hello-world git:(master) ✗ tree --dirsfirst     
.
├── src
│   └── main.rs
├── target
│   ├── debug
│   │   ├── build
│   │   ├── deps
│   │   │   ├── hello_world-5e84b092352a32a3
│   │   │   └── hello_world-5e84b092352a32a3.d
│   │   ├── examples
│   │   ├── incremental
│   │   │   └── hello_world-28m3xis0tp9wh
│   │   │       ├── s-gr4ec5y9jj-7cqdwd-2bbzp842aeufaq50j9b6zlxgv
│   │   │       │   ├── 23yt072svkxw1ymi.o
│   │   │       │   ├── 420glbw98w5zoy2w.o
│   │   │       │   ├── 47rb5w721412dl8v.o
│   │   │       │   ├── 492ckfy3yartme83.o
│   │   │       │   ├── 5bjfyodxqi4i1caq.o
│   │   │       │   ├── dep-graph.bin
│   │   │       │   ├── query-cache.bin
│   │   │       │   ├── wd2i466mddtsmwd.o
│   │   │       │   └── work-products.bin
│   │   │       └── s-gr4ec5y9jj-7cqdwd.lock
│   │   ├── hello-world
│   │   └── hello-world.d
│   └── CACHEDIR.TAG
├── Cargo.lock
└── Cargo.toml

9 directories, 18 files
```
Cargo, by default compiles to a debug build. We can also compile to a release build with `cargo run --release`. Release builds are much faster at runtime, but take longer to compile. If we delete the `target` directory and run `cargo run --release` , then the directory structure looks like: 
```
➜  hello-world git:(master) ✗ cargo run --release 
   Compiling hello-world v0.1.0 (/home/deepto/Projects/rust-learning/hello-world)
    Finished release [optimized] target(s) in 0.35s
     Running `target/release/hello-world`
Hello, world!
➜  hello-world git:(master) ✗ tree --dirsfirst    
.
├── src
│   └── main.rs
├── target
│   ├── release
│   │   ├── build
│   │   ├── deps
│   │   │   ├── hello_world-eead7b558f92ebbe
│   │   │   └── hello_world-eead7b558f92ebbe.d
│   │   ├── examples
│   │   ├── incremental
│   │   ├── hello-world
│   │   └── hello-world.d
│   └── CACHEDIR.TAG
├── Cargo.lock
└── Cargo.toml

7 directories, 8 files
``` 
I'll explore all of these files later, but at a high level:
* `target/debug/hello-world` or `target/release/hello-world` - is the executable binary which cargo compiles from the code
* `Cargo.toml` - Contains the version numbers of the dependencies specified in Cargo.toml, akin to Go.sum in GOlang or package.lock in Javascript projects.
 