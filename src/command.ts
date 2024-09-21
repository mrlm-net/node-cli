import yargs from "yargs";
import Engine from "./engine";

export interface Command {
    aliases?: Alias | Alias[];
    builder?: Builder;
    command: Name;
    deprecated?: Deprecated;
    description?: Description;
    handler: Handler;
}

export interface HandlerInputParameters {
    logger: Engine["logger"];
    settings: Engine["settings"];   
    isVerboseMode: boolean;
    verboseLog: (msg: string, level?: string) => void;
    prompt: any;
    yargs: yargs.Argv;
}

export type Alias = string;
export type Builder = (yargs?: yargs.Argv) => yargs.Argv | yargs.BuilderArguments<yargs.Argv>;
export type Description = string;
export type Deprecated = boolean;
export type Handler = (params: HandlerInputParameters) => void;
export type Middleware = (args?: yargs.Argv) => void;
export type Name  = string;
