import { Box, Heading } from "@chakra-ui/layout";
import { withUrqlClient } from "next-urql";
import { Router, useRouter } from "next/router";
import React from "react";
import { EditDeletePostButton } from "../../components/EditDeletePostButton";
import { Layout } from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/cUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";
import styles from "./styles/home.module.css";

const Post = ({}) => {
  const [{ data, error, fetching }] = useGetPostFromUrl();

  if (error) {
    return <div>{error.message}</div>;
  }

  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading>{data?.post?.title}</Heading>
      <Box mb={10}>{data?.post?.text}</Box>
      <EditDeletePostButton
        creatorId={data.post.creator.id}
        id={data.post.id}
      />
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
