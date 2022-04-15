import { of } from "rxjs";

import { authorize$ as jwt$ } from "@marblejs-contrib/middleware-jwt";

const config = { secret: "supersecret" };

const verifyPayload$ = (payload: any) => of(payload);

const authorize$ = jwt$(config, verifyPayload$);

export { authorize$ };
