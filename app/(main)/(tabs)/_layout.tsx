import { Link, Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { getHeaderTitle } from '@react-navigation/elements';

import { HeaderButton } from '~/components/header-button';
import { TabBarIcon } from '~/components/tab-bar-icon';

/**
 * Componente de cabeçalho personalizado que renderiza o nome do app e o título da tela.
 */
const CustomHeader = ({ route, options }) => {
  const title = getHeaderTitle(options, route.name);

  return (
    <View style={styles.headerContainer}>
      {/* Título centralizado */}
      <View style={styles.centerTitleContainer}>
        <Text style={styles.headerSubtitle}>Gymgante</Text>
      </View>

      {/* Título da aba alinhado à esquerda */}
      <View style={styles.leftTitleContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
        header: (props) => <CustomHeader {...props} />,
      }}>
      <Tabs.Screen
        name="(home)/index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <HeaderButton />
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)/index"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(settings)/index"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 160,
    backgroundColor: '#ffffff',
    borderBottomWidth: 3,
    borderBottomColor: '#e0e0e0',
    position: 'relative',
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  centerTitleContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 45,
    color: 'black',
    fontWeight: '400',
  },
  leftTitleContainer: {
    paddingLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    color: '#555',
  },
  headerRightContainer: {
    position: 'absolute',
    top: 40,
    right: 16,
  },
});
