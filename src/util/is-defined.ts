export const isDefined = <T>(val: T): val is NonNullable<T> =>
  val !== null && val !== undefined;
