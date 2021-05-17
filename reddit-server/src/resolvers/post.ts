import { Post } from "../entities/Post";
import { UserContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware
} from "type-graphql";
import { isAuth } from "../middleware/isauth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolvers {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 150);
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: UserContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: UserContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId
    });

    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: UserContext
  ) {
    const isUpdoot = value !== -1;
    const userValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    const updoot = await Updoot.findOne({ where: { postId, userId } });

    // they have voted but they want to change their vote
    if (updoot && updoot.value !== userValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          update updoot set value = $1 where "postId" = $2 and "userId" = $3
          `,
          [userValue, postId, userId]
        );

        await tm.query(
          `
          update post
            set points = points + $1
            where id = $2;
          `,
          [2 * userValue, postId]
        );
      });
    } else if (!updoot) {
      // voting for the first time

      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          insert into updoot("userId","postId",value)
          values($1,$2,$3);
          `,
          [userId, postId, userValue]
        );

        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2;
          `,
          [userValue, postId]
        );
      });
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    // @Ctx() { req }: UserContext
  ): Promise<PaginatedPosts> {
    const reallimit = Math.min(50, limit);
    const realLimitPlusOne = reallimit + 1;
    console.log(reallimit);

    const replacements: any[] = [realLimitPlusOne];

    //  if(req.session.userId){
    //    replacements.push(req.session.userId)
    //   }

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    console.log("yyyyyyyyyy");

    const posts = await getConnection().query(
      `
      select p.*
      from post p
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
      `,
      replacements
    );

    console.log("ooooooooooooooooo");

    console.log("*******************");

    // const posts = await qb.getMany();

    console.log(posts);

    return {
      posts: posts.slice(0, reallimit),
      hasMore: posts.length === realLimitPlusOne
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: UserContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: UserContext
  ): Promise<Post | null> {
    console.log("yyyyyyyyyy77777777");
    console.log(id);
    console.log(title);
    console.log(text);
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId"=:creatorId', {
        id,
        creatorId: req.session.userId
      })
      .returning("*")
      .execute();
    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: UserContext
  ): Promise<boolean> {
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
