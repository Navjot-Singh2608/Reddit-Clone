import { Button, IconButton } from "@chakra-ui/button";
import { useForceUpdate } from "@chakra-ui/hooks";
import Icon from "@chakra-ui/icon";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DeleteIcon,
  EditIcon
} from "@chakra-ui/icons";
import { Box, Flex, Heading, Link, Stack, Text } from "@chakra-ui/layout";
import { withUrqlClient } from "next-urql";

import NextLink from "next/link";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import {
  usePostsQuery,
  PostsQuery,
  useDeletePostMutation,
  useUserQuery
} from "../generated/graphql";
import { createUrqlClient } from "../utils/cUrqlClient";
import styles from "../styles/home.module.css";
import { EditDeletePostButton } from "../components/EditDeletePostButton";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 3,
    cursor: null as null | string
  });
  console.log(variables);
  const [showCompletePost, setShowCompletePost] = useState("");
  const [showCompleteId, setShowCompleteId] = useState("");

  const data1 = usePostsQuery({
    variables
  });

  const [, deletePost] = useDeletePostMutation();

  // console.log("fetching");
  // console.log(data1);
  // if(data1[0].fetching){

  // }

  console.log(data1[0]?.data?.posts?.posts);

  let data = data1[0]?.data?.posts?.posts;
  let hasMore = data1[0]?.data?.posts?.hasMore;
  // let fetching = data?.fetching;
  //let error = data?.error;
  //&& !fetching && !data

  // if (error) {
  //   return <div>{error?.message}</div>;
  // }

  if (!data) {
    console.log(data1);
    return (
      <div>
        No Posts <p>{data1[0]?.error?.message}</p>
      </div>
    );
  }

  const showMore = (p: any) => {
    let showAllPost = false;
    return (
      <div>
        {p.text.slice(0, 150) + "..."}
        <Flex className={styles.readMore} justifyContent="flex-end">
          <Button onClick={() => showMoreFlag(p, true)} size="xs">
            Read More
          </Button>
        </Flex>
      </div>
    );
  };

  function showMoreFlag(p: any, flag: any) {
    p.show = flag;
    setShowCompleteId(p.id);
    setShowCompletePost(flag);
  }

  const showLess = (p: any) => {
    return (
      <div>
        {p.text}
        <Flex className={styles.readless} mt="2" justifyContent="flex-end">
          <Button onClick={() => showMoreFlag(p, false)} size="xs">
            Read Less
          </Button>
        </Flex>
      </div>
    );
  };

  console.log(data);

  return (
    <Layout>
      <Flex align="center">
        <Heading>RedditClone</Heading>
      </Flex>

      {!data1[0]!.data!.posts!.posts ? (
        <div>loading...</div>
      ) : (
        <div>
          <Stack mt={4} spacing={8}>
            {console.log(data)}
            {data?.map((p: any) =>
              !p ? null : (
                <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                  <UpdootSection post={p} />
                  <Box flex={1}>
                    <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                      <Link>
                        <Heading fontSize="xl">{p.title}</Heading>
                      </Link>
                    </NextLink>
                    <Text fontWeight="bold" color="darkgrey">
                      Posted By - {p.creator.username}
                    </Text>
                    {/* <Text mt={4}>{p.textSnippet}</Text> */}
                    <Flex>
                      <Text mt={4}>
                        {p.text.length > 150
                          ? p!.show
                            ? showLess(p)
                            : showMore(p)
                          : p!.show
                          ? p.text
                          : p.text.slice(0, 150) + "..."}
                      </Text>
                      <Box ml="auto">
                        <EditDeletePostButton
                          creatorId={p.creator.id}
                          id={p.id}
                        />
                      </Box>
                    </Flex>
                  </Box>
                </Flex>
              )
            )}
          </Stack>
        </div>
      )}
      {data && hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor:
                  data1[0]!.data!.posts!.posts[
                    data1[0]!.data!.posts!.posts.length - 1
                  ].createdAt
              });
            }}
            m="auto"
            my={6}
          >
            load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
