import React from "react";
import { ViewStyle } from "react-native";
import { Props as MediaControlsProps } from "./MediaControls";
export declare type CustomSliderStyle = {
    containerStyle: ViewStyle;
    trackStyle: ViewStyle;
    thumbStyle: ViewStyle;
};
declare type Props = Pick<MediaControlsProps, "progress" | "duration" | "mainColor" | "onFullScreen" | "playerState" | "onSeek" | "onSeeking"> & {
    onPause: () => void;
    customSliderStyle?: CustomSliderStyle;
    hideSeekbar?: boolean;
};
declare const Slider: (props: Props) => React.JSX.Element;
export { Slider };
