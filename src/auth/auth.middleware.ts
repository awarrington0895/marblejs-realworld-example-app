import { of } from "rxjs";
import config from "./config";

import { authorize$ as jwt$ } from "@marblejs-contrib/middleware-jwt";

const verifyPayload$ = (payload: any) => of(payload);

const authorize$ = jwt$(config, verifyPayload$);

export { authorize$ };
