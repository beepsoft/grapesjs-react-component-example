
src/dom_components/view/ComponentsView.js

```javascript
  /**
   * Add new object to collection
   * @param  {Object}  Model
   * @param  {Object}   Fragment collection
   * @param  {Integer}  Index of append
   *
   * @return   {Object}   Object rendered
   * @private
   * */
  addToCollection(model, fragmentEl, index) {
    if (!this.compView) this.compView = require('./ComponentView').default;
    const { config, opts } = this;
    const fragment = fragmentEl || null;
    const dt = opts.componentTypes;
    const type = model.get('type');
    let viewObject = this.compView;

    for (let it = 0; it < dt.length; it++) {
      if (dt[it].id == type) {
        viewObject = dt[it].view;
        break;
      }
    }

    const view = new viewObject({
      model,
      config,
      componentTypes: dt
    });
    let rendered = view.render().el;

    if (fragment) {
      fragment.appendChild(rendered);
    } else {
      const parent = this.parentEl;
      const children = parent.childNodes;

      if (!isUndefined(index)) {
        const lastIndex = children.length == index;

        // If the added model is the last of collection
        // need to change the logic of append
        if (lastIndex) {
          index--;
        }

        // In case the added is new in the collection index will be -1
        if (lastIndex || !children.length) {
          parent.appendChild(rendered);
        } else {
          parent.insertBefore(rendered, children[index]);
        }
      } else {
        parent.appendChild(rendered);
      }
    }

    return rendered;
  }
```

This is how it finds a view for the component:
1. `opts.componentTypes[tagName]` provides the type with model/view
2. if no matching type found, uses the default ComponentView `this.compView = require('./ComponentView').default`. This is used for standard HTML elements without a specific component.
3. Calls the view's `render()`



This is my example JSX
```html
        <div class="timer">
          <span className="timer-label">Timer</span>
          <Timer direction="forward" formatValue="{formatValue}">
            <span className="timer-days">
                <Timer.Days></Timer.Days>,
            </span>
            <span className="timer-hours">
                <Timer.Hours></Timer.Hours>:
            </span>
            <span className="timer-minutes">
                <Timer.Minutes></Timer.Minutes>:
            </span>
            <span className="timer-seconds">
                <Timer.Seconds></Timer.Seconds>
            </span>
          </Timer>
        </div>
```

This is the component definition for the above:
```json
        [
            {
                "tagName": "span",
                "type": "text",
                "content": "Timer",
                "attributes": {
                    "className": "timer-label"
                }
            },
            {
                "tagName": "Timer",
                "content": "",
                "attributes": {
                    "direction": "forward",
                    "formatValue": "{formatValue}"
                },
                "components": [
                    {
                        "tagName": "span",
                        "content": "",
                        "attributes": {
                            "className": "timer-days"
                        },
                        "components": [
                            {
                                "tagName": "Timer.Days",
                                "content": ""
                            },
                            {
                                "type": "textnode",
                                "content": ", \n                        "
                            }
                        ]
                    },
                    {
                        "tagName": "span",
                        "content": "",
                        "attributes": {
                            "className": "timer-hours"
                        },
                        "components": [
                            {
                                "tagName": "Timer.Hours",
                                "content": ""
                            },
                            {
                                "type": "textnode",
                                "content": ":\n                        "
                            }
                        ]
                    },
                    {
                        "tagName": "span",
                        "content": "",
                        "attributes": {
                            "className": "timer-minutes"
                        },
                        "components": [
                            {
                                "tagName": "Timer.Minutes",
                                "content": ""
                            },
                            {
                                "type": "textnode",
                                "content": ":\n                        "
                            }
                        ]
                    },
                    {
                        "tagName": "span",
                        "content": "",
                        "attributes": {
                            "className": "timer-seconds"
                        },
                        "components": [
                            {
                                "tagName": "Timer.Seconds",
                                "content": ""
                            }
                        ]
                    }
                ]
            }
        ]

```

@artf's suggestion:
```javascript
       import React from 'react';
        import ReactDOM from 'react-dom';
        import ReactComponent from 'some/react/component';

        const addComponent = (editor, component, opts = {}) => {
          const { id, name, tag, block } = opts;
          const type = `react-${id}`;

          editor.DomComponents.addType(type, {
            model: {
              defaults: {
                tagName: tag,
                // Traits should reflect React component props
                traits: [ ... ],
              }
            },
            view: {
              render() {
                const { model, el } = this;
                const reactEl = React.createElement(
                  ReactComponent,
                  model.getAttributes(),
                  // TODO return children components as react elements
                );
                ReactDOM.render(reactEl, el);
                return this;
              }
            }
          });

          block && editor.BlockManager.add(type, {
            label: name || tag,
            content: { type },
            ...block,
          });
        };
```
