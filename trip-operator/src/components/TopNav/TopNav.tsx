import React from "react";
import {
  IconButton,
  Avatar,
  Box,
  Flex,
  HStack,
  useColorModeValue,
  Text,
  FlexProps,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuGroup,
} from "@chakra-ui/react";
import { FiChevronDown, FiMenu } from "react-icons/fi";
import { useAuthStore } from "@stores/auth";
import { useAuthSignOut } from "@hooks";

export interface TopNavProps extends FlexProps {
  onOpen: () => void;
}

export const TopNav = ({ onOpen, ...rest }: TopNavProps) => {
  const user = useAuthStore((state) => state.user);

  const signOut = useAuthSignOut();

  function handleSignout() {
    signOut.mutate();
  }

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent={{ base: "space-between", md: "flex-end" }}
      {...rest}
    >
      <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: "flex", md: "none" }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        Trips
      </Text>

      <HStack spacing={{ base: "0", md: "6" }}>
        <Flex alignItems={"center"}>
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: "none" }}
            >
              <HStack>
                <Avatar size={"sm"} name={user?.email} bg="teal.400" />
                <Box display={{ base: "none", md: "flex" }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue("white", "gray.900")}
              borderColor={useColorModeValue("gray.200", "gray.700")}
            >
              <MenuGroup title={user?.email}>
                <MenuItem>My Account</MenuItem>
                <MenuItem onClick={handleSignout}>Sign out</MenuItem>
              </MenuGroup>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};
