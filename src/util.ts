import {HES} from "./types/UploaderConfig";

export const getElement = (el?: HES):null|HTMLElement => {
    if(typeof el==='undefined') return null;
    return el instanceof HTMLElement ? el : document.querySelector(el);
}