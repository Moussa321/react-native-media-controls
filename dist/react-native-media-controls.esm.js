import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, TouchableOpacity, Image, View, Text, Platform, TouchableWithoutFeedback } from 'react-native';
import Animated, { useSharedValue, withDelay, withTiming, runOnJS, useAnimatedStyle } from 'react-native-reanimated';
import RNSlider from '@react-native-community/slider';

function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}

var containerBackgroundColor = "rgba(45, 59, 62, 0.4)";
var playButtonBorderColor = "rgba(255,255,255,0.5)";
var white = "#fff";
var styles = /*#__PURE__*/StyleSheet.create({
  container: {
    alignItems: "center",
    bottom: 0,
    flexDirection: "column",
    justifyContent: "space-between",
    left: 0,
    paddingHorizontal: 20,
    paddingVertical: 13,
    position: "absolute",
    right: 0,
    top: 0
  },
  controlsRow: {
    alignItems: "center",
    alignSelf: "stretch",
    flex: 1,
    justifyContent: "center"
  },
  fullScreenContainer: {
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "center",
    paddingLeft: 20
  },
  playButton: {
    alignItems: "center",
    borderColor: playButtonBorderColor,
    borderRadius: 3,
    borderWidth: 1.5,
    height: 50,
    justifyContent: "center",
    width: 50
  },
  playIcon: {
    height: 22,
    resizeMode: "contain",
    width: 22
  },
  progressColumnContainer: {
    flex: 1
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: -25
  },
  progressSlider: {
    alignSelf: "stretch"
  },
  replayIcon: {
    height: 20,
    resizeMode: "stretch",
    width: 25
  },
  thumb: {
    backgroundColor: white,
    borderRadius: 50,
    borderWidth: 3,
    height: 20,
    width: 20
  },
  timeRow: {
    alignSelf: "stretch"
  },
  timerLabel: {
    color: white,
    fontSize: 12
  },
  timerLabelsContainer: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: -7
  },
  toolbar: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "flex-end"
  },
  toolbarRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  track: {
    borderRadius: 1,
    height: 5
  },
  // **Added Styles**
  controlsOverlay: /*#__PURE__*/_extends({}, StyleSheet.absoluteFillObject, {
    justifyContent: "space-between",
    backgroundColor: containerBackgroundColor,
    padding: 10
  }),
  touchableArea: /*#__PURE__*/_extends({}, StyleSheet.absoluteFillObject)
});

var PLAYER_STATES;
(function (PLAYER_STATES) {
  PLAYER_STATES[PLAYER_STATES["PLAYING"] = 0] = "PLAYING";
  PLAYER_STATES[PLAYER_STATES["PAUSED"] = 1] = "PAUSED";
  PLAYER_STATES[PLAYER_STATES["ENDED"] = 2] = "ENDED";
})(PLAYER_STATES || (PLAYER_STATES = {}));

var humanizeVideoDuration = function humanizeVideoDuration(seconds) {
  var _ref = seconds >= 3600 ? [11, 8] : [14, 5],
    begin = _ref[0],
    end = _ref[1];
  var date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substr(begin, end);
};
var getPlayerStateIcon = function getPlayerStateIcon(playerState) {
  switch (playerState) {
    case PLAYER_STATES.PAUSED:
      return require("./assets/ic_play.png");
    case PLAYER_STATES.PLAYING:
      return require("./assets/ic_pause.png");
    case PLAYER_STATES.ENDED:
      return require("./assets/ic_replay.png");
    default:
      return null;
  }
};

var Controls = function Controls(props) {
  var isLoading = props.isLoading,
    mainColor = props.mainColor,
    playerState = props.playerState,
    onReplay = props.onReplay,
    onPause = props.onPause;
  var icon = getPlayerStateIcon(playerState);
  var pressAction = playerState === PLAYER_STATES.ENDED ? onReplay : onPause;
  var content = isLoading ? React.createElement(ActivityIndicator, {
    size: "large",
    color: "#FFF"
  }) : React.createElement(TouchableOpacity, {
    style: [styles.playButton, {
      backgroundColor: mainColor
    }],
    onPress: pressAction,
    accessibilityLabel: PLAYER_STATES.PAUSED ? "Tap to Play" : "Tap to Pause",
    accessibilityHint: "Plays and Pauses the Video"
  }, React.createElement(Image, {
    source: icon,
    style: styles.playIcon
  }));
  return React.createElement(View, {
    style: [styles.controlsRow]
  }, content);
};

var fullScreenImage = /*#__PURE__*/require("./assets/ic_fullscreen.png");
var thumb = /*#__PURE__*/require("./assets/ic_thumb.png");
var Slider = function Slider(props) {
  var customSliderStyle = props.customSliderStyle,
    duration = props.duration,
    mainColor = props.mainColor,
    onFullScreen = props.onFullScreen,
    onPause = props.onPause,
    progress = props.progress,
    hideSeekbar = props.hideSeekbar;
  var containerStyle = (customSliderStyle == null ? void 0 : customSliderStyle.containerStyle) || {};
  var seekVideo = function seekVideo(value) {
    props.onSeek(value);
    onPause();
  };
  return React.createElement(View, {
    style: [styles.controlsRow, styles.progressContainer, containerStyle]
  }, React.createElement(View, {
    style: styles.progressColumnContainer
  }, !hideSeekbar && React.createElement(View, {
    style: [styles.timerLabelsContainer]
  }, React.createElement(Text, {
    style: styles.timerLabel
  }, humanizeVideoDuration(progress)), React.createElement(Text, {
    style: styles.timerLabel
  }, humanizeVideoDuration(duration))), !hideSeekbar && React.createElement(RNSlider, {
    style: [styles.progressSlider, {
      marginTop: Platform.OS == "ios" ? 4 : 12,
      marginBottom: Platform.OS == "ios" ? 0 : 6
    }],
    onSlidingComplete: seekVideo,
    maximumValue: Math.floor(duration),
    thumbImage: thumb,
    value: Math.floor(progress),
    minimumTrackTintColor: mainColor,
    maximumTrackTintColor: "#AEB3B7"
  })), Boolean(onFullScreen) && React.createElement(TouchableOpacity, {
    style: styles.fullScreenContainer,
    onPress: onFullScreen
  }, React.createElement(Image, {
    source: fullScreenImage
  })));
};

var Toolbar = function Toolbar(_ref) {
  var children = _ref.children;
  return React.createElement(React.Fragment, null, children);
};

var MediaControls = function MediaControls(props) {
  var children = props.children,
    _props$containerStyle = props.containerStyle,
    containerStyle = _props$containerStyle === void 0 ? {} : _props$containerStyle,
    duration = props.duration,
    _props$fadeOutDelay = props.fadeOutDelay,
    fadeOutDelay = _props$fadeOutDelay === void 0 ? 5000 : _props$fadeOutDelay,
    _props$isLoading = props.isLoading,
    isLoading = _props$isLoading === void 0 ? false : _props$isLoading,
    _props$mainColor = props.mainColor,
    mainColor = _props$mainColor === void 0 ? "rgba(12, 83, 175, 0.9)" : _props$mainColor,
    onFullScreen = props.onFullScreen,
    onReplayCallback = props.onReplay,
    onSeek = props.onSeek,
    onSeeking = props.onSeeking,
    playerState = props.playerState,
    progress = props.progress,
    _props$showOnStart = props.showOnStart,
    showOnStart = _props$showOnStart === void 0 ? true : _props$showOnStart,
    _props$showOnLoad = props.showOnLoad,
    showOnLoad = _props$showOnLoad === void 0 ? false : _props$showOnLoad,
    sliderStyle = props.sliderStyle,
    _props$hideSeekbar = props.hideSeekbar,
    hideSeekbar = _props$hideSeekbar === void 0 ? false : _props$hideSeekbar,
    _props$toolbarStyle = props.toolbarStyle,
    toolbarStyle = _props$toolbarStyle === void 0 ? {} : _props$toolbarStyle;
  // Determine initial opacity based on showOnStart
  var initialOpacity = showOnStart ? 1 : 0;
  var opacity = useSharedValue(initialOpacity);
  var _useState = useState(showOnStart),
    isVisible = _useState[0],
    setIsVisible = _useState[1];
  // Fade out controls after a delay
  var fadeOutControls = useCallback(function (delay) {
    if (delay === void 0) {
      delay = 0;
    }
    opacity.value = withDelay(delay, withTiming(0, {
      duration: 300
    }, function (finished) {
      if (finished) {
        runOnJS(setIsVisible)(false);
      }
    }));
  }, [opacity]);
  // Fade in controls and optionally loop fade out
  var fadeInControls = useCallback(function (loop) {
    if (loop === void 0) {
      loop = true;
    }
    runOnJS(setIsVisible)(true);
    opacity.value = withTiming(1, {
      duration: 300
    }, function () {
      if (loop) {
        runOnJS(fadeOutControls)(fadeOutDelay);
      }
    });
  }, [opacity, fadeOutControls, fadeOutDelay]);
  // Toggle controls visibility
  var toggleControls = useCallback(function () {
    var currentOpacity = opacity.value;
    if (currentOpacity > 0.5) {
      fadeOutControls();
    } else {
      fadeInControls();
    }
  }, [opacity, fadeOutControls, fadeInControls]);
  // Handle showOnLoad prop changes
  useEffect(function () {
    if (showOnLoad) {
      if (isLoading) fadeInControls();else fadeOutControls();
    }
  }, [isLoading, showOnLoad]);
  // Replay button handler
  var onReplay = useCallback(function () {
    fadeOutControls(fadeOutDelay);
    onReplayCallback();
  }, [fadeOutControls, fadeOutDelay, onReplayCallback]);
  // Cancel any ongoing animations and make controls fully visible
  var cancelAnimation = useCallback(function () {
    opacity.value = withTiming(1, {
      duration: 0
    });
    runOnJS(setIsVisible)(true);
  }, [opacity]);
  // Pause/play button handler
  var onPause = useCallback(function () {
    var PLAYING = PLAYER_STATES.PLAYING,
      PAUSED = PLAYER_STATES.PAUSED;
    switch (playerState) {
      case PLAYING:
        {
          cancelAnimation();
          break;
        }
      case PAUSED:
        {
          fadeOutControls(fadeOutDelay);
          break;
        }
    }
    var newPlayerState = playerState === PLAYING ? PAUSED : PLAYING;
    props.onPaused(newPlayerState);
  }, [playerState, props, cancelAnimation, fadeOutControls, fadeOutDelay]);
  // Animated style for controls opacity
  var animatedStyle = useAnimatedStyle(function () {
    return {
      opacity: opacity.value
    };
  });
  return React.createElement(View, {
    style: [styles.container, containerStyle, {
      flex: 1
    }]
  }, React.createElement(TouchableWithoutFeedback, {
    onPress: toggleControls
  }, React.createElement(View, {
    style: styles.touchableArea
  })), isVisible && React.createElement(TouchableWithoutFeedback, {
    onPress: toggleControls
  }, React.createElement(Animated.View, {
    style: [animatedStyle, styles.controlsOverlay]
  }, React.createElement(View, {
    style: [styles.controlsRow, styles.toolbarRow, toolbarStyle]
  }, children), React.createElement(Controls, {
    onPause: onPause,
    onReplay: onReplay,
    isLoading: isLoading,
    mainColor: mainColor,
    playerState: playerState
  }), React.createElement(Slider, {
    progress: progress,
    duration: duration,
    mainColor: mainColor,
    onFullScreen: onFullScreen,
    playerState: playerState,
    onSeek: onSeek,
    onSeeking: onSeeking,
    onPause: onPause,
    customSliderStyle: sliderStyle,
    hideSeekbar: hideSeekbar
  }))));
};
// Attach Toolbar to MediaControls
MediaControls.Toolbar = Toolbar;

export default MediaControls;
export { PLAYER_STATES };
//# sourceMappingURL=react-native-media-controls.esm.js.map
