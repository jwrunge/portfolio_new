import type * as CSS from "csstype";

export type Dimensions = { width: string, height: string };
export type Positioning = { top?: string, left?: string, right?: string, bottom?: string };

export type ElementSettings = {
    dimensions?: boolean | Dimensions,
    pos?: boolean | Positioning,
    style?: false | CSS.Properties,
    init?: (( canvas?: HTMLElement )=> void ),
    onResize?: (( canvas?: HTMLElement )=> void ),
}

function getSettingValue<T>(value: T |  undefined, defaultValue: T): T {
    return value === undefined ? defaultValue : value;
}

export function elementSettings(el?: HTMLElement, settings?: ElementSettings) {
    if(!el) return;

    for(let key of ["width", "height"]) {
        el.style.setProperty(key, getSettingValue(settings?.dimensions, true) ? "100%" : "");
    }
    for(let key of ["top", "left", "right", "bottom"]) {
        el.style.setProperty(key, getSettingValue(settings?.pos, true) ? "0" : "");
    }

    for(let [key, value] of Object.entries(settings?.style || {})) {
        el.style.setProperty(key, value);
    }

    settings?.init?.(el);
    if(settings?.onResize) {
        settings?.onResize(el);
        el.addEventListener("resize", ()=> settings?.onResize?.(el));
    }
}