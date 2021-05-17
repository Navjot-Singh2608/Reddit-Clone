import { Query, Resolver } from "type-graphql";

@Resolver()
export class UserResolvers {
  @Query(() => String)
  user() {
    return "Hello World";
  }
}
