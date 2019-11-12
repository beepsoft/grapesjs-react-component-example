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
import parserHtmlOrig from './ParserHtmlOrig';

import {
    cardRef,
    cardPluginRef
} from './consts';

export default function addCardPlugin() {
    grapesjs.plugins.add(cardPluginRef, (editor, opts = {}) => {
        let c = opts;

        let defaults = {
            blocks: [cardRef],

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
        //em.get('Parser').parserHtml = parserHtmlOrig(emConf);
        em.get('Parser').parseHtml = (str) => {
            const pHtml = em.get('Parser').parserHtml;
            //pHtml.compTypes = em ? em.get('DomComponents').getTypes() : compTypes;
            pHtml.compTypes = em.get('DomComponents').getTypes();
            let res = pHtml.parse(str, em.get('Parser').parserCss);
            return res;
        };

        // Show the blocks panel by default
        editor.on("load", () => {
            const openBl = editor.Panels.getButton('views', 'open-blocks');
            openBl && openBl.set('active', 1);
            //editor.runCommand('open-blocks');
        });

    });
}

