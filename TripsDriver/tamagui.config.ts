import {config} from '@tamagui/config/v2';
import {createTamagui} from 'tamagui';

const tamaguiConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    light_Button: {
      background: config.themes.light.blue5,
    },
    light_red_Button: {
      background: config.themes.light.red5,
    },
  },
});

// this makes typescript properly type everything based on the config
type Conf = typeof tamaguiConfig;
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

export default tamaguiConfig;
