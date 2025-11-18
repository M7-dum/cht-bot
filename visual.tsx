"use strict";

import * as React from "react";
import "./visual.less";
import * as ReactDOM from "react-dom/client";
import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import ChatbotComponent from "./ChatbotComponent";

export class Visual implements IVisual {
  private target: HTMLElement;
  private reactRoot: ReactDOM.Root;

  constructor(options: VisualConstructorOptions) {
    this.target = options.element;
    this.reactRoot = ReactDOM.createRoot(this.target);
    this.reactRoot.render(<ChatbotComponent />);
  }

  public update(options: VisualUpdateOptions) {
    // Optionally handle data updates here if needed
  }

  public destroy(): void {
    this.reactRoot.unmount();
  }
}
