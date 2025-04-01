import { router } from 'expo-router';
import { Button, Card } from 'react-native-paper';

import { Container } from '~/components/Container';
import { ScreenCenter } from '~/components/ScreenCenter';

export default function Modal() {
  const closeModal = () => {
    router.back();
  };

  return (
    <Container>
      <ScreenCenter>
        <Card>
          <Card.Title title="Card Title" subtitle="Card Subtitle" />
          <Card.Actions>
            <Button
              onPress={() => {
                closeModal();
              }}>
              Close
            </Button>
            <Button onPress={() => {}}>Ok</Button>
          </Card.Actions>
        </Card>
      </ScreenCenter>
    </Container>
  );
}
