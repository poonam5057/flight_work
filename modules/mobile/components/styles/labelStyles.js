import { useTheme } from '../../../components/theme';

export const getNativeButtonLabelStyle = () => {
  const theme = useTheme();
  return {
    fontSize: theme.fonts.size.medium,
    marginVertical: 15,
  };
};
