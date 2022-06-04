/**
 * Sample React Native content
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Fragment } from 'react';
import type { Node } from 'react';
import styled from '@emotion/native';
import {
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';
import { Divider, Headline, Text } from 'react-native-paper';

import { useTheme, Icon } from './theme';
import Logo from '../../assets/logo/react-native.png';

const Welcome: () => Node = () => {
  const isDarkMode = useTheme().dark;

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#222' : '#f3f3f3',
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View>
          <Section title="Step One">
            Edit <Highlight>App.js</Highlight> to change this screen and then
            come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Section = ({ children, title }): Node => {
  return (
    <SectionContainer>
      <Headline>
        <Icon name="aircraft" /> {title}
      </Headline>
      <Description>{children}</Description>
    </SectionContainer>
  );
};

let HermesBadge;

// if (global.HermesInternal) {
//   HermesBadge = require('react-native/Libraries/NewAppScreen/components/HermesBadge');
// }

const Header = (): Node => {
  const logoStyles = {
    opacity: 0.2,
    overflow: 'visible',
    resizeMode: 'cover',
    marginLeft: -128,
    marginBottom: -192,
  };

  return (
    <ImageBackground
      accessibilityRole="image"
      source={Logo}
      imageStyle={logoStyles}>
      {HermesBadge && <HermesBadge />}
      <HeaderText>
        Welcome to
        {'\n'}
        React Native
      </HeaderText>
    </ImageBackground>
  );
};

const ReloadInstructions: () => Node = Platform.select({
  ios: () => (
    <Text>
      Press <Highlight>Cmd + R</Highlight> in the simulator to reload your app's
      code.
    </Text>
  ),
  default: () => (
    <Text>
      Double tap <Highlight>R</Highlight> on your keyboard to reload your app's
      code.
    </Text>
  ),
});

const DebugInstructions: () => Node = Platform.select({
  ios: () => (
    <Text>
      Press <Highlight>Cmd + D</Highlight> in the simulator or{' '}
      <Highlight>Shake</Highlight> your device to open the React Native debug
      menu.
    </Text>
  ),
  default: () => (
    <Text>
      Press <Highlight>Cmd or Ctrl + M</Highlight> or{' '}
      <Highlight>Shake</Highlight> your device to open the React Native debug
      menu.
    </Text>
  ),
});

const links = [
  {
    id: 1,
    title: 'The Basics',
    link: 'https://reactnative.dev/docs/tutorial',
    description: 'Explains a Hello World for React Native.',
  },
  {
    id: 2,
    title: 'Style',
    link: 'https://reactnative.dev/docs/style',
    description:
      'Covers how to use the prop named style which controls the visuals.',
  },
  {
    id: 3,
    title: 'Layout',
    link: 'https://reactnative.dev/docs/flexbox',
    description: 'React Native uses flexbox for layout, learn how it works.',
  },
  {
    id: 4,
    title: 'Components',
    link: 'https://reactnative.dev/docs/components-and-apis',
    description: 'The full list of components and APIs inside React Native.',
  },
  {
    id: 5,
    title: 'Navigation',
    link: 'https://reactnative.dev/docs/navigation',
    description:
      'How to handle moving between screens inside your application.',
  },
  {
    id: 6,
    title: 'Networking',
    link: 'https://reactnative.dev/docs/network',
    description: 'How to use the Fetch API in React Native.',
  },
  {
    id: 7,
    title: 'Help',
    link: 'https://reactnative.dev/help',
    description:
      'Need more help? There are many other React Native developers who may have the answer.',
  },
  {
    id: 8,
    title: 'Follow us on Twitter',
    link: 'https://twitter.com/reactnative',
    description:
      'Stay in touch with the community, join in on Q&As and more by following React Native on Twitter.',
  },
];

const LearnMoreLinks = (): Node => (
  <SectionContainer>
    {links.map(({ id, title, link, description }) => (
      <Fragment key={id}>
        <Divider />
        <LinkContainer
          accessibilityRole="button"
          onPress={() => openURLInBrowser(link)}>
          <LinkText>{title}</LinkText>
          <Description>{description}</Description>
        </LinkContainer>
      </Fragment>
    ))}
  </SectionContainer>
);

function openURLInBrowser(url: string) {
  if (Platform.OS === 'web') {
    return Linking.openURL(url);
  }

  return fetch('http://localhost:8081/open-url', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

// Pro: no 'px' number only sizes, can specify "horizontal", "vertical" values
const SectionContainer = styled.View(({ theme }) => ({
  marginTop: theme.layout.space(4),
  paddingHorizontal: theme.layout.space(3),
}));

const LinkContainer = styled.TouchableOpacity(({ theme }) => ({
  flexWrap: 'wrap',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: theme.layout.space(1),
}));

// Pro: css like syntax
const Description = styled(Text)`
  flex: 3;
  margin-top: 8px;
  font-size: 18px;
  font-weight: 400;
  color: ${({ theme }) => (theme.dark ? '#fff' : '#000')};
`;

const Highlight = styled(Text)({
  fontWeight: '700',
});

const HeaderText = styled(Text)({
  fontSize: 40,
  fontWeight: '700',
  textAlign: 'center',
});

const LinkText = styled(Text)(({ theme }) => ({
  flex: 2,
  fontSize: 18,
  fontWeight: '400',
  color: theme.colors.primary,
}));

const ImageBackground = styled.ImageBackground({
  paddingBottom: 40,
  paddingTop: 96,
  paddingHorizontal: 32,
});

export default Welcome;
