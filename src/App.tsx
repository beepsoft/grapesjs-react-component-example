import React, {useEffect, useState} from 'react';
import GrapesJS from 'grapesjs';
import {GEditor, GrapesPluginType} from "grapesjs-react";
import 'grapesjs/dist/css/grapes.min.css';
import {timerPluginRef} from "./timer/consts";
import './timer';



const App: React.FC = () => {
    return (
        <GEditor id="geditor" plugins={[timerPluginRef]}/>
    );
}

export default App;
