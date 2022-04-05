import { r } from "@marblejs/http";
import { map } from "rxjs/operators";

const getCurrentUser$ = r.pipe(
  r.matchPath("/user"),
  r.matchType("GET"),
  r.useEffect(req$ =>
    req$.pipe(map(() => ({ body: { user: { email: "alex@example.com" } } })))
  )
);

export { getCurrentUser$ };
