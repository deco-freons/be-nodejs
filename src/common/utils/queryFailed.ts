/* 
 * src: https://github.com/typeorm/typeorm/issues/5057#issuecomment-734442426
 */

import { DatabaseError } from 'pg-protocol';
import { QueryFailedError } from 'typeorm';

export const isQueryFailedError = (err: unknown): err is QueryFailedError & DatabaseError =>
  err instanceof QueryFailedError;
  