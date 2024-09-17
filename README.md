# @mrlm.net/node-console

![NPM Version](https://img.shields.io/npm/v/@mrlm.net/node-console)
![GitHub License](https://img.shields.io/github/license/mrlm-net/node-console)


> This package is BETA release and API might sligthly change!

Simple Node.js CLI application abstract framework to make console apps blazing fast!

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
  - [Basic](#basic)
  - [Code](#code)
  - [Code Advanced](#code-advanced)
  - [Creating Commands](#creating-commands)

## Installation

```shell
$ yarn add @mrlm.net/node-console
```

or 

```shell
$ npm install --save @mrlm.net/node-console
```

## Usage

This small framework was designed to be used as binary CLI command executor (via NPX) or JS/TS module to be inserted into your own CLI application.

### Basic 

```shell
$ npx @mrlm.net/node-console [command] [...options]
```

#### CLI Options

### Code

```typescript
#!/usr/bin/env node
import "@mrlm.net/node-console/engine";
```

### Code Advanced

```typescript
#!/usr/bin/env node
import { Engine } from "@mrlm.net/node-console/engine";

(async () => {
  new Engine({
    configFile?:  string;
    commandDir?:  string;
    commandType?: string;
  });
})();
```

### Creating Commands

#### ECMA Script syntax

```typescript
// Required
export command: string;
export handler(engine, yargs): void;
// Optional
export aliases?: string[];
export builder?: (yargs) => yargs.Args | yargs.Args
```

#### CommonJS syntax

```typescript
// Required
exports.command: string;
exports.handler(engine, yargs): void;
// Optional
exports.aliases?: string[];
exports.builder?: (yargs) => yargs.Args | yargs.Args
```