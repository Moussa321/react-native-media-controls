import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  GestureResponderEvent,
  ViewStyle,
  TouchableWithoutFeedback,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import styles from "./MediaControls.style";
import { PLAYER_STATES } from "./constants/playerStates";
import { Controls } from "./Controls";
import { Slider, CustomSliderStyle } from "./Slider";
import { Toolbar } from "./Toolbar";

// Define Props as per your original definition
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

// Extend React.FC<Props> to include Toolbar
interface MediaControlsComponent extends React.FC<Props> {
  Toolbar: typeof Toolbar;
}

const MediaControls: MediaControlsComponent = props => {
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

  // Determine initial opacity based on showOnStart
  const initialOpacity = showOnStart ? 1 : 0;
  const opacity = useSharedValue(initialOpacity);
  const [isVisible, setIsVisible] = useState(showOnStart);

  // Fade out controls after a delay
  const fadeOutControls = useCallback(
    (delay = 0) => {
      opacity.value = withDelay(
        delay,
        withTiming(
          0,
          {
            duration: 300,
          },
          (finished: boolean) => {
            if (finished) {
              runOnJS(setIsVisible)(false);
            }
          },
        ),
      );
    },
    [opacity],
  );

  // Fade in controls and optionally loop fade out
  const fadeInControls = useCallback(
    (loop = true) => {
      runOnJS(setIsVisible)(true);
      opacity.value = withTiming(
        1,
        {
          duration: 300,
        },
        () => {
          if (loop) {
            runOnJS(fadeOutControls)(fadeOutDelay);
          }
        },
      );
    },
    [opacity, fadeOutControls, fadeOutDelay],
  );

  // Toggle controls visibility
  const toggleControls = useCallback(() => {
    const currentOpacity = opacity.value;
    if (currentOpacity > 0.5) {
      fadeOutControls();
    } else {
      fadeInControls();
    }
  }, [opacity, fadeOutControls, fadeInControls]);

  // Handle showOnLoad prop changes
  useEffect(() => {
    if (showOnLoad) {
      if (isLoading) fadeInControls();
      else fadeOutControls();
    }
  }, [isLoading, showOnLoad]);

  // Replay button handler
  const onReplay = useCallback(() => {
    fadeOutControls(fadeOutDelay);
    onReplayCallback();
  }, [fadeOutControls, fadeOutDelay, onReplayCallback]);

  // Cancel any ongoing animations and make controls fully visible
  const cancelAnimation = useCallback(() => {
    opacity.value = withTiming(1, { duration: 0 });
    runOnJS(setIsVisible)(true);
  }, [opacity]);

  // Pause/play button handler
  const onPause = useCallback(() => {
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
    props.onPaused(newPlayerState);
  }, [playerState, props, cancelAnimation, fadeOutControls, fadeOutDelay]);

  // Animated style for controls opacity
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, containerStyle, { flex: 1 }]}>
      {/* Touchable layer always active */}
      <TouchableWithoutFeedback onPress={toggleControls}>
        <View style={styles.touchableArea} />
      </TouchableWithoutFeedback>

      {/* Controls overlay */}
      {isVisible && (
        <TouchableWithoutFeedback onPress={toggleControls}>
          {/* @ts-ignore: Suppressing TS2322 error */}
          <Animated.View style={[animatedStyle, styles.controlsOverlay]}>
            <View style={[styles.controlsRow, styles.toolbarRow, toolbarStyle]}>
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
          </Animated.View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

// Attach Toolbar to MediaControls
MediaControls.Toolbar = Toolbar;

export default MediaControls;
