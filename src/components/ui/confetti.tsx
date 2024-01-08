import Confetti from "react-confetti";
import React from "react";
import useWindowSize from "react-use/lib/useWindowSize";

export const NextConfetti = (props: any) => {
  const { width, height } = useWindowSize();
  return <Confetti className="w-screen h-screen absolute top-0 left-0" {...props} width={width} height={height} />;
};
