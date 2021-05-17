import { IconButton } from "@chakra-ui/button";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Link } from "@chakra-ui/layout";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation, useUserQuery } from "../generated/graphql";

interface EditDeletePostButtonProps {
  id: number;
  creatorId: number;
}

export const EditDeletePostButton: React.FC<EditDeletePostButtonProps> = ({
  id,
  creatorId
}) => {
  const [{ data: userData }] = useUserQuery();
  const [, deletePost] = useDeletePostMutation();

  if (userData?.user?.id !== creatorId) {
    return null;
  }

  return (
    <div>
      <IconButton
        mr={3}
        colorScheme="gray"
        ml="auto"
        onClick={() => {
          //alert(p.id);
          deletePost({ id });
        }}
        aria-label="Delete Post"
        size="sm"
        icon={<DeleteIcon />}
      />

      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          colorScheme="gray"
          ml="auto"
          onClick={() => {
            //alert(p.id);
          }}
          aria-label="Edit Post"
          size="sm"
          icon={<EditIcon />}
        />
      </NextLink>
    </div>
  );
};
