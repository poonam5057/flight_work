/**
 * @format
 * @flow strict-local
 */

import React, { Node, useEffect } from 'react';
import styled from '@emotion/native';

const Terms = ({ route, navigation }): Node => {
  useEffect(() => {
    if (route.params?.mobile) {
      navigation.setOptions({ headerShown: false });
    }
  }, [navigation, route.params?.mobile]);

  return (
    <Layout flex={1} ph={2} pv={1} mobile={route.params?.mobile}>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
        fermentum quam nunc, ut maximus odio varius vitae. Maecenas dui purus,
        condimentum a nisi eget, tincidunt dapibus felis. Aliquam fringilla
        sollicitudin dolor ut consequat. Duis vestibulum sodales arcu, ac ornare
        est maximus ac. Proin id commodo sapien, sed mollis neque. In sapien
        urna, euismod vitae tincidunt id, accumsan sed sapien. Nunc id aliquet
        magna, sit amet pulvinar lacus. Aenean vel ante dignissim, maximus eros
        quis, dignissim dolor. Nunc quis facilisis leo. Donec quis leo eget
        purus rhoncus consectetur. Phasellus mattis, nisi consequat mattis
        fringilla, leo eros aliquet tortor, a consequat mauris mauris vel velit.
        Aenean faucibus libero at ex placerat, sed tincidunt mi molestie.
      </p>
      <p>
        Sed ornare orci non urna fringilla imperdiet. Cras gravida felis ac
        neque blandit, eu imperdiet mi viverra. Phasellus consequat feugiat
        libero. Curabitur lacus massa, sodales id dui quis, lacinia rhoncus
        lorem. Vivamus rhoncus vel elit quis hendrerit. Phasellus hendrerit
        sapien sit amet odio pellentesque faucibus. Nullam a fermentum nisi.
      </p>
    </Layout>
  );
};

const Layout = styled.View(({ theme, mobile }) => {
  if (mobile) {
    return {
      flex: 1,
      paddingHorizontal: theme.layout.space(2),
      paddingVertical: theme.layout.space(1),
      color: '#B4B7BD',
      backgroundColor: '#17153A',
      fontFamily: theme.fonts.light.fontFamily,
      lineHeight: 22,
    };
  }

  return {
    flex: 1,
    paddingHorizontal: theme.layout.space(2),
    paddingVertical: theme.layout.space(1),
  };
});

export default Terms;
