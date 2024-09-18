export interface Console {
    settings: ConsoleSettings;    
}

export interface ConsoleSettings {
    configFile?: string;
    commandDir?: string;
    demandCommandArguments?: number;
    recursive?: boolean;
}

