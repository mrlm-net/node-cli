import yargs from "yargs";
import Engine from "./engine";
import prompts from "prompts";
import { ConsoleSettings } from "./console";
import { Logger } from "winston";

export interface Command {
    aliases?: Alias | Alias[];
    builder?: Builder;
    command: Name;
    deprecated?: Deprecated;
    description?: Description;
    handler: Handler;
    middlewares?: Middleware[];
    options?: Options;
}

export interface HandlerInputParameters {
    logger: Logger;   
    isVerboseMode: boolean;
    prompt: prompts.PromptObject;
    verboseLog: (msg: string, level?: string) => void;
    settings: ConsoleSettings;
    yargs: yargs.Argv;
}

export type Alias = string;
export type Builder = (yargs?: yargs.Argv) => yargs.Argv | yargs.BuilderArguments<yargs.Argv>;
export type Description = string;
export type Deprecated = boolean;
export type Handler = (params: HandlerInputParameters) => void;
export type Middleware = (args?: yargs.Argv) => void;
export type Name  = string;
export type Options = {[key: string]: yargs.Options};
