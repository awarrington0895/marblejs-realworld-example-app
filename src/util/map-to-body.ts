import { pipe } from "rxjs";
import { map } from "rxjs/operators";

export const mapToBody = () => pipe(map(x => ({ body: x })));
