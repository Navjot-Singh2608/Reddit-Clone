import { Button } from "@chakra-ui/button";
import { Box } from "@chakra-ui/layout";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { route } from "next/dist/next-server/server/router";
import { Router, useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import {
  usePostQuery,
  useUpadatePostMutation
} from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/cUrqlClient";
import { useGetIntId } from "../../../utils/useGetIntId";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";

export const EditPost = ({}) => {
  const router = useRouter();
  const intId = useGetIntId();
  const data1 = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId
    }
  });

  const data = data1[0].data;
  const fetching = data1[0].fetching;

  const [, updatePost] = useUpadatePostMutation();

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
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          console.log(values);
          // const { error } = await createPost({ input: values });
          // console.log(error);
          // if (!error) {
          //   router.push("/");
          // }
          await updatePost({ id: intId, ...values });
          router.push("/");
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
                Update Post
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
