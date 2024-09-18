import fs from "fs";
import path from "path";
import { globSync } from "glob";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { Console, ConsoleSettings } from "./console";
import Logger from "./logger";

export class Engine implements Console {
    
    protected logger = Logger;

    private _args: yargs.Argv<{}> = yargs(
        hideBin(process.argv)
    );

    private _defaults: ConsoleSettings = {
        configFile: undefined,
        commandDir: "commands",
        demandCommandArguments: 0,
        recursive: true
    }

    private _globalOptions: any = {
        "configFile": {
            alias: "c",
            type: "string",
            description: "Path to a configuration file",
            default: undefined
        },
        "verbose": {
            alias: "v",
            type: "boolean",
            description: "Run with verbose logging",
            default: false
        }
    };

    private _optionSettings: any = {};

    private _settings: ConsoleSettings | undefined = {} as ConsoleSettings;

    constructor(settings?: ConsoleSettings, globalOptions?: any) {
        this.setGlobalOptions(globalOptions);
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
        return this._optionSettings[key.replace(/^\-\-?(.*)$/, "$1")] ||  (
            fallback || (
                this._globalOptions[key.replace(/^\-\-?(.*)$/, "$1")].default || undefined
            )
        );
    }

    protected async loadCommands() {
        this._args.command(
            await Promise.all(
                this.loadCommandModules(this.settings.commandDir || "commands").map(
                    async (module: string) => {
                        const mod = await import(
                            path.resolve(
                                `./${module}.js`
                            )
                        );
                        
                        return { ...mod, handler: (yargs: yargs.Argv) => mod.handler(yargs, this) };
                    }
                )
            )
        ).demandCommand(this.settings.demandCommandArguments)
            .scriptName("node-console")
            .usage("Usage:\n\n  $ $0 [command] [args...]")
            .help()
            .options(this._globalOptions)
            .parse();
    }

    private setGlobalOptions(options: any) {
        this._globalOptions = { ...this._globalOptions, ...options };

        const globalOptionKeysWithAliases: any = {};

        for (let key in this._globalOptions) {
            if (this._globalOptions[key].alias !== undefined) {
                globalOptionKeysWithAliases[this._globalOptions[key].alias] = key;
            }
            globalOptionKeysWithAliases[key] = key;
        }

        process.argv.forEach((arg: string) => {
            if (arg.startsWith(`-`)) {
                const key = globalOptionKeysWithAliases[arg.replace(/^\-\-?(.*)$/, "$1")];
                if (key) {
                    const config = this._globalOptions[key];
                    
                    if (config.type === "boolean") {
                        this._optionSettings[key] = true;
                    } else {
                        this._optionSettings[key] = process.argv[process.argv.indexOf(arg) + 1];
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
        let mask = `${dir}/*`;
        if (this.settings.recursive) {
            mask = `${dir}/**`;
        }

        return globSync(
            path.resolve(`./${mask}`), {
                absolute: false,
                nodir: true,
            }
        ).filter(
            (module: string) => module.split(".")[module.split(".").length - 1] === "js"
        ).map(
            (module: string) => module.split(".").slice(0, -1).join(".")
        );
    }

    private loadConfigFile(): {} {
        const filePath = path.resolve(`./${this.settings.configFile}`)

        if (this.settings.configFile === undefined) {
            this.isVerboseMode() && this.logger.info(
                `Config file not defined, skipping...\n`
            );
            return {};
        }

        if (fs.existsSync(
            filePath
        ) === false) {
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