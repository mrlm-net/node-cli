export interface Console {
    settings: ConsoleSettings;    
}

export interface ConsoleSettings {
    bundleDir?: string;
    configFile?: string;
    commandDir?: string;
    commandName?: string;
    demandCommandArguments?: number;
    module?: string;
    recursive?: boolean;
    verbose?: boolean;  
    verboseLevel?: string;
}

