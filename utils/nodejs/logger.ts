import winston from 'winston'
import { dir } from './file'

export function createLogger(filename?: string) {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.printf((info) => {
        const infoLevel = winston.format
          .colorize()
          .colorize(info.level, `${info.timestamp} [${info.level}]`)
        return `${infoLevel}: ${info.message}`
      }),
      silent: process.env.NODE_ENV === 'test',
    }),
  ]

  if (filename) {
    transports.push(...[
      new winston.transports.File({
        filename: dir(`D:/logs/${filename}.log`),
      }),
      new winston.transports.File({
        filename: dir(`D:/logs/${filename}.error.log`),
        level: 'error',
      }),
    ])
  }

  return winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`,
      ),
    ),
    transports,
  })
}

export const logger = createLogger('scripts')
