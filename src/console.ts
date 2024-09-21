import yargs from 'yargs';

export interface Console {
    settings: ConsoleSettings;    
}

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

