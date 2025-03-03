import React from "react";
import { GestureResponderEvent, ViewStyle } from "react-native";
import { PLAYER_STATES } from "./constants/playerStates";
import { CustomSliderStyle } from "./Slider";
import { Toolbar } from "./Toolbar";
export declare type Props = {
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
interface MediaControlsComponent extends React.FC<Props> {
    Toolbar: typeof Toolbar;
}
declare const MediaControls: MediaControlsComponent;
export default MediaControls;
