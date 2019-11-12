/**
 *
 * This is the Timer grapesjs component, which generates JSX for its template representation and uses
 * a react component (react-compound-timer) to display the actual live Timer.
 *
 * The main trick here is that onRender() time we mount the actual react component onto the html that grapesjs uses
 * to represent our component (this is <div class="timer" data-gjs-type="${timerRef}"></div> as defines in blocks.js).
 *
 * Also, the component's model is represented as JSX, in this example a simplified version of the <Timer/> component.
 *
 * This example also includes traits for editing the live Timer's properties:
 * - startFrom: by default the timer will count forward. If startFrom is set it will start backwards from that date
 * - timerLabel: the label to display in front of the timer
 * - displayLabels: if unchecked displays time as 19, 22:10:15. If checked: 19 days 20 hours 10 minutes 15 seconds.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ListPicker from "react-list-picker";
import { Form } from "react-final-form";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import arrayMutators from "final-form-arrays";
import {listRef} from "./consts";

export default function (editor, opt = {}) {
    const c = opt;
    const domc = editor.DomComponents;
    const defaultType = domc.getType('default');
    const defaultModel = defaultType.model;
    const defaultView = defaultType.view;
    const pfx = c.timerClsPfx;

    domc.addType(listRef, {

        model: defaultModel.extend({
            defaults: {
                ...defaultModel.prototype.defaults,
                startFrom: c.startTime,
                timerLabel: c.timerLabel,
                displayLabels: c.displayLabels,
                droppable: false,
                traits: [{
                    label: 'List Title',
                    name: 'startFrom',
                    changeProp: 1,
                    type: 'datetime-local', // can be 'date'
                }]
            },
        }, {
            isComponent(el) {
                //console.log('isComponent', el);
                //debugger;
                if ((el.getAttribute && el.getAttribute('data-gjs-type') == listRef)
                || (el.attributes && el.attributes['data-gjs-type'] == listRef)) {
                    return {
                        type: listRef
                    };
                }
            }
        }),


        view: defaultView.extend({
            // Listen to changes of startFrom, timerLabel or displayLabels managed by the traits
            init() {
                // this.listenTo(this.model, 'change:startFrom change:timerLabel change:displayLabels', this.handleChanges);
            },

            // Called whenever startFrom, timerLabel or displayLabels changes
            handleChanges(e) {
                /// Force rerender
                // Make sure we start react from scratch for el
                // ReactDOM.unmountComponentAtNode(this.el);
                // this.render();
            },

            onRender({el}) {
                // Calc initialTime. If startFrom is set in the trait, then calculate, otherwise leave it 0
                const myOptions = ["Meat Lover", "Veggie Heaven", "Hawaii-5-0", "Inferno"];
    
                let output = [];
    
                const onSubmit = values => {
                    output = values.crazyList;
                };
    
                const theme = createMuiTheme({
                    palette: {
                        primary: { main: "#333" },
                        secondary: { main: "#000" }
                    },
                    status: {
                        danger: "yellow"
                    }
                });
                //
                const comps = this.model.get('components');
                comps.reset();
                const compString =
                    `<MuiThemeProvider theme={theme}>
                          <Form
                            onSubmit={onSubmit}
                            mutators={{
                              ...arrayMutators // super important to include!!!
                            }}
                            render={({ handleSubmit, ...rest }) => (
                              <form onSubmit={handleSubmit} style={{ padding: "50px" }}>
                                <ListPicker
                                  name="crazyList"
                                  data={myOptions}
                                  isMulty
                                  title="My crazy list"
                                  buttonText="React List Picker"
                                />
                                <hr />
                                <button type="submit">Submit</button>
                     
                                {output.map(val => (
                                  <h6>{val}</h6>
                                ))}
                              </form>
                            )}
                          />
                        </MuiThemeProvider>`;
                comps.add(compString);

                // And this will be the "live" view of the timer. How this live view relates to the actual
                // JSQ generated as the component is left to you. In theory the same JSX that is generated here below
                // could be used as a string as the component html above. For now we have this complex view and a simple
                // <Timer initialTime="..."/> as the component.
                // Note: 'this' references the current Backbone.View and all its features can be used in the JSX. For
                // now we generate the labels previously stored as "attributes"
                ReactDOM.render(
                    <>
                        <MuiThemeProvider theme={theme}>
                            <Form
                              onSubmit={onSubmit}
                              mutators={{
                                  ...arrayMutators // super important to include!!!
                              }}
                              render={({ handleSubmit, ...rest }) => (
                                <form onSubmit={handleSubmit} style={{ padding: "50px" }}>
                                    <ListPicker
                                      name="crazyList"
                                      data={myOptions}
                                      isMulty
                                      title="My crazy list"
                                      buttonText="React List Picker"
                                    />
                                    <hr />
                                    <button type="submit">Submit</button>
                
                                    {output.map(val => (
                                      <h6>{val}</h6>
                                    ))}
                                </form>
                              )}
                            />
                        </MuiThemeProvider>
                    </>
                    , el);
            },

        }),
    });
}

