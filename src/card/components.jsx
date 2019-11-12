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
import React from 'react'
import ReactDOM from 'react-dom'
import ReactCardPreview from 'react-card-preview' // or-ui-base (REACT COMPONENT exported)
import { cardRef } from './consts'

export default function (editor, opt = {}) {
	const domc = editor.DomComponents
	const defaultType = domc.getType ('default')
	const defaultModel = defaultType.model
	const defaultView = defaultType.view
	
	domc.addType (cardRef, {
		
		model: defaultModel.extend ({
			defaults: {
				...defaultModel.prototype.defaults,
				droppable: false,
				traits: [
					{
						name: 'placeholder',
						changeProp: 1,
					}
				]
			},
		}, {
			isComponent (el) {
				console.log ('isComponent', el)
				//debugger;
				if ((
					el.getAttribute && el.getAttribute ('data-gjs-type') == cardRef
					)
					|| (
						el.attributes && el.attributes['data-gjs-type'] == cardRef
					)) {
					return {
						type: cardRef
					}
				}
			}
		}),
		
		view: defaultView.extend ({
			// Listen to changes of startFrom, timerLabel or displayLabels managed by the traits
			init () {
				// this.listenTo(this.model, 'change:startFrom change:timerLabel change:displayLabels', this.handleChanges);
				console.log ('init() method from /components.jsx removed')
			},
			
			// Called whenever startFrom, timerLabel or displayLabels changes
			handleChanges (e) {
				/// Force rerender
				// Make sure we start react from scratch for el
				// ReactDOM.unmountComponentAtNode(this.el);
				// this.render();
				console.log ('handleChanges() method from /components.jsx removed')
			},
			
			onRender ({ el }) {
				// Calc initialTime. If startFrom is set in the trait, then calculate, otherwise leave it 0
				// let initialTime = 0;
				
				// Initially show timer proceeding forward
				// let direction = 'forward';
				
				// If startFrom is set, then set this as the initial time and set direction fo backward
				
				// Removing timer-related functions
				
				// if (this.model.attributes.startFrom != "") {
				//     const startFrom = this.model.attributes.startFrom;
				//     var start = Date.parse(startFrom);
				//     var now = new Date().getTime();
				//     initialTime = start-now;
				//     direction = 'backward';
				// }
				
				// Update the component in the model, ie: this will be the actual html content of the editor (stored
				// under 'gjs-html' key on localStorage)
				// Note: if startFrom has been set at this point grapesjs will also save its value in the local storage
				// at the 'gjs-components' key along with the timer component's other values.
				// Ie. it will look like this:
				// "components": [
				//     {
				//         "type": "timer",
				//         "content": "",
				//         "classes": [
				//             {
				//                 "name": "timer",
				//                 "label": "timer",
				//                 "type": 1,
				//                 "active": true,
				//                 "private": false,
				//                 "protected": false
				//             }
				//         ],
				//         "startFrom": "2019-10-31",
				//         "components": [
				//             {
				//                 "tagName": "timer",
				//                 "content": "",
				//                 "attributes": {
				//                     "initialtime": "1688547182"
				//                 }
				//             }
				//         ]
				//     }
				// ]
				//
				// And the matching 'gjs-html' will have:
				// <timer initialtime="1688547182"></timer>
				
				//
				// Add practically the same JSX as the component. Note: the only real difference is that formatValue
				// attruibute calls a "formatValue" function that will be provided by the JsxParser (with the same
				// function as in the react component below.
				//
				const comps = this.model.get ('components')
				comps.reset ()
				const compString =
					`<ReactCardPreview> </ReactCardPreview>`
				comps.add (compString)
				
				// And this will be the "live" view of the timer. How this live view relates to the actual
				// JSQ generated as the component is left to you. In theory the same JSX that is generated here below
				// could be used as a string as the component html above. For now we have this complex view and a simple
				// <Timer initialTime="..."/> as the component.
				// Note: 'this' references the current Backbone.View and all its features can be used in the JSX. For
				// now we generate the labels previously stored as "attributes"
				ReactDOM.render (
					<>
						<ReactCardPreview
							name="Tom Jones"
							brand="mastercard"
							expiry="11/23"
							cvc="112"
							lastFourDigits="4242"
						/>
					</>
					, el)
			},
		}),
	})
}

