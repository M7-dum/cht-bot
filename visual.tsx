"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
import TextInput = formattingSettings.TextInput;

/**
 * Data Point Formatting Card
 */
class ApiCardSettings extends FormattingSettingsCard {
    apiUrl = new TextInput({
        name: "apiUrl",
        displayName: "API URL",
        placeholder: "https://...",
        value: ""
    });

    name: string = "api";
    displayName: string = "Chat Settings";
    slices: Array<FormattingSettingsSlice> = [this.apiUrl];
}

/**
* visual settings model class
*
*/
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    // Create formatting settings model formatting cards
    apiCard = new ApiCardSettings();

    cards = [this.apiCard];
}
