import dotenv from 'dotenv';
dotenv.config();

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { loadAirports } from './services/airports';
import { createApp } from './app';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';

const PORT = process.env.PORT ?? 3001;

async function start() {
  loadAirports();
  console.log('Airport data loaded.');

  const app = createApp();

  const apollo = new ApolloServer({ typeDefs, resolvers });
  await apollo.start();
  app.use('/graphql', expressMiddleware(apollo));

  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
