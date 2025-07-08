import { ReactNode } from 'react';
import { ActivityIndicator } from 'react-native-paper';

import { Container } from './container';
import { ScreenCenter } from './screen-center';

export const LoadingIndicator = (props: { children?: ReactNode }) => {
  return (
    <Container>
      <ScreenCenter>
        <ActivityIndicator size="large" />
        {props.children}
      </ScreenCenter>
    </Container>
  );
};
