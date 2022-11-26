import type {
  ApolloServer,
  BaseContext,
  ContextFunction,
  HTTPGraphQLResponse,
} from '@apollo/server'
import type { WithRequired } from '@apollo/utils.withrequired'
import { asHTTPGraphQLRequest } from './asHTTPGraphQLRequest'
import type { CloudflareWorkersContextFunctionArgument } from './CloudflareWorkersContextFunctionArgument'
import type { CloudflareWorkersHandlerOptions } from './CloudflareWorkersHandlerOptions'

export function startServerAndCreateCloudflareWorkersHandler<TEnv>(
  server: ApolloServer<BaseContext>,
  options?: CloudflareWorkersHandlerOptions<TEnv, BaseContext>,
): ExportedHandlerFetchHandler<TEnv>
export function startServerAndCreateCloudflareWorkersHandler<
  TEnv,
  TContext extends BaseContext,
>(
  server: ApolloServer<TContext>,
  options: WithRequired<
    CloudflareWorkersHandlerOptions<TEnv, TContext>,
    'context'
  >,
): ExportedHandlerFetchHandler<TEnv>
export function startServerAndCreateCloudflareWorkersHandler<
  TEnv,
  TContext extends BaseContext,
>(
  server: ApolloServer<TContext>,
  options?: CloudflareWorkersHandlerOptions<TEnv, TContext>,
): ExportedHandlerFetchHandler<TEnv> {
  server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests()

  const defaultContext: ContextFunction<
    [CloudflareWorkersContextFunctionArgument<TEnv>],
    // This `any` is safe because the overload above shows that context can only be left
    // out if you're using BaseContext as your context, and {} is a valid BaseContext.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  > = () => Promise.resolve({})

  const contextFunction: ContextFunction<
    [CloudflareWorkersContextFunctionArgument<TEnv>],
    TContext
  > = options?.context ?? defaultContext

  return async function apolloServerIntegrationCloudflareWorkersHandler(
    request: Request,
    env: TEnv,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const { method, url } = request
    const { pathname } = new URL(url)

    if (pathname !== options?.path || method !== 'POST') {
      return new Response('Path not found.', {
        status: 404,
      })
    }

    let httpGraphqlResponse: HTTPGraphQLResponse

    try {
      httpGraphqlResponse = await server.executeHTTPGraphQLRequest({
        httpGraphQLRequest: await asHTTPGraphQLRequest(request),
        context() {
          return contextFunction({
            ctx,
            env,
            request,
          })
        },
      })
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err)) // TODO: do it better? 🤷‍♂️

      return new Response(error.message, {
        status: 500,
      })
    }

    const { body, headers, status } = httpGraphqlResponse

    if (body.kind === 'chunked') {
      // TODO: check if this is possible in Cloudflare Workers, then implement it
      throw new Error('Incremental delivery not implemented.')
    }

    headers.set(
      'content-length',
      String(new TextEncoder().encode(body.string).byteLength),
    )

    return new Response(body.string, {
      headers,
      status: status ?? 200, // TODO: is returning 200 as fallback correct? are the types wrong?
    })
  }
}
