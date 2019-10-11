/**
 * Timer plugin.
 *
 * Defined various plugin defautl values and loads the timer block and timer component provided by the plugin
 */

import grapesjs from 'grapesjs';
import loadComponents from './components';
import loadBlocks from './blocks';
import {
    timerRef,
    timerPluginRef
} from './consts';

export default grapesjs.plugins.add(timerPluginRef, (editor, opts = {}) => {
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
});
