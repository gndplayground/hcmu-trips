import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  styles: {
    global: {
      body: {
        fontSize: "1rem",
        color: "text",
        backgroundColor: "#fafafa",
      },
    },
  },
  sizes: {
    container: {
      xl: 1400,
    },
  },
  colors: {
    text: "#575757",
    error: "#b94a48",
    primary: "#497cb2",
    textOnPrimary: "#fff",
    bg: "#fafafa",
    border: "#dddfe3",
    tagBg: "#ECF4FD",
    tagText: "#497CB2",
  },
  textStyles: {
    text: {
      fontWeight: "400",
      fontSize: {
        base: "1rem",
      },
      lineHeight: {
        base: "1.5rem",
      },
    },
  },
});

export { theme };
