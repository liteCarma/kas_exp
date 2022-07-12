import appGlobal from '../appGlobal.js'
import { ApiError } from '../api/errors.js';
const { log } = appGlobal

export const errorHandler = (error, req, res, next) => {
  log.error({message: error.message, stack: error.stack}, true);

  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ApiError) {
    res.status(200).json({ error: { message: error.message, type: error.name } });
  }
  res.status(500).json({ error:  { message: error.message, type: 'ServerError' } });
}
