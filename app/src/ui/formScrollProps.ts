import { ScrollViewProps } from 'react-native';

export const formScrollProps: Pick<ScrollViewProps, 'keyboardShouldPersistTaps'> = {
  keyboardShouldPersistTaps: 'handled',
};
