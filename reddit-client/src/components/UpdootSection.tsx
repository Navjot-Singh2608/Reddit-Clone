import { IconButton } from "@chakra-ui/button";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex } from "@chakra-ui/layout";
import React from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [{ fetching }, vote] = useVoteMutation();
  console.log("voteing");
  console.log(post);
  console.log(fetching);
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={7}>
      <IconButton
        onClick={() => {
          console.log(post.id);
          if (post.voteStatus === 1) {
            return;
          }
          vote({
            postId: post.id,
            value: 1
          });
        }}
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        isLoading={fetching}
        aria-label="vote"
        icon={<ChevronUpIcon />}
      />
      {post.points}
      <IconButton
        onClick={() => {
          if (post.voteStatus === -1) {
            return;
          }
          vote({
            postId: post.id,
            value: -1
          });
        }}
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        isLoading={fetching}
        aria-label="vote"
        icon={<ChevronDownIcon />}
      />
    </Flex>
  );
};
