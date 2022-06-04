/**
 * @file
 * This component serves to display the privacy policy
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import styled from '@emotion/native';
import { WebView } from 'react-native-webview';

import { Box } from '@appComponents/ScreenLayout';
import { ActivityIndicator } from 'react-native-paper';

const Terms = () => (
  <Box flex={1} ph={2} pv={2}>
    <WebView
      startInLoadingState
      source={{ uri: 'https://flightworks-dev.web.app/Terms?mobile=true' }}
      style={webViewStyle}
      containerStyle={containerStyles}
      renderLoading={() => <LoadingIndicator size="large" />}
      onError={({ nativeEvent }) => console.error(nativeEvent)}
    />
  </Box>
);

const LoadingIndicator = styled(ActivityIndicator)(({ theme }) => ({
  ...StyleSheet.absoluteFillObject,
  alignItems: 'center',
  justifyContent: 'center',
}));

const webViewStyle = {
  backgroundColor: 'transparent',
  alignItems: 'flex-start',
};

const containerStyles = {
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: '95%',
  borderWidth: 1,
  borderColor: '#3b4253',
  borderRadius: 6,
};

export default Terms;
