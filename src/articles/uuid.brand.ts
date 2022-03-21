import { t } from '@marblejs/middleware-io';
import validator from 'validator';

interface UUIDBrand {
  readonly UUID: unique symbol;
}

export const UUID = t.brand(
  t.string,
  (str): str is t.Branded<string, UUIDBrand> => validator.isUUID(str),
  'UUID'
);