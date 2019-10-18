import { each, isString } from 'underscore';
import { parse as nodeHtmlParser } from "node-html-parser";
import XRegExp from "xregexp";

window.nodeHtmlParser = nodeHtmlParser;

/**
 * Parses an HTML string into its HTML and CSS component representation keeping case of tags and attributes. This
 * is necessary in case you want React compatible JSX tags in the template, in which case the react components must start
 * wih uppercase and also the camel casing of attributes is importane (ie. className vs classname)
 *
 * This function is based on src/parser/model/ParserHtml.js. For parsing we are using node-html-parser instead of
 * the browser's DOM to keep the case of tags and attributes. The code is mostly the same  as in ParserHtml.js
 * by maing the objects created by  node-html-parser compatible with the DOM representation.
 *
 * @param config usual grapesjs config
 * @returns parser function
 */
export default config => {
    var TEXT_NODE = 'span';
    var c = config;
    var modelAttrStart = 'data-gjs-';

    return {
        compTypes: '',

        modelAttrStart,

        /**
         * Extract component props from an attribute object
         * @param {Object} attr
         * @returns {Object} An object containing props and attributes without them
         */
        splitPropsFromAttr(attr = {}) {
            const props = {};
            const attrs = {};

            each(attr, (value, key) => {
                if (key.indexOf(this.modelAttrStart) === 0) {
                    const modelAttr = key.replace(modelAttrStart, '');
                    const valueLen = value.length;
                    const valStr = value && isString(value);
                    const firstChar = valStr && value.substr(0, 1);
                    const lastChar = valStr && value.substr(valueLen - 1);
                    value = value === 'true' ? true : value;
                    value = value === 'false' ? false : value;

                    // Try to parse JSON where it's possible
                    // I can get false positive here (eg. a selector '[data-attr]')
                    // so put it under try/catch and let fail silently
                    try {
                        value =
                            (firstChar == '{' && lastChar == '}') ||
                            (firstChar == '[' && lastChar == ']')
                                ? JSON.parse(value)
                                : value;
                    } catch (e) {}

                    props[modelAttr] = value;
                } else {
                    attrs[key] = value;
                }
            });

            return {
                props,
                attrs
            };
        },

        /**
         * Given a string with html (jsx). Attributes having JSX expressions will be quoted to look like
         * actual HTML attributes
         * @param {*} html
         * @return html with quoted JSX attributes
         *
         * https://stackoverflow.com/questions/546433/regular-expression-to-match-balanced-parentheses
         */
        quoteJsxExpresionsInAttributes(html) {
            let found = XRegExp.matchRecursive(html, "{", "}", "g");
            for (let i = 0; i < found.length; i++) {
                // (value) => \`\${(value) => < 10 ? \`0\${value}\` : value)}\`
                // --> {(value) => \`\${(value) => < 10 ? \`0\${value}\` : value)}\`}
                let pattern = "{" + found[i] + "}";
                let lastStartPos = 0;
                // Find pattern until we reach and of html
                while (true) {
                    let needsQuote = false;
                    // get next match position
                    let matchPos = html.indexOf(pattern, lastStartPos);
                    if (matchPos === -1) {
                        break;
                    }
                    // We will look back 1 and 2 characters
                    let oneCharBeforePos = matchPos - 1;
                    let twoCharBeforePos = matchPos - 2;
                    if (twoCharBeforePos > 0 && oneCharBeforePos > 0) {
                        // Need to quote if have sg like this:
                        //   formatValue={(value) => \`\${(value) => < 10 ? \`0\${value}\` : value)}\`}
                        // (ie: if patterns comes atfre and equals sime, but not =")
                        // But no need to quote if:
                        //    formatValue="{(value) => \`\${(value) => < 10 ? \`0\${value}\` : value)}\`}"
                        //    <Timer.Days/>{this.model.attributes.displayLabels ? " "+this.model.attributes.labels.labelDays+" " : ', '}
                        needsQuote =
                            html.substring(twoCharBeforePos, twoCharBeforePos + 2) !== '="' &&
                            html.substring(oneCharBeforePos, oneCharBeforePos + 1) === "=";
                    }

                    // If need to quote: replace patterns with quoted version also escaping some HTML entities
                    if (needsQuote) {
                        let replacement =
                            '"{' +
                            found[i]
                                .replace("<", "&lt;")
                                .replace(">", "&gt;")
                                .replace("&", "&amp;")
                            + '}"';
                        html = html.replace(pattern, replacement);
                        lastStartPos = matchPos + replacement.length;
                    } else {
                        lastStartPos = matchPos + pattern.length;
                    }

                    // No lastStartPos placed after the processed string
                }
            }
            return html;
        },

//     quoteJsxExpresion(
//         `
// <Timer
//   initialTime="{initialTime}"
//   formatValue={(value) => \`\${(value) => < 10 ? \`0\${value}\` : value)}\`} direction={direction}
//   formatValue2="{(value) => \`\${(value) => < 10 ? \`0\${value}\` : value)}\`}" direction="{direction}"
//                         >
//                         <span className="timer-days">
//                             <Timer.Days/>{this.model.attributes.displayLabels ? " "+this.model.attributes.labels.labelDays+" " : ', '}
//                         </span>
//                         <span className="timer-hours">
//                             <Timer.Hours/>{this.model.attributes.displayLabels ? " "+this.model.attributes.labels.labelHours+" " : ':'}
//                         </span>
//                             <span className="timer-minutes">
//                             <Timer.Minutes/>{this.model.attributes.displayLabels ? " "+this.model.attributes.labels.labelMinutes+" " : ':'}
//                         </span>
//                             <span className="timer-seconds">
//                             <Timer.Seconds/>{this.model.attributes.displayLabels ? " "+this.model.attributes.labels.labelSeconds : ''}
//                         </span>
//                         </Timer>
// `
//     );

        /**
         * Unquote attributes containg JSX previously quoted using quoteJsxExpresionsInAttributes
         * @param html
         */
        unquoteJsxExpresionsInAttributes(html) {
            let found = html.match(/=["']{.*}["']/g);
            if (!found) {
                return html;
            }
            for (let i = 0; i < found.length; i++) {
                let pattern = found[i];
                let replacement = pattern.startsWith('="{')
                    ? pattern.replace('"{', "{").replace('}"', "}")
                    : pattern.replace("{'", "{").replace("}'", "}");
                replacement = replacement
                    .replace("&lt;", "<")
                    .replace("&gt;", ">")
                    .replace("&amp;", "&");
                html = html.replace(pattern, replacement);
            }
            return html;
        },


        /**
         * Parse style string to object
         * @param {string} str
         * @return {Object}
         * @example
         * var stl = ParserHtml.parseStyle('color:black; width:100px; test:value;');
         * console.log(stl);
         * // {color: 'black', width: '100px', test: 'value'}
         */
        parseStyle(str) {
            var result = {};
            var decls = str.split(';');
            for (var i = 0, len = decls.length; i < len; i++) {
                var decl = decls[i].trim();
                if (!decl) continue;
                var prop = decl.split(':');
                result[prop[0].trim()] = prop
                    .slice(1)
                    .join(':')
                    .trim();
            }
            return result;
        },

        /**
         * Parse class string to array
         * @param {string} str
         * @return {Array<string>}
         * @example
         * var res = ParserHtml.parseClass('test1 test2 test3');
         * console.log(res);
         * // ['test1', 'test2', 'test3']
         */
        parseClass(str) {
            const result = [];
            const cls = str.split(' ');
            for (let i = 0, len = cls.length; i < len; i++) {
                const cl = cls[i].trim();
                if (!cl) continue;
                result.push(cl);
            }
            return result;
        },

        toAttrArray(obj){
            var attrArr = [];
            Object.keys(obj).map(key => {
                attrArr.push({'nodeName':key, 'nodeValue':obj[key]})
            })
            return attrArr;
        },

        /**
         * Get data from the node element
         * @param  {HTMLElement} el DOM element to traverse
         * @return {Array<Object>}
         */
        parseNode(el) {
            const result = [];
            const nodes = el.childNodes;

            for (var i = 0, len = nodes.length; i < len; i++) {
                const node = nodes[i];

                // DOM copmatibility
                node.nodeValue = node.rawText;
                node.content = node.rawText;

                // Make attrs compatible with DOM representation
                let attrs = [];
                    attrs = (typeof node.attributes == 'object'
                        ? this.toAttrArray(node.attributes)
                        :  node.attributes)
                        || []
                    const attrsLen = attrs.length;
                const nodePrev = result[result.length - 1];
                const nodeChild = node.childNodes.length;
                const ct = this.compTypes;
                let model = {};

                // Start with understanding what kind of component it is
                if (ct) {
                    let obj = '';
                    let type =
                        node.getAttribute && node.getAttribute(`${modelAttrStart}type`);
                    if (!type) {
                        type = node.attributes && node.attributes[`${modelAttrStart}type`];
                    }

                    // If the type is already defined, use it
                    if (type) {
                        model = { type };
                    } else {
                        // Iterate over all available Component Types and
                        // the first with a valid result will be that component
                        for (let it = 0; it < ct.length; it++) {
                            const compType = ct[it];
                            obj = compType.model.isComponent(node);

                            if (obj) {
                                if (typeof obj !== 'object') {
                                    obj = { type: compType.id };
                                }
                                break;
                            }
                        }

                        model = obj;
                    }
                }

                // Use tagName as is, no lowercasing
                model.tagName = node.tagName;

                if (attrsLen) {
                    model.attributes = {};
                }

                // Parse attributes
                for (let j = 0; j < attrsLen; j++) {
                    const nodeName = attrs[j].nodeName;
                    let nodeValue = attrs[j].nodeValue;
                    // if (nodeName == "formatValue") {
                    //     debugger;
                    // }

                    // Isolate attributes
                    if (nodeName == 'style') {
                        model.style = this.parseStyle(nodeValue);
                    } else if (nodeName == 'class') {
                        model.classes = this.parseClass(nodeValue);
                    } else if (nodeName == 'contenteditable') {
                        continue;
                    } else if (nodeName.indexOf(modelAttrStart) === 0) {
                        const modelAttr = nodeName.replace(modelAttrStart, '');
                        const valueLen = nodeValue.length;
                        const firstChar = nodeValue && nodeValue.substr(0, 1);
                        const lastChar = nodeValue && nodeValue.substr(valueLen - 1);
                        nodeValue = nodeValue === 'true' ? true : nodeValue;
                        nodeValue = nodeValue === 'false' ? false : nodeValue;

                        // Try to parse JSON where it's possible
                        // I can get false positive here (eg. a selector '[data-attr]')
                        // so put it under try/catch and let fail silently
                        try {
                            nodeValue =
                                (firstChar == '{' && lastChar == '}') ||
                                (firstChar == '[' && lastChar == ']')
                                    ? JSON.parse(nodeValue)
                                    : nodeValue;
                        } catch (e) {}

                        model[modelAttr] = nodeValue;
                    } else {
                        model.attributes[nodeName] = nodeValue;
                    }
                }

                // Check for nested elements but avoid it if already provided
                if (nodeChild && !model.components) {
                    // Avoid infinite nested text nodes
                    const firstChild = node.childNodes[0];
                    // Make DOM compatible:
                    firstChild.nodeValue = firstChild.rawText;

                    // If there is only one child and it's a TEXTNODE
                    // just make it content of the current node
                    if (nodeChild === 1 && firstChild.nodeType === 3) {
                        !model.type && (model.type = 'text');
                        model.content = firstChild.nodeValue;
                    } else {
                        model.components = this.parseNode(node);
                    }
                }

                // Check if it's a text node and if could be moved to the prevous model
                if (model.type == 'textnode') {
                    // this had to be added ...
                    model.content = node.nodeValue;

                    if (nodePrev && nodePrev.type == 'textnode') {
                        nodePrev.content += model.content;
                        continue;
                    }

                    // Throw away empty nodes (keep spaces)
                    if (!config.keepEmptyTextNodes) {
                        const content = node.nodeValue;
                        if (content != ' ' && !content.trim()) {
                            continue;
                        }
                    }
                }

                // If all children are texts and there is some textnode the parent should
                // be text too otherwise I'm unable to edit texnodes
                const comps = model.components;
                if (!model.type && comps) {
                    let allTxt = 1;
                    let foundTextNode = 0;

                    for (let ci = 0; ci < comps.length; ci++) {
                        const comp = comps[ci];
                        const cType = comp.type;

                        if (
                            ['text', 'textnode'].indexOf(cType) < 0 &&
                            c.textTags.indexOf(comp.tagName) < 0
                        ) {
                            allTxt = 0;
                            break;
                        }

                        if (cType == 'textnode') {
                            foundTextNode = 1;
                        }
                    }

                    if (allTxt && foundTextNode) {
                        model.type = 'text';
                    }
                }

                // If tagName is still empty and is not a textnode, do not push it
                if (!model.tagName && model.type != 'textnode') {
                    continue;
                }

                result.push(model);
            }

            return result;
        },

        /**
         * Parse HTML string to a desired model object
         * @param  {string} str HTML string
         * @param  {ParserCss} parserCss In case there is style tags inside HTML
         * @return {Object}
         *
         */
        parse(str, parserCss) {
            console.log("html", str, parserCss);

            var config = (c.em && c.em.get('Config')) || {};
            var res = { html: '', css: '' };

            var quoted = this.quoteJsxExpresionsInAttributes(str);
            let wrappedInDiv = false;
            // If starts with a tag, then pass it to nodeHtmlParser() as is, otherwise it is a text node, wrap it in a div.
            if (!quoted.startsWith('<')) {
                quoted = '<div>'+quoted+'</div>';
                wrappedInDiv = true;
            }
            const dom = nodeHtmlParser(quoted);
            var result = this.parseNode(dom);

            if (result.length == 1) {
                result = result[0];
            }

            // If wrappedInDiv then the top component is the div, but we need just the contained components (ie. text node)
            if (wrappedInDiv) {
                // If div has subcomponents, only return those
                if (result.components) {
                    result = result.components;
                }
                // If this is just the dib (ie just text node in original html, then remove the tagName
                // and set type to textnode.
                else {
                    delete result.tagName;
                    result.type = "textnode";
                }
            }
            res.html = result;

            // // Detach style tags and parse them
            // Note: this is parsed via the actual DOM
            if (parserCss) {
                var el = document.createElement('div');
                el.innerHTML = str;
                var styleStr = '';
                var styles = el.querySelectorAll('style');
                var j = styles.length;

                while (j--) {
                    styleStr = styles[j].innerHTML + styleStr;
                    styles[j].parentNode.removeChild(styles[j]);
                }

                if (styleStr) res.css = parserCss.parse(styleStr);
            }

            return res;
        }
    };
};