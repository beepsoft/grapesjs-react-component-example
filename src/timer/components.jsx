/**
 *
 *
 */
import React from 'react';
import ReactDOM from 'react-dom';
import Timer from 'react-compound-timer';
import {timerRef} from "./consts";

// This ain't nice yet: we have this global to mark that we are inside a react component and so builtin HTML components
// should be handled by ReactDefaultType
let inReactComponent = false;

export function addReactComponent(editor, reactComponent, opts = {}) {
    const domc = editor.DomComponents;
    let reactType = domc.getType('default');
    let reactModel = reactType.model;
    let reactView = reactType.view;
    const config = opts;

    domc.addType(opts.tagName, {
        model: reactModel.extend(
            {
                defaults: {
                    ...reactModel.prototype.defaults,
                    tagName: config.tagName,
                    reactComponent: reactComponent
                }
            },
            {
                isComponent(el) {
                    if (typeof el.tagName !== 'undefined') {
                        // Otherwise it is a react compo if tagName matches preset tagName
                        if (el.tagName == config.tagName) {
                            inReactComponent = true;
                            // TODO: when to set inReactComponent to false?
                            return {
                                type: config.tagName
                            }
                        }
                    }

                    if (inReactComponent) {
                        let type = null;
                        if (el.tagName) {
                            type = domc.getType(el.tagName);
                            if (!type) {
                                return {
                                    type: "ReactDefaultType"
                                }

                            }
                        }
                        // May handle textnodes here, but doesn't seem necessary
                        // else {
                        //     return {
                        //         //type: "ReactTextNode"
                        //         type: "textnode"
                        //     }
                        // }
                    }

                },

                updated(property, value, prevValue) {
                    debugger;
                },

            }
        ),
        view: reactView.extend({
            reactRender(parentChildren) {

                // debugger;
                //Now this needs to generate top level react node, then render children passing the 'children' array!
                const { id, model, el, opts } = this;

                let myChildren = new Array();
                const compos = model.components();
                const dt = opts.componentTypes;

                // Render children first
                compos.each(model => {

                    let type = model.get('type');
                    // For textnodes force rendering using ReactTextNode
                    if (type == 'textnode') {
                        type = 'ReactTextNode';
                    }
                    let viewObject =  null;

                    // Find view for the model
                    for (let it = 0; it < dt.length; it++) {
                        if (dt[it].id == type) {
                            viewObject = dt[it].view;
                            break;
                        }
                    }

                    // TODO: Backbone always creates a HTML element at this point no matter what
                    // but we will simply not use it. Still it may effect performance a bit.
                    const view = new viewObject({
                        model,
                        opts,
                        componentTypes: dt
                    });

                    // Render the element by adding it to myChildren
                    view.reactRender(myChildren)
                });

                // In case it is a text node it will be the element itself, otherwise either a
                // custom react component (from model.attributes.reactComponent) or jsut the name of
                // a default HTML element.
                const reactEl =
                    model.attributes.content
                    ? model.attributes.content
                    : React.createElement(
                    model.attributes.reactComponent
                        ? model.attributes.reactComponent
                        : model.attributes.tagName, // default html tag or text node
                        model.getAttributes(),
                   myChildren
                );

                // If parentChildren has been provided, then this component is a child react compo, so add to
                // parentChildren. Otherwise this is the root react component and needs to actually render to the DOM
                if (parentChildren) {
                    parentChildren.push(reactEl);
                }
                else {
                    ReactDOM.render(reactEl, el);
                }

                return this;
            },

            // Default render is called for the top level react element. We just delegate to this.reactRender()
            render() {
                //inReactComponent = true;
                this.reactRender(null);
                inReactComponent = false;
                return this;
            }

        })
    });
}

// Add react components including the ReactDefaultType for the default html elements
export default function addComponents(editor, opts = {}) {

    // Component for rendering text nodes as react element
    addReactComponent(editor, null, {...opts, tagName: 'ReactTextNode'});

    // Generic renderer for builtin HTML elements
    addReactComponent(editor, null, {...opts, tagName: 'ReactDefaultType'});

    // Specific components
    addReactComponent(editor, Timer, {...opts, tagName: 'Timer'});
    addReactComponent(editor, Timer.Days, {...opts, tagName: 'Timer.Days'});
    addReactComponent(editor, Timer.Hours, {...opts, tagName: 'Timer.Hours'});
    addReactComponent(editor, Timer.Minutes, {...opts, tagName: 'Timer.Minutes'});
    addReactComponent(editor, Timer.Seconds, {...opts, tagName: 'Timer.Seconds'});

    const domc = editor.DomComponents;
    const defaultReactType = domc.getType('ReactDefaultType');
    const defaultReactModel = defaultReactType.model;
    const defaultReactView = defaultReactType.view;
    const c = opts;
    const pfx = c.timerClsPfx;

    domc.addType(timerRef, {

        model: defaultReactModel.extend({
            defaults: {
                ...defaultReactModel.prototype.defaults,
                startFrom: c.startTime,
                timerLabel: c.timerLabel,
                displayLabels: c.displayLabels,
                labels: {
                    labelDays: c.labelDays,
                    labelHours: c.labelHours,
                    labelMinutes: c.labelMinutes,
                    labelSeconds: c.labelSeconds,
                },
                droppable: false,
                traits: [{
                    label: 'Start (won\'t work for now)',
                    name: 'startFrom',
                    changeProp: 1,

                    type: 'datetime-local', // can be 'date'
                }, {
                    label: 'Label (won\'t work for now)',
                    name: 'timerLabel',
                    changeProp: 1,
                }, {
                    label: 'Display labels (won\'t work for now)',
                    name: 'displayLabels',
                    type: 'checkbox',
                    changeProp: 1,
                }]
            },
        }, {
            isComponent(el) {
                //console.log('isComponent', el);
                // debugger;
                if ((el.getAttribute && el.getAttribute('data-gjs-type') == timerRef)
                    || (el.attributes && el.attributes['data-gjs-type'] == timerRef)) {
                    return {
                        type: timerRef
                    };
                }
            }
        }),


        view: defaultReactView.extend({
            // Listen to changes of startFrom, timerLabel or displayLabels managed by the traits
            init() {
                // Ignore trait handling for now
                //this.listenTo(this.model, 'change:startFrom change:timerLabel change:displayLabels', this.handleChanges);

                // Also, keep the initial components for now, don't reset every time with the default component structure.
                const comps = this.model.get('components');
                if (!comps.length) {
                    this.updateComponents();
                }
            },

            updateComponents()
            {
                // Calc initialTime. If startFrom is set in the trait, then calculate, otherwise leave it 0
                let initialTime = 0;
                const el = this.el;

                // Initially show timer proceeding forward
                let direction = 'forward';

                // If startFrom is set, then set this as the initial time and set direction fo backward
                if (this.model.attributes.startFrom != "") {
                    const startFrom = this.model.attributes.startFrom;
                    var start = Date.parse(startFrom);
                    var now = new Date().getTime();
                    initialTime = start-now;
                    direction = 'backward';
                }

                const comps = this.model.get('components');
                comps.reset();

//                            formatValue={formatValue}
                const compString =
                    `<Timer
                            `+(direction=="backward" ? `initialTime="${initialTime}"` : "")+`
                            direction="${direction}"
                        >
                        <span className="timer-days">
                            <Timer.Days/>${this.model.attributes.displayLabels ? " "+this.model.attributes.labels.labelDays+" " : ', '}
                        </span>
                        <span className="timer-hours">
                            <Timer.Hours/>${this.model.attributes.displayLabels ? " "+this.model.attributes.labels.labelHours+" " : ':'}
                        </span>
                            <span className="timer-minutes">
                            <Timer.Minutes/>${this.model.attributes.displayLabels ? " "+this.model.attributes.labels.labelMinutes+" " : ':'}
                        </span>
                            <span className="timer-seconds">
                            <Timer.Seconds/>${this.model.attributes.displayLabels ? " "+this.model.attributes.labels.labelSeconds : ''}
                        </span>
                        </Timer> CCCC DDDD`;
                comps.add(compString);

            },

            // Called whenever startFrom, timerLabel or displayLabels changes
            handleChanges(e) {
                /// Force rerender
                // Make sure we start react from scratch for el
                ReactDOM.unmountComponentAtNode(this.el);
                this.updateComponents();
                this.render();
            },

            // Using addReactComponent()'s render()
        }),
    });



}

