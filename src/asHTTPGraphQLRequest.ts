import { HeaderMap, type HTTPGraphQLRequest } from '@apollo/server'

// converts a Cloudflare Workers Request to an Apollo Server HTTPGraphQLRequest
export async function asHTTPGraphQLRequest(
  request: Request,
): Promise<HTTPGraphQLRequest> {
  const { headers, method, url } = request

  return {
    body: await request.json(),
    headers: new HeaderMap(headers),
    method,
    search: new URL(url).search,
  }
}
