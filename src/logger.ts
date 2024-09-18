import { createLogger, transports, format} from 'winston';

export const logger = (group: string) => createLogger({
    format: format.combine(
        format.colorize(),
        format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }),
        format.printf(
            (info) => `[${group}] [${info.timestamp}] ${info.level}: ${info.message}`
        ),
        
    ),
    transports: [
        new transports.Console(),
    ]
});

export default logger("NCLI");