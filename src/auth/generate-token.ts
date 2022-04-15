import {
  Payload,
  generateToken as generate,
} from "@marblejs-contrib/middleware-jwt";
import config from "./config";

export const generateToken = (payload: Payload) => {
  return generate(config)(payload);
};
