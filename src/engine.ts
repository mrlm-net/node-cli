import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { Console } from "./console";

export interface EngineSettings {
    configFile: string;
}

export default class Engine implements Console {
    private _args: yargs.Argv<{}> = yargs(hideBin(process.argv));

    private _settings: EngineSettings;

    constructor(settings: EngineSettings) {
        this._settings = settings;
    }

    get settings(): any {
        return this._settings;
    }

    get args(): yargs.Argv<{}> {
        return this._args || [];
    }
}

export {
    Engine
}