import { Button } from "@chakra-ui/button";
import { Box, Flex, Heading, Link } from "@chakra-ui/layout";
import NextLink from "next/link";
import React from "react";
import { useLogoutMutation, useUserQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";
import styles from "../styles/home.module.css";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const router = useRouter();
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useUserQuery({
    pause: isServer()
  });
  console.log({ data, fetching });
  let body: any = null;

  //data is loading
  if (fetching) {
    //user not logged in
  } else if (!data?.user) {
    body = (
      <div>
        <NextLink href="/login">
          <Link mr="2">login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </div>
    );
    //user logged in
  } else {
    body = (
      <Flex align="center">
        <Box className={styles.createpost} mr={30}>
          <NextLink href="/create-post">
            <Button as={Link} ml="auto">
              Create Post
            </Button>
          </NextLink>
        </Box>

        <Box mr={2}> {data.user.username}</Box>
        <Button
          onClick={async () => {
            await logout();
            router.reload();
          }}
          isLoading={logoutFetching}
          variant="link"
        >
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex zIndex={1} position="sticky" align="center" top={0} bg="tan" p={4}>
      <NextLink href="/">
        <Link>
          <Heading size="sm">Reddit clone</Heading>
        </Link>
      </NextLink>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
