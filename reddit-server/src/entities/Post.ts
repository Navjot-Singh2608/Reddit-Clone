import { ObjectType, Field, Int } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany
} from "typeorm";
import { User } from "./User";
import { Updoot } from "./Updoot";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field(() => Int, { nullable: true })
  voteStatus: number | null; // 1 or -1 or null

  @Field()
  @Column()
  creatorId: number;

  @ManyToOne(() => User, (user) => user.posts)
  @Field(() => User)
  creator: User;

  @OneToMany(() => Updoot, (Updoot) => Updoot.user)
  updoots: Updoot[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}

// import { ObjectType, Field, Int } from "type-graphql";
// import {
//   Entity,
//   Column,
//   PrimaryGeneratedColumn,
//   CreateDateColumn,
//   UpdateDateColumn,
//   BaseEntity,
//   ManyToOne,
//   OneToMany
// } from "typeorm";
// import { User } from "./User";

// @ObjectType()
// @Entity() // entity correspondes to the table in the database
// export class Post extends BaseEntity {
//   @Field()
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @Field()
//   @Column()
//   title!: string;

//   @Field()
//   @Column()
//   text!: string;

//   @Field()
//   @Column({ type: "int", default: 0 })
//   points!: number;

//   @Field()
//   @Column()
//   creatorId: number;

//   @Field()
//   @ManyToOne(() => User, (user) => user.posts)
//   creator: User;

//   @Field(() => String)
//   @CreateDateColumn() // Property tell us it's just the regular column in the table
//   createdAt: Date;

//   @Field(() => String)
//   @UpdateDateColumn()
//   updatedAt: Date;
// }
