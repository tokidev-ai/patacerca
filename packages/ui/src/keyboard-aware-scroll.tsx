import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  TextInput,
  type ScrollViewProps,
} from 'react-native';

type TextInputRef = React.ComponentRef<typeof TextInput>;
type ScrollViewRef = React.ComponentRef<typeof ScrollView>;

type KeyboardAwareScrollContextValue = {
  scrollInputIntoView: (inputRef: RefObject<TextInputRef | null>) => void;
};

const KeyboardAwareScrollContext = createContext<KeyboardAwareScrollContextValue | null>(
  null
);

export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}

/** Llama en onFocus del TextInput (Input, PhoneInput, listas buscables, etc.). */
export function useKeyboardAwareScrollOnFocus(inputRef: RefObject<TextInputRef | null>) {
  const ctx = useContext(KeyboardAwareScrollContext);

  return useCallback(() => {
    ctx?.scrollInputIntoView(inputRef);
  }, [ctx, inputRef]);
}

export type KeyboardAwareScrollViewProps = ScrollViewProps & {
  /** Espacio extra bajo el contenido (footer fijo, botón, etc.). */
  extraBottomInset?: number;
};

/**
 * ScrollView que registra contexto para elevar el campo enfocado sobre el teclado.
 * Usar en FormScreenLayout, modales y cualquier formulario con inputs.
 */
export const KeyboardAwareScrollView: React.FC<KeyboardAwareScrollViewProps> = ({
  extraBottomInset = 24,
  contentContainerStyle,
  onScroll,
  children,
  ...rest
}) => {
  const scrollRef = useRef<ScrollViewRef>(null);
  const scrollYRef = useRef(0);
  const keyboardHeight = useKeyboardHeight();

  const scrollInputIntoView = useCallback(
    (inputRef: RefObject<TextInputRef | null>) => {
      const run = () => {
        const scroll = scrollRef.current;
        const input = inputRef.current;
        if (!scroll || !input) return;

        const kb =
          keyboardHeight > 0
            ? keyboardHeight
            : (Keyboard.metrics()?.height ?? (Platform.OS === 'android' ? 280 : 320));

        const windowHeight = Dimensions.get('window').height;
        const visibleBottom = windowHeight - kb - extraBottomInset;

        input.measureInWindow((_x: number, y: number, _w: number, h: number) => {
          const inputBottom = y + h;
          if (inputBottom > visibleBottom) {
            const delta = inputBottom - visibleBottom + 16;
            scroll.scrollTo({
              y: Math.max(0, scrollYRef.current + delta),
              animated: true,
            });
          }
        });
      };

      run();
      setTimeout(run, Platform.OS === 'android' ? 160 : 80);
      setTimeout(run, Platform.OS === 'android' ? 320 : 180);
    },
    [extraBottomInset, keyboardHeight]
  );

  const ctxValue = useMemo(() => ({ scrollInputIntoView }), [scrollInputIntoView]);

  const bottomPadding =
    keyboardHeight > 0 ? keyboardHeight + extraBottomInset : extraBottomInset;

  return (
    <KeyboardAwareScrollContext.Provider value={ctxValue}>
      <ScrollView
        ref={scrollRef}
        {...rest}
        keyboardShouldPersistTaps={rest.keyboardShouldPersistTaps ?? 'handled'}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        onScroll={(event) => {
          scrollYRef.current = event.nativeEvent.contentOffset.y;
          onScroll?.(event);
        }}
        scrollEventThrottle={16}
        contentContainerStyle={[contentContainerStyle, { paddingBottom: bottomPadding }]}
      >
        {children}
      </ScrollView>
    </KeyboardAwareScrollContext.Provider>
  );
};
