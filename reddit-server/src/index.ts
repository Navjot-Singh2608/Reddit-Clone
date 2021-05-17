import "reflect-metadata";
// import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constant";
// import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
import "dotenv-safe/config";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user";
import { PostResolvers } from "./resolvers/post";
// connection with redis
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import path from "path";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Updoot } from "./entities/Updoot";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

// test
const main = async () => {
  //sendEmail("mohit@gmail.com", "Hello there how are you");

  const conn = await createConnection({
    type: "postgres",
    // dbName: "redditclone2",
    url: process.env.DATABASE_URL,
    // username: "postgres",
    // password: "root",
    logging: true,
    // synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User, Updoot]
  });
  await conn.runMigrations();
  //const orm = await MikroORM.init(mikroOrmConfig);
  // await orm.em.nativeDelete(User, {});
  //await orm.getMigrator().up();

  //await Post.delete({});

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);
  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", //csrf
        secure: __prod__, // cookie will only works in https
        domain: __prod__ ? ".redditclone.org" : undefined
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolvers],
      validate: false
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader()
    })
  });

  apolloServer.applyMiddleware({
    app,
    cors: false
  });

  app.listen(parseInt(process.env.PORT), () => {
    console.log("server running on the port 5000");
  });
};

main().catch((err) => {
  console.error(err);
});
