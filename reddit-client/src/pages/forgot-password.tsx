import React, { useState } from "react";
import { Formik, Form } from "formik";
import { Wrapper } from "../components/wrapper";
import { InputField } from "../components/InputField";
import { Box } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { useForgotPasswordMutation } from "../generated/graphql";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/cUrqlClient";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();

  return (
    <div>
      <Wrapper variant="small">
        <Formik
          initialValues={{ email: "" }}
          onSubmit={async (values, { setErrors }) => {
            await forgotPassword(values);
            setComplete(true);
          }}
        >
          {({ isSubmitting }) =>
            complete ? (
              <Box>
                If an account with that email exists, we send you an email
              </Box>
            ) : (
              <Form>
                <InputField
                  name="email"
                  placeholder="email"
                  label="Email"
                  type="email"
                />

                <Button
                  mt={8}
                  w="100%"
                  type="submit"
                  isLoading={isSubmitting}
                  colorScheme="teal"
                >
                  forgot password
                </Button>
              </Form>
            )
          }
        </Formik>
      </Wrapper>
    </div>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
