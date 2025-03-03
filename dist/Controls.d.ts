import React from "react";
import { Props } from "./MediaControls";
declare type ControlsProps = Pick<Props, "isLoading" | "mainColor" | "playerState" | "onReplay"> & {
    onPause: () => void;
};
declare const Controls: (props: ControlsProps) => React.JSX.Element;
export { Controls };
