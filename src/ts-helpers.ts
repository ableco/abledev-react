export type AnyFunction = (...args: any) => any;
export type NoArgsFunction = () => any;

export type FirstParamOrFallback<
  Func extends AnyFunction,
  Fallback,
> = Func extends NoArgsFunction
  ? Fallback
  : Func extends (firstParam: infer FirstParamType, ...args: any) => any
  ? FirstParamType
  : never;
