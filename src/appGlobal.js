
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { Logger } from './logger.js'
import cfg from '../config.js'

export default {
  prisma,
  users: new Map(),
  log: new Logger(cfg.log),
  cfg
}