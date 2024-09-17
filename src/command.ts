import yargs from "yargs";

export interface Command {
    aliases?: Alias | Alias[];
    builder?: Builder;
    command: Name;
    deprecated?: Deprecated;
    description?: Description;
    handler: Handler;
}

export type Alias = string;
export type Builder = (yargs: yargs.Argv) => yargs.Argv | yargs.BuilderArguments<yargs.Argv>;
export type Description = string;
export type Deprecated = boolean;
export type Handler = () => void;
export type Name  = string;
