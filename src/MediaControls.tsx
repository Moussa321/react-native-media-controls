import React, { useState, useEffect } from "react";
import {
  View,
  TouchableWithoutFeedback,
  GestureResponderEvent,
  ViewStyle,
  ViewProps, // ✅ Import ViewProps
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  AnimatedProps
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
  hideSeekbar?: boolean;
};

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

  const { initialOpacity, initialIsVisible } = (() => {
    if (showOnStart) {
      return {
        initialOpacity: 1,
        initialIsVisible: true,
      };
    }

    return {
      initialOpacity: 0,
      initialIsVisible: false,
    };
  })();

  const opacity = useSharedValue(initialOpacity);
  const [isVisible, setIsVisible] = useState(initialIsVisible);

  useEffect(() => {
    fadeOutControls(fadeOutDelay);
  }, []);

  useEffect(() => {
    if (showOnLoad) {
      if (isLoading && !isVisible) toggleControls();
      if (!isLoading && isVisible) toggleControls();
    }
  }, [isLoading, showOnLoad, isVisible]);

  const fadeOutControls = (delay = 0) => {
    opacity.value = withDelay(
      delay,
      withTiming(
        0,
        {
          duration: 300,
        },
        (isFinished: boolean) => {
          if (isFinished) {
            runOnJS(setIsVisible)(false);
          }
        }
      )
    );
  };

  const fadeInControls = (loop = true) => {
    runOnJS(setIsVisible)(true);
    opacity.value = withTiming(
      1,
      {
        duration: 300,
      },
      () => {
        if (loop) {
          fadeOutControls(fadeOutDelay);
        }
      }
    );
  };

  const onReplay = () => {
    fadeOutControls(fadeOutDelay);
    onReplayCallback();
  };

  const cancelAnimation = () => {
    opacity.value = withTiming(1, { duration: 0 });
    setIsVisible(true);
  };

  const onPause = () => {
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
  };

  const toggleControls = () => {
    const currentOpacity = opacity.value;
    if (currentOpacity > 0.5) {
      fadeOutControls();
    } else {
      fadeInControls();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <TouchableWithoutFeedback accessible={false} onPress={toggleControls}>
     {/* @ts-ignore: Suppressing TS2322 error */}
      <Animated.View style={[styles.container, containerStyle, animatedStyle] as AnimatedProps<ViewProps>["style"]}>
        {isVisible && (
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
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

MediaControls.Toolbar = Toolbar;

export default MediaControls;
