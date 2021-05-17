import { Button } from "@chakra-ui/button";
import { Box } from "@chakra-ui/layout";
import React, { useEffect } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/wrapper";
import { Form, Formik } from "formik";
import { useCreatePostMutation, useUserQuery } from "../generated/graphql";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/cUrqlClient";
import { Layout } from "../components/Layout";
import { useIsAuth } from "../utils/useIsAuth";

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  useIsAuth();

  const [, createPost] = useCreatePostMutation();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values) => {
          console.log(values);
          const { error } = await createPost({ input: values });
          console.log(error);
          if (!error) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="title" label="Title" />
            <Box mt="4">
              <InputField
                textarea
                name="text"
                placeholder="text..."
                label="Body"
              />
            </Box>

            <Box mt={2} style={{ textAlign: "right" }}>
              <Button
                mt={1}
                isLoading={isSubmitting}
                type="submit"
                as="button"
                p={4}
                color="white"
                fontWeight="bold"
                borderRadius="md"
                bgGradient="linear(to-r, green.500,green.500)"
                _hover={{
                  bgGradient: "linear(to-r, green.500, yellow.500)"
                }}
              >
                Create Post
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
