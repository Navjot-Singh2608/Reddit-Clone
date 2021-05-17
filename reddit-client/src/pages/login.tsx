import React from "react";
import { Formik, Form } from "formik";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Wrapper } from "../components/wrapper";
import { InputField } from "../components/InputField";
import { Box, Link } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { useLoginMutation } from "../generated/graphql";
import { useRouter } from "next/router";
import { toErrorMap } from "../utils/toErrorMap";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/cUrqlClient";
import NextLink from "next/link";

export const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          console.log(values);
          const response = await login(values);
          console.log(response);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            if (typeof router.query.next === "string") {
              router.push(router.query.next);
            } else {
              // worked
              router.push("/");
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="username Or Email"
              label="Username or Email"
            />
            <Box mt="4">
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              mt={8}
              w="100%"
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              Login
            </Button>
            <Box mt={3} style={{ textAlign: "center" }}>
              <NextLink href="/forgot-password">
                <Link style={{ color: "#1877f2" }}>forgot password?</Link>
              </NextLink>
            </Box>
            <Box mt={2} style={{ textAlign: "center" }}>
              <Button
                mt={1}
                w="100%"
                as="button"
                p={4}
                color="white"
                fontWeight="bold"
                borderRadius="md"
                bgGradient="linear(to-r, red.500,green.500)"
                _hover={{
                  bgGradient: "linear(to-r, red.500, yellow.500)"
                }}
              >
                Create New Account
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
