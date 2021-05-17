import { User } from "../entities/User";
import { UserContext } from "../types";
import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root
} from "type-graphql";
// import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constant";
import { validateRegister } from "../utils/validateUser";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { sendEmail } from "../utils/userct";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: UserContext) {
    //this is the current user and its ok to show them their own email
    if (req.session.userId === user.id) {
      return user.email;
    }
    //current user wants to see someone else email
    return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: UserContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 3) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greator then 3"
          }
        ]
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired"
          }
        ]
      };
    }
    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists"
          }
        ]
      };
    }

    await User.update(
      { id: userIdNum },
      {
        password: await argon2.hash(newPassword)
      }
    );

    await redis.del(key);

    //log in user after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: UserContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      //email do not exist in the db
      return true;
    }

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    );

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
    );
    return true;
  }

  @Query(() => User, { nullable: true })
  user(@Ctx() { req }: UserContext) {
    console.log(req.session);

    // you are not logged in
    if (!req.session.userId) {
      return null;
    }

    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: UserContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const userPassword = await argon2.hash(options.password);
    let user;
    try {
      //User.create({}).save()
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          password: userPassword,
          email: options.email
        })
        .returning("*")
        .execute();

      user = result.raw[0];
    } catch (err) {
      console.log(err);
      if (err.code === "23505" || err.details.includes("already exists")) {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken"
            }
          ]
        };
      }
    }
    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    req.session!.userId = user.id;
    console.log("you are here");
    console.log(user);
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: UserContext
  ): Promise<UserResponse> {
    console.log(usernameOrEmail);
    console.log(password);

    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );

    console.log(user);
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "username doesn't exist"
          }
        ]
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "password doesn't exist"
          }
        ]
      };
    }

    req.session!.userId = user.id;

    return {
      user
    };
  }

  //logout
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: UserContext) {
    //This will remove the session from the redis
    return new Promise((res1) =>
      req.session.destroy((err: any) => {
        //This will clear the cookie
        res.clearCookie(COOKIE_NAME);
        if (err) {
          res1(false);
          return;
        }
        res1(true);
      })
    );
  }
}
