---
title: Learning Rust
description:  Learning Rust
date: 2023-12-01
tags:
  - posts
layout: layouts/post.njk
draft: true
---
# Learning Rust Part I : Getting Started
<i>In this series, I'll document my second attempt at learning Rust. I'm following the Rust in Action book by Tim McNamara</i> 

## 1. Installing Rust
There is an official Rust toolchain installer called Rustup which eases the installation with a shell script: `https://rustup.rs/`. A single shell script handles it for us, and also installs Cargo, the Rust dependency manager:   
`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

## 2. Compiling a Single Rust File with rustc
Rustc is the Rust compiler which translates Rust source code into machine code. It creates an executable with the same name as that of the source code file. We create a directory `test`, and in it add a simple Rust program in a file `test.rs`:
```
// test.rs
fn main() {
    println!("OK")
}

```
We then compile it using `rustc test.rs`. This generates the `test` executable. Running the executable gives us the output we expect.
```
➜  hello-world git:(master) ✗ cd test      
➜  test git:(master) ✗ rustc test.rs
➜  test git:(master) ✗ tree   
.
├── test
└── test.rs

0 directories, 2 files
➜  test git:(master) ✗ ./test 
OK
➜  test git:(master) ✗ 
``` 
## 3. Compiling a Hello World Project with Cargo
Cargo, the Rust package manager, can be used to bootstrap Rust projects, which are more than one single file and include dependencies. Cargo uses rustc under the hood. The `cargo new project-name` command can be used to create a new Rust project.
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
```powershell-interactive
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
There also exists a `-q` (quiet) flag to reduce the output:
```
➜  hello-world git:(master) ✗ cargo run -q --release
Hello, world!
```
I'll explore all of these files later, but at a high level:
* `target/debug/hello-world` or `target/release/hello-world` - is the executable binary which cargo compiles from the code
* `Cargo.toml` - Contains the version numbers of the dependencies specified in Cargo.toml, akin to Go.sum in Golang or package.lock in Javascript projects.

As I'd mentioned at the start of this section, Cargo uses rustc under the hood, and runs it with a bunch of config through flags. To understand them in detail, we can recompile the code with the verbose `v` flag.
```
➜  hello-world git:(master) ✗ rm -rf target 
➜  hello-world git:(master) ✗ cargo run -v 
   Compiling hello-world v0.1.0 (/home/deepto/Projects/rust-learning/hello-world)
     Running `/home/deepto/.rustup/toolchains/stable-x86_64-unknown-linux-gnu/bin/rustc --crate-name hello_world --edition=2021 src/main.rs --error-format=json --json=diagnostic-rendered-ansi,artifacts,future-incompat --diagnostic-width=82 --crate-type bin --emit=dep-info,link -C embed-bitcode=no -C debuginfo=2 -C metadata=5e84b092352a32a3 -C extra-filename=-5e84b092352a32a3 --out-dir /home/deepto/Projects/rust-learning/hello-world/target/debug/deps -C incremental=/home/deepto/Projects/rust-learning/hello-world/target/debug/incremental -L dependency=/home/deepto/Projects/rust-learning/hello-world/target/debug/deps`
    Finished dev [unoptimized + debuginfo] target(s) in 0.27s
     Running `target/debug/hello-world`
Hello, world!
``` 