import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Returns the current on-screen keyboard height (0 when hidden). Works reliably
 * under Android edge-to-edge (where `softwareKeyboardLayoutMode`/adjustResize is
 * ignored) by listening to the Keyboard events directly, so screens can lift
 * their inputs above the keyboard manually.
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvt, (e) => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvt, () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
