const { createLogger, format, transports } = require("winston");
const { combine, timestamp, prettyPrint } = format;
require("winston-daily-rotate-file");

/**
 * '/var/log/app' 폴더에 기록하는 logger 생성
 * @param {String} serviceName - 서비스 이름
 * @returns 생성된 logger
 */
module.exports = function createConsoleAndFileLogger(serviceName) {
  const consoleLogger = new transports.Console();

  const fileLogger = new (require("winston-daily-rotate-file"))({
    filename: `/var/log/app/${serviceName}-%DATE%.log`,
    prepend: true,
    maxSize: '20m',
    maxFiles: '14d'
  })

  return createLogger({
    exitOnError: false,
    format: combine(
      combine(
        timestamp(),
        prettyPrint()
      )
    ),
    defaultMeta: {
      service: serviceName
    },
    transports: [consoleLogger, fileLogger]
  });
}