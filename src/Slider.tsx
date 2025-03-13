import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  ViewStyle,
  Platform,
} from "react-native";
import styles from "./MediaControls.style";
import { humanizeVideoDuration } from "./utils";
import { Props as MediaControlsProps } from "./MediaControls";
import RNSlider from "@react-native-community/slider";

export type CustomSliderStyle = {
  containerStyle: ViewStyle;
  trackStyle: ViewStyle;
  thumbStyle: ViewStyle;
};

type Props = Pick<
  MediaControlsProps,
  | "progress"
  | "duration"
  | "mainColor"
  | "onFullScreen"
  | "playerState"
  | "onSeek"
  | "onSeeking"
> & {
  onPause: () => void;
  customSliderStyle?: CustomSliderStyle;
  hideSeekbar?: boolean;
};

const fullScreenImage = require("./assets/ic_fullscreen.png");
const thumb = require("./assets/ic_thumb.png");

const Slider = (props: Props) => {
  const {
    customSliderStyle,
    duration,
    mainColor,
    onFullScreen,
    onPause,
    progress,
    hideSeekbar,
  } = props;

  const containerStyle = customSliderStyle?.containerStyle || {};


  const seekVideo = (value: number) => {
    props.onSeek(value);
    onPause();
  };

  return (
    <View
      style={[styles.controlsRow, styles.progressContainer, containerStyle]}
    >
      <View style={styles.progressColumnContainer}>
        {!hideSeekbar && (
          <View style={[styles.timerLabelsContainer]}>
            <Text style={styles.timerLabel}>
              {humanizeVideoDuration(progress)}
            </Text>
            <Text style={styles.timerLabel}>
              {humanizeVideoDuration(duration)}
            </Text>
          </View>
        )}
        {!hideSeekbar && (
          <RNSlider
            style={[
              styles.progressSlider,
              { marginTop: Platform.OS == "ios" ? 4 : 12, marginBottom: Platform.OS == "ios" ? 0 : 6 },
            ]}
            onSlidingComplete={seekVideo}
            maximumValue={Math.floor(duration)}
            thumbImage={thumb}
            value={Math.floor(progress)}
            minimumTrackTintColor={mainColor}
            maximumTrackTintColor={"#AEB3B7"}
          />
        )}
      </View>
      {Boolean(onFullScreen) && (
        <TouchableOpacity
          style={styles.fullScreenContainer}
          onPress={onFullScreen}
        >
          <Image source={fullScreenImage} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export { Slider };
