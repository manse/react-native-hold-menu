import React, { memo } from 'react';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedProps,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

// Components
import { BlurView } from 'expo-blur';

// Utils
import { styles } from './styles';
import {
  CONTEXT_MENU_STATE,
  HOLD_ITEM_TRANSFORM_DURATION,
  IS_IOS,
  WINDOW_HEIGHT,
} from '../../constants';
import { useInternal } from '../../hooks';
import { Platform } from 'react-native';

const AnimatedBlurView = IS_IOS
  ? Animated.createAnimatedComponent(BlurView)
  : Animated.View;

type Context = {
  startPosition: {
    x: number;
    y: number;
  };
};

const BackdropComponent = () => {
  const { state, menuProps } = useInternal();

  const tapGestureEvent = useAnimatedGestureHandler<
    TapGestureHandlerGestureEvent,
    Context
  >(
    {
      onStart: (event, context) => {
        context.startPosition = { x: event.x, y: event.y };
      },
      onCancel: () => {
        state.value = CONTEXT_MENU_STATE.END;
      },
      onEnd: (event, context) => {
        const distance = Math.hypot(
          event.x - context.startPosition.x,
          event.y - context.startPosition.y
        );
        const shouldClose = distance < 10;
        const isStateActive = state.value === CONTEXT_MENU_STATE.ACTIVE;

        if (shouldClose && isStateActive) {
          state.value = CONTEXT_MENU_STATE.END;
        }
      },
    },
    [state]
  );

  const animatedContainerStyle = useAnimatedStyle(() => {
    const topValueAnimation = () =>
      state.value === CONTEXT_MENU_STATE.ACTIVE
        ? 0
        : withDelay(
            HOLD_ITEM_TRANSFORM_DURATION,
            withTiming(WINDOW_HEIGHT, {
              duration: 0,
            })
          );

    const opacityValueAnimation = () =>
      withTiming(state.value === CONTEXT_MENU_STATE.ACTIVE ? 1 : 0, {
        duration: HOLD_ITEM_TRANSFORM_DURATION,
      });

    return {
      top: topValueAnimation(),
      backgroundColor: menuProps.value.disableBackdrop
        ? '#00000000'
        : '#00000030',
      opacity:
        menuProps.value.disableBackdrop && Platform.OS === 'ios'
          ? 0
          : opacityValueAnimation(),
    };
  });

  const animatedContainerProps = useAnimatedProps(() => {
    return {
      intensity: withTiming(
        state.value === CONTEXT_MENU_STATE.ACTIVE ? 100 : 0,
        {
          duration: HOLD_ITEM_TRANSFORM_DURATION,
        }
      ),
    };
  });
  return (
    <TapGestureHandler onHandlerStateChange={tapGestureEvent}>
      <AnimatedBlurView
        tint="default"
        animatedProps={animatedContainerProps}
        style={[styles.container, animatedContainerStyle]}
      />
    </TapGestureHandler>
  );
};

const Backdrop = memo(BackdropComponent);

export default Backdrop;
