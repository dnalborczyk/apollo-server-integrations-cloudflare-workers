# Apollo Server Integration for Cloudflare Workers

## **Installation**

```bash
npm install apollo-server-integrations-cloudflare-workers @apollo/server graphql
```

## **Usage**

```typescript
import { ApolloServer } from '@apollo/server'
import { startServerAndCreateCloudflareWorkersHandler } from 'apollo-server-integrations-cloudflare-workers'

interface Context {
  // ....
}

interface Environment {
  // ...
}

const resolvers = {
  Query: {
    hello: () => 'world',
  },
}

const typeDefs = `
  type Query {
    hello: String
  }
`

const apolloServer = new ApolloServer<Context>({
  resolvers,
  typeDefs,
})

export default {
  fetch: startServerAndCreateCloudflareWorkersHandler<Environment, Context>(
    apolloServer,
    {
      async context() {
        return {
          // ...
        }
      },
      path: '/graphql',
    },
  ),
}
```

## Example projects

**Apollo Server v4**

https://github.com/dnalborczyk/apollo-server-cloudflare-workers

**Apollo Federation v2** with Apollo Server v4, Apollo Gateway v2, Apollo Subgraph v2

https://github.com/dnalborczyk/apollo-federation-cloudflare-workers
