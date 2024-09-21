import fs from "fs";
import path from "path";
import { globSync } from "glob";
import yargs, { alias, choices } from "yargs";
import { hideBin } from "yargs/helpers";
import{ fileURLToPath } from "url" 
import { dirname } from 'path';
import prompt from "prompts";

import { Console, ConsoleSettings } from "./console";
import Logger, { logger } from "./logger";

export class Engine implements Console {
    
    protected logger = Logger;

    private _args: yargs.Argv<{}> = yargs(
        hideBin(process.argv)
    );

    private _defaults: ConsoleSettings = {
        bundleDir: "dist",
        configFile: undefined,
        commandDir: "commands",
        commandName: "ncli",
        demandCommandArguments: 0,
        middlewares: [],
        modules: [],
        recursive: true,
        verbose: false,
        verboseLevel: "info"
    }

    private _globalOptions: any = {
        "commandDir": {
            alias: "d",
            type: "string",
            description: "Path to a command module files.",
            default: undefined
        },
        "configFile": {
            alias: "c",
            type: "string",
            description: "Path to a configuration file",
            default: undefined
        },
        "modules": {
            alias: "m",
            type: "array",
            description: "Name of module(s) to load commands from.",
            default: []
        },
        "recursive": {
            alias: "r",
            type: "boolean",
            description: "Scan commands recursively.",
            default: true
        },
        "verbose": {
            alias: "v",
            type: "boolean",
            description: "Run with verbose logging",
            default: false
        },
        "verboseLevel": {
            alias: "l",
            type: "string",
            description: "Level of verbose logging",
            choices: ["error", "warn", "info", "debug"],
            default: "info"
        },
    };

    private _optionSettings: any = {};

    private _settings: ConsoleSettings | undefined = {} as ConsoleSettings;

    constructor(settings?: ConsoleSettings, globalOptions?: any) {
        this.setGlobalOptions(globalOptions);
        this.logger.level = this.globalOption("verboseLevel");
        this.isVerboseMode() && this.logger.debug(
            `Constructing NCLI engine...`
        );
        this.initializeSettings({ ...this._defaults, ...settings } as ConsoleSettings);
        this.initializeEngine();
    }

    public get settings(): any {
        return this._settings;
    }

    protected isVerboseMode(): boolean {
        return this.globalOption("verbose");
    }

    protected globalOption(key: string, fallback?: any): any {
        const normalizedKey = key.replace(/^\-\-?(.*)$/, "$1")
        return this._optionSettings[normalizedKey] ||  (
            fallback || (
                this._globalOptions[normalizedKey]?.default || undefined
            )
        );
    }

    protected verboseLog(logger: any, msg: string, level?: string) {
        if (this.isVerboseMode()) {
            switch (level) {
                case "error":
                    logger.error(msg); 
                    break;
                case "warn":
                    logger.warn(msg); 
                    break;
                case "info":
                    logger.info(msg); 
                    break;
                case "debug":
                    logger.debug(msg); 
                    break;
                case "silly":
                    logger.silly(msg);
                    break;
                default:
                    logger.info(msg); 
                    break;
            }    
        }
    }

    private async loadCommands() {
        const commands = await Promise.all(
            this.loadCommandModules(this.settings.commandDir || "commands").map(
                async (module: string) => {
                    this.isVerboseMode() && this.logger.debug(
                        `Loading command "${module}" to NCLI engine...`
                    );

                    const mod = await import(
                        path.resolve(
                            `./${module}.js`
                        )
                    );

                    this.isVerboseMode() && this.logger.debug(
                        `Command loaded "${module}" to NCLI engine...`
                    );

                    // Here we should prepare objects to be injected into the command handler
                    const name = mod.command.split(" ")[0].toUpperCase();
                    const handlerLogger = logger(`${name}`);
                    handlerLogger.level = this.settings.verboseLevel;

                    // Do the similar thing for the middleware handler

                    const middlewares = (mod.middlewares || []).map(
                        (middleware: any) => (args: yargs.Argv) => {
                            middleware({
                                logger: handlerLogger,
                                settings: this.settings,
                                isVerboseMode: this.isVerboseMode(),
                                verboseLog: (msg: string, level: string) => this.verboseLog(handlerLogger, msg, level),
                                prompt: prompt,
                                yargs: args
                            })
                        });

                    // Here we should translate the command interface to a yargs command interface and do some magic via builder function
                    const builder = {
                        builder: (args: yargs.Argv) => {
                            const rawCMD = mod.command.split(" ")[0];
                            args.usage(`Command usage:\n\n  $0 ${mod.command}`)

                            if (mod.options) {
                                args.options(mod.options)
                                    .group(
                                        Object.keys(mod.options), 
                                        `${rawCMD.charAt(0).toUpperCase()}${rawCMD.slice(1)} command options:`
                                    );
                            }
                
                            return (mod.builder) ? mod.builder(args) : args;
                        }
                    };

                    const handler = { 
                        handler: (yargs: yargs.Argv) => {
                            this.isVerboseMode() && console.log("\n");
                            mod.handler({
                                logger: handlerLogger,
                                settings: this.settings,
                                isVerboseMode: this.isVerboseMode(),
                                verboseLog: (msg: string, level: string) => this.verboseLog(handlerLogger, msg, level),
                                prompt: prompt,
                                yargs: yargs
                            })
                        } 
                    }
                
                    // Return the command object
                    return { ...mod, ...builder, ...handler, middlewares };
                }
            )
        );

        this.isVerboseMode() && this.logger.debug(
            `Commands loaded to NCLI engine...`
        );


        const globalMiddlewares = this.settings.middlewares.map(
            (middleware: any) => (args: yargs.Argv) => {
                middleware({
                    logger: this.logger,
                    settings: this.settings,
                    isVerboseMode: this.isVerboseMode(),
                    verboseLog: (msg: string, level: string) => this.verboseLog(this.logger, msg, level),
                    prompt: prompt,
                    yargs: yargs
                })
            }) || [];
        // Configure and excute YARGS instance parse
        this._args.middleware(globalMiddlewares)
            .command(commands)
            .demandCommand(this.settings.demandCommandArguments)
            .usage("Library usage:\n\n  $0 [command] [args...]")
            .scriptName(this.settings.commandName)
            .help()
            .options(this._globalOptions)
            .showHelpOnFail(true)
            // Scale to full terminal width based on window size
            .wrap((this._args.terminalWidth() - 1) < 80 ? 80 : (this._args.terminalWidth() - 1))
            .env("NCLI_")
            .completion()
            .epilogue(`${new Date().getFullYear()} © MRLM.net`)
            .parse();
    }

    private setGlobalOptions(options: any) {
        // Merge global options with provided options to allow user override
        this._globalOptions = { ...this._globalOptions, ...options };

        const globalOptionKeysWithAliases: any = {};

        // CONSIDER throw an error if an alias is already defined
        for (let key in this._globalOptions) {
            if (this._globalOptions[key].alias !== undefined) {
                globalOptionKeysWithAliases[this._globalOptions[key].alias] = key;
            }
            globalOptionKeysWithAliases[key] = key;
        }

        process.argv.forEach((arg: string, index: number) => {
            if (arg.startsWith(`-`)) {
                const key = globalOptionKeysWithAliases[arg.replace(/^\-\-?(.*)$/, "$1")];
                if (key) {
                    const config = this._globalOptions[key];
                    
                    if (config.type === "boolean") {
                        this._optionSettings[key] = true;
                    } else if (config.type === "array") {
                        if (!this._optionSettings[key]) {
                            this._optionSettings[key] = [];
                        }
                        this._optionSettings[key].push(process.argv[index + 1]);

                    } else if (config.type === "string") {
                        this._optionSettings[key] = process.argv[process.argv.indexOf(arg) + 1];
                    } else {
                        this._optionSettings[key] = undefined;
                    }
                }
            }
        });
    }

    private initializeSettings(settings: ConsoleSettings | undefined) {
        const options = this.loadSettingsFromGlobalOptions()
        this._settings = { ...settings, ...options  } as ConsoleSettings;
        this._settings = { 
            ...settings || {} as ConsoleSettings, 
            ...this.loadConfigFile(),
            ...options
        };    
    }

    private async initializeEngine() {
        this.isVerboseMode() && this.logger.debug(
            `NCLI engine has been contstructed...`
        );
        await this.loadCommands();
    }

    private loadSettingsFromGlobalOptions(): {} {
        const settings: any = {};
        for (let key in this._globalOptions) {
            if (this.globalOption(key) !== undefined) {
                 settings[key] = this.globalOption(key);
            }
        }

        return settings;
    }

    private loadCommandModules(dir: string): string[] {
        const mask = (this.settings.recursive) ? `${dir}/**` : `${dir}/*`;

        this.isVerboseMode() && this.logger.info(
            `Loading local command modules from "${path.resolve(`./${mask}`)}"...`
        );

        const local = globSync(
            path.resolve(`./${mask}`), {
                absolute: false,
                nodir: true,
            }
        );

        let bundled: any = [];

        if (this.settings.modules !== undefined && this.settings.modules.length > 0) {
            const binaryPath = dirname(fileURLToPath(import.meta.url));

            const bundlePaths = this.settings.modules.map(
                (module: string) => path.resolve(
                    `node_modules/${module}/${this.settings.bundleDir}`, 
                    `./${mask}`
                ), {
                    absolute: false,
                    nodir: true,
                }
            );

            this.isVerboseMode() && bundlePaths.forEach(
                (bundlePath: string) => this.logger.info(
                    `Loading bundled command modules from "${bundlePath}"...`
                )
            );
            

            bundled = globSync(bundlePaths);
        }
        
        // Load bundle first to allow user to override bundled commands
        return [...bundled, ...local].filter(
            (module: string) => module.split(".")[module.split(".").length - 1] === "js"
        ).map(
            (module: string) => module.split(".").slice(0, -1).join(".")
        );
    }

    private loadConfigFile(): {} {
        const filePath = path.resolve(`./${this.settings.configFile}`)

        if (this.settings.configFile === undefined) {
            this.isVerboseMode() && this.logger.info(
                `Config file not defined, skipping...`
            );
            return {};
        }

        if (fs.existsSync(filePath) === false) {
            this.isVerboseMode() && this.logger.info(
                `Config file "${filePath}" not found, skipping...`
            );
            return {};
        }

        return JSON.parse(
            fs.readFileSync(
                filePath, "utf8"
            )
        );
    }
}

export default Engine;