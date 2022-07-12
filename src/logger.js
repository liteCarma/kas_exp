import pino from 'pino'
import fs from 'fs'
import { ApiError } from './api/errors.js'

export const Logger = class Logger  {
  constructor(filePath) {
    this._logger = pino({
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: true
        }
      },
    })
    
    this._fileLogger = null

    if (filePath) {
      try {
        fs.accessSync(filePath)
        fs.unlinkSync(filePath)
      } catch {}
      
      this._fileLogger = pino(filePath)
    }
  }

  info(msg, toFile) {
    this._loggerWrapper('info', msg, toFile)
  }

  warn(msg, toFile) {
    this._loggerWrapper('warn', msg, toFile)
  }

  error(msg, toFile) {
    this._loggerWrapper('error', msg, toFile)
  }

  _loggerWrapper (type, msg, toFile) {
    this._logger[type](msg)
    if (toFile && this._fileLogger !== null) {
      this._fileLogger[type](msg)
    }
  }
}