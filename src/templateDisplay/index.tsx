import React, {useEffect, useState} from 'react';
import { Style } from "react-style-tag";
import JsxParser from "react-jsx-parser";
import Timer from "react-compound-timer";

/**
 * Display a react com
 * @param jsxString
 * @param cssString
 * @constructor
 */
const TemplateDisplay = ({jsxString, cssString}) => {
    return (
        <>
            <Style>{cssString}</Style>
            <JsxParser components={{Timer}} jsx={jsxString} bindings={
                {
                    // This is called from the formatValue attribute of the Timer coming in htmlString
                    formatValue: (value) => `${(value < 10 ? `0${value}` : value)}`
                }
            }/>
        </>
    );
}

export default TemplateDisplay;