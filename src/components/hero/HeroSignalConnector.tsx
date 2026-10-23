"use client";

import { forwardRef, useImperativeHandle } from "react";

export interface HeroSignalConnectorHandle {
  updateProgress: (progress: number) => void;
}

interface HeroSignalConnectorProps {
  trackRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * HeroSignalConnector (Deprecated / No-op)
 * The connected golden scroll path in the hero has been removed per visual review.
 */
const HeroSignalConnector = forwardRef<HeroSignalConnectorHandle, HeroSignalConnectorProps>(
  function HeroSignalConnector(_props, ref) {
    useImperativeHandle(ref, () => ({
      updateProgress: () => {},
    }));

    return null;
  }
);

export default HeroSignalConnector;
