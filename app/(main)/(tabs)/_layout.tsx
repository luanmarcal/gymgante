// import { Stack, Tabs } from 'expo-router';

// export default function TabsLayout() {
//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="(home)" options={{ headerShown: false }} />
//       <Stack.Screen name="(settings)" options={{ headerShown: false }} />
//     </Stack>
//   );
// }

import { Link, Tabs } from 'expo-router';

import { HeaderButton } from '~/components/header-button';
import { TabBarIcon } from '~/components/tab-bar-icon';

// import { HeaderButton } from '../../components/header-button';
// import { TabBarIcon } from '../../components/tab-bar-icon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
      }}>
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Tab Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <HeaderButton />
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          title: 'Tab Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
    </Tabs>
  );
}
