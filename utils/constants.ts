import { Theme } from '@react-navigation/native';

export const LIGHT_THEME: Theme = {
  dark: false,
  colors: {
    background: 'hsl(0 0% 100%)', // background
    border: 'hsl(240 5.9% 90%)', // border
    card: 'hsl(0 0% 100%)', // card
    notification: 'hsl(0 84.2% 60.2%)', // destructive
    primary: 'hsl(240 5.9% 10%)', // primary
    text: 'hsl(240 10% 3.9%)', // foreground
  },
  fonts: {
    regular: {
      fontFamily: 'Inter_400Regular',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'Inter_500Medium',
      fontWeight: 'normal',
    },
    bold: {
      fontFamily: 'Inter_700Bold',
      fontWeight: 'normal',
    },
    heavy: {
      fontFamily: 'Inter_900Black',
      fontWeight: 'normal',
    },
  },
};
