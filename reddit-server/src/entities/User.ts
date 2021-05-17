import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  OneToMany
} from "typeorm";
import { Post } from "./Post";
import { Updoot } from "./Updoot";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];

  @OneToMany(() => Updoot, (Updoot) => Updoot.user)
  updoots: Updoot[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}

// import { Field, ObjectType } from "type-graphql";
// import {
//   BaseEntity,
//   Column,
//   CreateDateColumn,
//   Entity,
//   OneToMany,
//   PrimaryGeneratedColumn,
//   UpdateDateColumn
// } from "typeorm";
// import { Post } from "./Post";

// @ObjectType()
// @Entity() // entity correspondes to the table in the database
// export class User extends BaseEntity {
//   @Field()
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @Field()
//   @Column({ unique: true })
//   username!: string;

//   @Field()
//   @Column({ unique: true })
//   email!: string;

//   @Column()
//   password!: string;

//   @OneToMany(() => Post, (post) => post.creator)
//   posts: Post[];

//   @Field(() => String)
//   @CreateDateColumn() // Property tell us it's just the regular column in the table
//   createdAt: Date;

//   @Field(() => String)
//   @UpdateDateColumn()
//   updatedAt: Date;
// }
