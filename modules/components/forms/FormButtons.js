import styled from '@emotion/native';
import Button from '../../components/Button';

export const FormButtonsWrap = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const FormButton = styled(Button)`
  width: 192px;
  max-width: 49%;
`;

export const NativeButton = styled(Button)(({ theme }) => ({
  height: 48,
  width: 156,
  maxWidth: '49%',
  borderColor: theme.colors.primary,
}));
