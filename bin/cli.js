#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn, spawnSync } from "node:child_process";
import slugifyModule from "slugify";
const slugify = slugifyModule;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const postsDir = path.join(rootDir, "content", "posts");
const program = new Command();
program
    .name("blog")
    .description("CLI for managing the blog")
    .version("1.0.0");
program
    .command("new [title]")
    .description("Create a new post in content/posts/")
    .action((title) => {
    const finalTitle = title?.trim() || "untitled";
    const slug = slugify(finalTitle, { lower: true, strict: true });
    const date = new Date().toISOString().slice(0, 10);
    const filename = `${date}-${slug}.md`;
    const filepath = path.join(postsDir, filename);
    if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir, { recursive: true });
    }
    if (fs.existsSync(filepath)) {
        console.error(`Post already exists: ${filename}`);
        process.exit(1);
    }
    const template = `---
title: ${finalTitle}
date: ${date}
description: 
tags: []
---

Write your content here.
`;
    fs.writeFileSync(filepath, template, "utf-8");
    console.log(`Created: content/posts/${filename}`);
});
program
    .command("run")
    .description("Start Vite dev server")
    .action(() => {
    const vite = spawn("npx", ["vite"], {
        cwd: rootDir,
        stdio: "inherit",
        shell: true,
    });
    vite.on("close", (code) => process.exit(code ?? 0));
});
program
    .command("build")
    .description("Build for production (output to dist)")
    .action(() => {
    const result = spawnSync("npx", ["vite", "build"], {
        cwd: rootDir,
        stdio: "inherit",
        shell: true,
    });
    process.exit(result.status ?? 0);
});
program.parse();
