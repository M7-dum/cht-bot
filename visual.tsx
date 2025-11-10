"use strict";

import * as React from "react";
import * as ReactDOM from "react-dom/client";

import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

import { ChatbotComponent } from "./ChatbotComponent";
import "./../style/visual.less";

export class Visual implements IVisual {
  private target: HTMLElement;
  private reactRoot: ReactDOM.Root | null = null;

  constructor(options: VisualConstructorOptions) {
    this.target = options.element;
    // Create the React root once
    this.reactRoot = ReactDOM.createRoot(this.target);
  }

  public update(options: VisualUpdateOptions) {
    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this.target);
    }
    // Read API Key from data pane (bound field)
    const apiKey = this.getFirstCategoricalValueByRole(options, "apiKeyField");

    // Render and provide API Key only
    this.reactRoot.render(
      <ChatbotComponent apiKey={apiKey} />
    );
  }

  private getFirstCategoricalValueByRole(options: VisualUpdateOptions, roleName: string): string | undefined {
    try {
      const dv = options.dataViews && options.dataViews[0];
      const categories = dv && dv.categorical && dv.categorical.categories;
      if (!categories || !categories.length) return undefined;
      for (const c of categories) {
        const roles = (c as any).source && (c as any).source.roles;
        if (roles && roles[roleName]) {
          const values = c.values as any[];
          if (values && values.length && typeof values[0] === "string") {
            return values[0] as string;
          }
        }
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  /** 
   * Calls backend API to get bot response. 
   * Modify endpoint, error handling, payload as needed. 
   */
  private async sendQuery(query: string): Promise<string> {
    const endpoint = "https://yourbackend.example.com/chat";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query /*, optional context */ })
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      return data.answer ?? "No answer returned";
    } catch (error) {
      console.error("sendQuery error:", error);
      return "Error: unable to get response";
    }
  }
}
