import React, {useEffect, useState} from 'react';
import {GEditor, GrapesPluginType} from "grapesjs-react";
import 'grapesjs/dist/css/grapes.min.css';

import {timerPluginRef} from "./timer/consts";
import addTimerPlugin from './timer';

import {cardPluginRef} from "./card/consts";
import addCardPlugin from './card';

import {listPluginRef} from "./list/consts";
import addListPlugin from './list';

import TemplateDisplay from "./templateDisplay";

const App: React.FC = () => {

    const [htmlString, setHtmlString] = useState(null);
    const [cssString, setCssString] = useState("");
    const [pluginLoaded, setPluginLoaded] = useState(false);

    if (!pluginLoaded) {
        // Pass the state setters to the timer plugin, so that each time the bell is pressed these gets called
        // and the TemplateDisplay gets updated with the new values
        // addTimerPlugin(setHtmlString, setCssString);
        addCardPlugin();
        addTimerPlugin();
        addListPlugin();
        setPluginLoaded(true);
    }

    return (
        <>
            <GEditor id="geditor" plugins={[timerPluginRef, cardPluginRef, listPluginRef]}/>
            <TemplateDisplay jsxString={htmlString} cssString={cssString} />
        </>
    );
}

export default App;
