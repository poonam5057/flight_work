import React, { Node } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import styled from '@emotion/native';

const MobileView = ({ children, extraHeight = 250 }: MobileViewProps): Node => {
  return <NativeView extraHeight={extraHeight}>{children}</NativeView>;
};

type MobileViewProps = {
  children: Node,
  extraHeight?: number,
};

const NativeView = styled(KeyboardAwareScrollView)(({ theme }) => ({
  backgroundColor: theme.colors.background,
}));

export default MobileView;
