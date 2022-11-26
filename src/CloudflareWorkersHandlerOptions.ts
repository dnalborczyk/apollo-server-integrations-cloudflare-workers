import type { BaseContext, ContextFunction } from '@apollo/server'
import type { CloudflareWorkersContextFunctionArgument } from './CloudflareWorkersContextFunctionArgument'

export interface CloudflareWorkersHandlerOptions<
  TEnv,
  TContext extends BaseContext,
> {
  context?: ContextFunction<
    [CloudflareWorkersContextFunctionArgument<TEnv>],
    TContext
  >
  path: string
}
