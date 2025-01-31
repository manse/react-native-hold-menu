import React, { useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import Separator from './Separator';
import styles from './styles';

import { MenuItemProps } from './types';
import { useInternal } from '../../hooks';
import { CONTEXT_MENU_STATE } from '../../constants';
import { BORDER_LIGHT_COLOR, BORDER_DARK_COLOR } from './constants';
import isEqual from 'lodash.isequal';
import { getColor } from './calculations';
import { AnimatedIcon } from '../provider/Provider';

// @ts-ignore
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type MenuItemComponentProps = {
  item: MenuItemProps;
  isLast?: boolean;
};

const MenuItemComponent = ({ item, isLast }: MenuItemComponentProps) => {
  const { state, theme, menuProps } = useInternal();

  const separatorStyles = useAnimatedStyle(() => {
    const backgroundColor =
      theme.value === 'dark' ? BORDER_DARK_COLOR : BORDER_LIGHT_COLOR;
    return {
      width: '100%',
      backgroundColor,
      height: isLast ? 0 : 1,
    };
  }, [theme, isLast, item]);

  const textColor = useAnimatedStyle(() => {
    return { color: getColor(item.isTitle, item.isDestructive, theme.value) };
  }, [theme, item]);
  const tintColor = useAnimatedStyle(() => {
    return {
      tintColor: getColor(item.isTitle, item.isDestructive, theme.value),
    };
  }, [theme, item]);

  const handleOnPress = useCallback(() => {
    if (!item.isTitle) {
      const params = menuProps.value.actionParams[item.text] || [];
      if (item.onPress) item.onPress(...params);
      state.value = CONTEXT_MENU_STATE.END;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, item]);

  return (
    <>
      <AnimatedTouchable
        onPress={handleOnPress}
        activeOpacity={!item.isTitle ? 0.4 : 1}
        style={styles.menuItem}
      >
        {'checked' in item ? (
          <View style={styles.menuItemCheckContainer}>
            {item.checked ? (
              <Animated.Image
                style={[styles.menuItemCheckIcon, tintColor]}
                source={require('../icon/check.png')}
              />
            ) : null}
          </View>
        ) : null}
        <Animated.Text
          style={[
            item.isTitle ? styles.menuItemTitleText : styles.menuItemText,
            textColor,
          ]}
        >
          {item.text}
        </Animated.Text>
        {!item.isTitle &&
          item.icon &&
          (AnimatedIcon && typeof item.icon === 'string' ? (
            <AnimatedIcon name={item.icon} size={18} style={textColor} />
          ) : typeof item.icon === 'function' ? (
            item.icon()
          ) : null)}
      </AnimatedTouchable>
      <Animated.View style={separatorStyles} />
      {item.withSeparator && <Separator />}
    </>
  );
};

const MenuItem = React.memo(MenuItemComponent, isEqual);
export default MenuItem;
