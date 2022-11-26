export interface CloudflareWorkersContextFunctionArgument<TEnv> {
  request: Request
  env: TEnv
  ctx: ExecutionContext
}
