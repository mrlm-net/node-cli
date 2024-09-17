# @mrlm.net/node-console

Simple Node.js CLI application abstract framework to make console apps blazing fast!

## Table of contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

```shell
$ yarn add @mrlm.net/node-console
```

or 

```shell
$ npm install --save @mrlm.net/node-console
```

## Usage

### Basic 

```shell
$ npx @mrlm.net/node-console [command] [...options]
```

### Code

```javascript
#!/usr/bin/env node
import { Engine } from './engine';

(async () => {
  new Engine;
})();

export {
    Engine
}
```

# Advanced

```javascript
#!/usr/bin/env node
import { Engine } from './engine';

(async () => {
  new Engine({
    configFile:   string;
    commandDir?:  string;
    commandType?: string;
  });
})();

export {
    Engine
}
```