import React, { useEffect, useCallback } from "react";
import {
  View,
  GestureResponderEvent,
  ViewStyle,
  ViewProps,
  TouchableWithoutFeedback,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  AnimatedProps,
} from "react-native-reanimated";
import styles from "./MediaControls.style";
import { PLAYER_STATES } from "./constants/playerStates";
import { Controls } from "./Controls";
import { Slider, CustomSliderStyle } from "./Slider";
import { Toolbar } from "./Toolbar";

export type Props = {
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  duration: number;
  fadeOutDelay?: number;
  isFullScreen: boolean;
  isLoading: boolean;
  mainColor: string;
  onFullScreen?: (event: GestureResponderEvent) => void;
  onPaused: (playerState: PLAYER_STATES) => void;
  onReplay: () => void;
  onSeek: (value: number) => void;
  onSeeking: (value: number) => void;
  playerState: PLAYER_STATES;
  progress: number;
  showOnStart?: boolean;
  showOnLoad?: boolean;
  sliderStyle?: CustomSliderStyle;
  toolbarStyle?: ViewStyle;
  hideSeekbar?: boolean;};

const MediaControls = (props: Props) => {
  const {
    children,
    containerStyle = {},
    duration,
    fadeOutDelay = 5000,
    isLoading = false,
    mainColor = "rgba(12, 83, 175, 0.9)",
    onFullScreen,
    onReplay: onReplayCallback,
    onSeek,
    onSeeking,
    playerState,
    progress,
    showOnStart = true,
    showOnLoad = false,
    sliderStyle,
    hideSeekbar = false,
    toolbarStyle = {},
  } = props;

  const { initialOpacity } = (() => {
    if (showOnStart) {
      return {
        initialOpacity: 1,
      };
    }

    return {
      initialOpacity: 0,
    };
  })();

  const opacity = useSharedValue(initialOpacity);

  // Define fadeOutControls with useCallback
  const fadeOutControls = useCallback((delay = 0) => {
    opacity.value = withDelay(
      delay,
      withTiming(
        0,
        {
          duration: 300,
        }
      )
    );
  }, [opacity]);

  // Define fadeInControls with useCallback
  const fadeInControls = useCallback((loop = true) => {
    opacity.value = withTiming(
      1,
      {
        duration: 300,
      },
      () => {
        if (loop) {
          runOnJS(fadeOutControls)(fadeOutDelay); // Use runOnJS here
        }
      }
    );
  }, [opacity, fadeOutControls, fadeOutDelay]);

  useEffect(() => {
    fadeOutControls(fadeOutDelay);
  }, [fadeOutControls, fadeOutDelay]);

  useEffect(() => {
    if (showOnLoad) {
      console.log('badddddd',isLoading, showOnLoad)
      if (isLoading) toggleControls();
      if (!isLoading) toggleControls();
    }
  }, [isLoading, showOnLoad]);

  const onReplay = () => {
    fadeOutControls(fadeOutDelay);
    onReplayCallback();
  };

  const cancelAnimation = () => {
    opacity.value = withTiming(1, { duration: 0 });
  };

  const onPause = useCallback(() => {
    const { playerState, onPaused } = props;
    const { PLAYING, PAUSED, ENDED } = PLAYER_STATES;
    switch (playerState) {
      case PLAYING: {
        cancelAnimation();
        break;
      }
      case PAUSED: {
        fadeOutControls(fadeOutDelay);
        break;
      }
      case ENDED:
        break;
    }

    const newPlayerState = playerState === PLAYING ? PAUSED : PLAYING;
    return onPaused(newPlayerState);
  }, [props, fadeOutControls, fadeOutDelay]);

  const toggleControls = useCallback(() => {
    console.log('pressed')
    const currentOpacity = opacity.value;
    if (currentOpacity === 1) {
      fadeOutControls();
    } else {
      fadeInControls();
    }
  }, [opacity, fadeOutControls, fadeInControls]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <TouchableWithoutFeedback onPress={toggleControls}>
      {/* @ts-ignore: Suppressing TS2322 error */}
      <Animated.View style={[styles.container,containerStyle,animatedStyle] as AnimatedProps<ViewProps>["style"]}>
          <View style={[styles.container, containerStyle]}>
            <View
              style={[
                styles.controlsRow,
                styles.toolbarRow,
                toolbarStyle,
              ]}
            >
              {children}
            </View>
            <Controls
              onPause={onPause}
              onReplay={onReplay}
              isLoading={isLoading}
              mainColor={mainColor}
              playerState={playerState}
            />
            <Slider
              progress={progress}
              duration={duration}
              mainColor={mainColor}
              onFullScreen={onFullScreen}
              playerState={playerState}
              onSeek={onSeek}
              onSeeking={onSeeking}
              onPause={onPause}
              customSliderStyle={sliderStyle}
              hideSeekbar={hideSeekbar}
            />
          </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

MediaControls.Toolbar = Toolbar;

export default MediaControls;