/**
 * Timer plugin.
 *
 * Defined various plugin defautl values and loads the timer block and timer component provided by the plugin
 */

import grapesjs from 'grapesjs';
import loadComponents from './components';
import loadBlocks from './blocks';
import loadCommands from './commands';
import loadPanels from './panels';
import parserHtmlCaseSensitive from './ParserHtmlCaseSensitive';

import {
    timerRef,
    timerPluginRef
} from './consts';

export default function addTimerPlugin(setHtmlString, setCssString) {
    console.log('grapesjs.plugins', grapesjs.plugins);
    grapesjs.plugins.add(timerPluginRef, (editor, opts = {}) => {
        console.log('plugins.add', editor);
        let c = opts;

        let defaults = {
            blocks: [timerRef],

            // Label in block
            blockLabel: 'Timer',

            // Category in block
            blockCategory: 'Extra',

            // Date input type, eg, 'date', 'datetime-local'
            dateInputType: 'date',

            // Default style
            defaultStyle: true,

            // Default start time, eg. '2018-01-25 00:00'. Can be configured at runtime.
            startTime: '',

            // Label of a timer. Can be configured at runtime.
            timerLabel: 'Timer',

            // Display labels for day, hours, minutes, seconds? Can be configured at runtime.
            displayLabels: false,

            // Days label text used in component
            labelDays: 'days',

            // Hours label text used in component
            labelHours: 'hours',

            // Minutes label text used in component
            labelMinutes: 'minutes',

            // Seconds label text used in component
            labelSeconds: 'seconds',

            setHtmlString: setHtmlString,

            setCssString: setCssString

        };

        // Load defaults
        for (let name in defaults) {
            if (!(name in c))
                c[name] = defaults[name];
        }

        // Add components
        loadComponents(editor, c);

        // Add components
        loadBlocks(editor, c);

        // Load commands
        loadCommands(editor, c);

        // Load panels
        loadPanels(editor, c);

        // HACK: we need to replace the default HTML parser with our own, so that things won't be lowercased
        // grapesjs doesn't have a public API to provide a custom html parser
        const em = editor.getModel();
        const emConf = em.get('Config');
        // This needs to be handset (in GrapesJS it comes from parser/config/config.js)
        emConf.textTags = ['br', 'b', 'i', 'u', 'a', 'ul', 'ol'];
        em.get('Parser').parserHtml = parserHtmlCaseSensitive(emConf);
        em.get('Parser').parseHtml = (str) => {
            const pHtml = em.get('Parser').parserHtml;
            //pHtml.compTypes = em ? em.get('DomComponents').getTypes() : compTypes;
            pHtml.compTypes = em.get('DomComponents').getTypes();
            return pHtml.parse(str, em.get('Parser').parserCss);
        };
    });
}

