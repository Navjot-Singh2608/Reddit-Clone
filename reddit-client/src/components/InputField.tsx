import React, { InputHTMLAttributes } from "react";
import { useField } from "formik";
import {
  FormControl,
  FormErrorMessage,
  FormLabel
} from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Textarea } from "@chakra-ui/textarea";

type inputType = {
  label: string;
  name: string;
  textarea?: boolean;
  size?: any;
  placeholder?: any;
  type?: any;
};

// '' => false
// 'error message stuff' => true

export const InputField: React.FC<inputType> = ({
  label,
  textarea,
  size: _,
  ...props
}) => {
  // let Inputtestarea = Input;
  // let Texttestarea = Textarea;
  // if (textarea) {
  //   Texttestarea = Textarea;
  // } else {
  //   Inputtestarea = Input;
  // }
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      {textarea ? (
        <Textarea {...field} {...props} id={field.name} />
      ) : (
        <Input {...field} {...props} id={field.name} />
      )}
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};
