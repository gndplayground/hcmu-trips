import {
  Flex,
  Box,
  Stack,
  Button,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";

import { FormInput } from "@components";
import { useAuthLogin } from "@hooks";
import { useLocation, useNavigate } from "react-router-dom";

export function Login() {
  const authLogin = useAuthLogin();
  console.log(import.meta.env);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({});

  const location = useLocation();

  const navigate = useNavigate();

  async function onSubmit(values: Record<string, any>) {
    try {
      await authLogin.mutateAsync({
        email: values.email,
        password: values.password,
      });

      navigate(
        !!location?.state?.prev && !location.state.prev.includes("/login")
          ? location.state.prev
          : "/"
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  return (
    <div>
      <Flex
        minH={"100vh"}
        align={"center"}
        justify={"center"}
        bg={useColorModeValue("gray.50", "gray.800")}
      >
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
          <Stack align={"center"}>
            <Heading fontSize={"4xl"}>Sign in to your account</Heading>
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >
            <Stack as="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
              <FormInput
                disabled={isSubmitting}
                id="email"
                inputProps={{
                  ...register("email"),
                }}
                errors={errors}
                label="Email address"
              />
              <FormInput
                disabled={isSubmitting}
                id="password"
                inputProps={{
                  type: "password",
                  ...register("password"),
                }}
                errors={errors}
                label="Password"
              />
              <Stack spacing={10}>
                <Button
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  type="submit"
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                >
                  Sign in
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Flex>
    </div>
  );
}
