# @mrlm.net/node-cli

![NPM Version](https://img.shields.io/npm/v/@mrlm.net/node-cli)
![GitHub License](https://img.shields.io/github/license/mrlm-net/node-cli)

> This package is in BETA release and API might sligthly change in the future, but since version `0.6.0` you can start using it with this remark in the mind!

Simple Node.js CLI application abstract framework to make console apps blazing fast with zero cofig and small efforts!

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
  - [CLI usage](#cli-usage)
  - [Code](#code)
  - [Creating Commands](#creating-commands)
- [Configuration](#configuration)

## Installation

Depending on your use case you can install package as normal or development dependency. Storing package as development dependency could be useful when you are using this tool just for local development related automations. Also you can create bundle with CLI core and your commands to create your own CLI package which users can use via `NPX`.

```shell
$ yarn add @mrlm.net/node-cli
```

> If you'd like to add it as development dependecy use `$ yarn add -D @mrlm.net/node-cli` command.

or 

```shell
$ npm install --save @mrlm.net/node-cli
```

> If you'd like to install it as development dependecy use `$ npm install --save-dev @mrlm.net/node-cli` command.

## Usage

This small CLI framework was designed to be used as binary CLI command executor (via `NPX`) or `JS/TS` module to be inserted into your own CLI application. Each command is represented by isolated ES module and package can be used as zero-config complex scripts executor.

### CLI usage 

```shell
$ npx @mrlm.net/node-cli [command] [...options]
```

> You can also use command aliases as follows:

```shell
$ npx ncli [command] [...options]
```

```shell
$ npx nc [command] [...options]
```

#### CLI Options

![alt text](/docs/image-cli.png)

### Code

```typescript
#!/usr/bin/env node
import "@mrlm.net/node-cli/autoloader";
```

#### Advanced

```typescript
#!/usr/bin/env node
import { Engine } from "@mrlm.net/node-cli/engine";

(async () => {
  new Engine({
      // global options goes here 
      // please see configuration section for available options
  });
})();
```

### Creating Commands

Creation of a CLI command was never easy as now, you just need to place your commands to the folder named surprisingly `commands`, into the root of your project, you can also configure this by passing `commandDir` configuration property or CLI flag. Pretty simple, huh?

You can also create a infinite subfolder structure and if the `recursive` setting of the CLI tool is set to `true`, which is also by default, you can easily create a complex modules which tool will dynamicaly load and execute.

Each module needs to export several properties, but only two of them are mandatory to make command complient to be registred and excuted. Mandatory is `command` property with string value of the command name, second is a function property called `handler` where input is one argument described by `HandlerInputSettings` interface.

#### Command interface

```typescript
export interface Command {
    aliases?: Alias | Alias[];
    builder?: Builder;
    command: Name;
    deprecated?: Deprecated;
    description?: Description;
    handler: Handler;
}
```

__Command Types__

```typescript
export type Alias = string;
export type Builder = (yargs: yargs.Argv) => yargs.Argv | yargs.BuilderArguments<yargs.Argv>;
export type Description = string;
export type Deprecated = boolean;
export type Handler = (params: HandlerInputParameters) => void;
export type Name  = string;
```

#### HandlerInputParameters interface

```typescript
export interface HandlerInputParameters {
    logger: Logger;
    settings: ConsoleSettings;   
    isVerboseMode: boolean;
    yargs: yargs.Argv;
}
```

### Command Example

```javascript
export const command = "command [args..]"

export const handler = function(engine) {
    // Log message in verbose mode only
    engine.isVerboseMode && engine.logger.info("Command executed!")
    // Log message in all modes
    engine.logger.debug("Command executed!")
}
```

> More examples can be found [here](/docs/examples.md).

## Configuration

Custom configuration of CLI engine is possible via three independent way and their processing is hierarchical as follows `Code < Config file < CLI Flags`. 

### Configuration interface

```typescript
export interface ConsoleSettings {
    bundleDir?: string;
    configFile?: string;
    commandDir?: string;
    commandName?: string;
    demandCommandArguments?: number;
    middlewares?: ((args?: yargs.Argv) => void)[];
    modules?: string[];
    recursive?: boolean;
    verbose?: boolean;  
    verboseLevel?: string;
}
```
### Configuration properties

| Configuration key | Type | Flag | Default | Description |
| :-- | :--: | :--: | :--: | :-- |
| `bundleDir` | `string` | - | `dist` | Directory of the bundle files |
| `configFile` | `string` | `-c, --configFile` | `undefined` | Path to CLI tool and commands configuration file. |
| `commandDir` | `string` | `-d, --commandDir` | `commands`  | Path to directory where command module files are places. |
| `commandName` | `string` | - | `ncli` | Name of the main command binary file to be displayed in the help dialog |
| `demandCommandArguments` | - | `number` | `0` | Number of how many commands should be required in user inputs. |
| `middlewares` | `array` | - | `[]` | List of global middeware functions to be executed before handler. |
| `modules` | `string` | `-m, --module` | `[]` | Name of the node module package where to load commands from. |
| `recursive` | `boolean` | `-r, --recursive` | `true` | If the lookup for the command modules should be recursive or not. |
| `verbose` | `boolean` | `-v, --verbose` | `false` | Turn on or off logger verbose mode. This could be used also inside command handler function as it is part of [`HandlerInputParameters`](#handlerinputparameters-interface) interface. |
| `verboseLevel` | `string` | `-l, --verboseLevel` | `info` | Level of the logger messages to be displayed, this configuration is independent from verbose flag. Be aware that even verbose is set to false command messages could appear if they are not tested for verbose configuration state before, for that you can use `isVerboseMode` property from `HandlerInputParameters` interface. |

_2024 &copy; Martin Hrášek - MRLM.NET_