import {ILogger} from "../plugin/share/types";
import log from "electron-log";

class Logger implements ILogger{
    constructor() {
        // 日志文件等级，默认值：false
        log.transports.file.level = 'debug';
        // 日志控制台等级，默认值：false
        log.transports.console.level = 'debug';
        // 日志文件名，默认：main.log
        log.transports.file.fileName = 'main.log';
        // 日志格式，默认：[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}
        log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}';
        // 日志大小，默认：1048576（10M），达到最大上限后，备份文件并重命名为：main.old.log，有且仅有一个备份文件
        log.transports.file.maxSize = 10485760;
        // 日志文件位置：C:\Users\%USERPROFILE%\AppData\Roaming\Electron\logs
        // 完整的日志路径：log.transports.file.file，优先级高于 appName、fileName

        // Optional, initialize the logger for any renderer processses
        log.initialize({ preload: true });
        // log.initialize({ spyRendererConsole: true });
    }

    info(msg: string | number): void {
        log.info(msg)
    }

    debug(msg: string | number): void {
        log.debug(msg)
    }

    warn(msg: string | number): void {
        log.warn(msg)
    }

    error(msg: string | number | Error): void {
        log.error(msg)
    }
}

const logger = new Logger()
export default logger;
