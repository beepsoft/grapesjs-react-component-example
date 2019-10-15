import React, {useEffect, useState} from 'react';
import { Style } from "react-style-tag";
import JsxParser from "react-jsx-parser";
import Timer from "react-compound-timer";

const TemplateDisplay = ({htmlString, cssString}) => {
    return (
        <>
            AAAA
            <Style>{cssString}</Style>
            <JsxParser components={{Timer}} jsx={htmlString} />
            BBBB
        </>
    );
}

export default TemplateDisplay;