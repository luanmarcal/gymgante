import { Theme } from '@react-navigation/native';

export const LIGHT_THEME: Theme = {
  dark: false,
  colors: {
    background: 'hsl(0 0% 100%)',
    border: 'hsl(240 5.9% 90%)',
    card: 'hsl(0 0% 100%)', 
    notification: 'hsl(0 84.2% 60.2%)',
    primary: 'hsl(240 5.9% 10%)',
    text: 'hsl(240 10% 3.9%)', 
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
