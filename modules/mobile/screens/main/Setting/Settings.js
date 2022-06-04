/**
 * @file
 * App/User settings
 *
 * @format
 * @flow strict-local
 */

 import React from 'react';
 import { TouchableRipple } from 'react-native-paper';
 import styled from '@emotion/native';
 import { useNavigation } from '@react-navigation/native';
 import { Box } from '@appComponents/ScreenLayout';
 import { logOut } from '@appUtils/auth';
 import { Icon, useTheme } from '@appComponents/theme';
 import Text from '@appComponents/Text';
 import Button from '@appComponents/Button';
 import { versionFormat } from '@appUtils/app';
 import pkg from '../../../../../package.json'
 
 const Settings = ({ navigation }): Node => (
   <Box flex={1} jc="space-between">
     <Box ph={2} pv={4}>
       <LinkItem disabled name="My Account Settings" />
       <LinkItem name="Change Password" />
 
       <Box mt={4}>
         <Button style={buttonStyles} onPress={logOut}>
           Logout
         </Button>
       </Box>
     </Box>
     <Box mt="auto">
       <Button
         mode="text"
         onPress={() => navigation.navigate('Terms And Conditions')}>
         Terms And Conditions
       </Button>
       <VersionText>v {versionFormat(pkg.version)}</VersionText>
     </Box>
   </Box>
 );
 
 const LinkItem = ({ name, disabled }) => {
   const theme = useTheme();
   const nav = useNavigation();
 
   const iconColor = disabled ? theme.colors.dark : theme.colors.primary;
 
   return (
     <>
       <ItemLayout onPress={() => nav.navigate(name)} disabled={disabled}>
         <>
           <Text color="heading" ls={0.25} lh={22}>
             {name}
           </Text>
           <Icon name="forward-arrow" color={iconColor} size={18} />
         </>
       </ItemLayout>
       <DoubleDivider opacity={disabled ? 0.4 : 1} />
     </>
   );
 };
 
 const DoubleDivider = ({ opacity }) => (
   <>
     <ItemDivider color="#5e5d60" opacity={opacity} />
     <ItemDivider color="transparent" opacity={opacity} />
     <ItemDivider color="#454454" opacity={opacity} />
   </>
 );
 
 const ItemDivider = styled.View(({ theme, color = 'border', opacity = 1 }) => ({
   borderColor: theme.colors[color] ?? color,
   borderBottomWidth: 1,
   width: '100%',
   opacity,
 }));
 
 const ItemLayout: typeof TouchableRipple = styled(TouchableRipple)(
   ({ theme, disabled }) => ({
     width: '100%',
     paddingVertical: theme.layout.space(2),
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     opacity: disabled ? 0.4 : 1,
   }),
 );
 
 const buttonStyles = {
   paddingVertical: 8,
 };
 
 const VersionText = styled.Text(({ theme }) => ({
   marginLeft: 'auto',
   marginRight: 'auto',
   marginBottom: theme.layout.space(2),
   color: theme.colors.heading,
 }));
 
 export default Settings;
 