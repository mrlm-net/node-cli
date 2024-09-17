import { createLogger, transports, format} from 'winston';

export default createLogger({
    format: format.combine(
        format.colorize(),
        format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }),
        format.printf(
            (info) => `[DEFAULT] [${info.timestamp}] ${info.level}: ${info.message}`
        ),
        
    ),
    transports: [
        new transports.Console(),
    ]
});