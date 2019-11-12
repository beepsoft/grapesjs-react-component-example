
This is a forked repository of the below.

# 🤔Why?🤔
A regular question regarding [GrapesJS](https://grapesjs.com/) - the wonderful HTML layout editor written in Javascript - 
is how to integrate it with React components:

https://github.com/artf/grapesjs/issues/1970

As no solution has been provided for this so far I started a little experiment to have React components work in GrapesJS.

# 🐒What?🐒
Although _"integrating with React"_ could mean many things here's the use case I tried to solve:
- Have a GrapesJS [block](https://grapesjs.com/docs/modules/Blocks.html), which when dragged onto the [canvas](https://grapesjs.com/docs/api/canvas.html) uses a React component to display the content in the canvas.
- Have the same [component](https://grapesjs.com/docs/modules/Components.html#how-components-work) generate JSX code of 
itself in the final template.
- Have a way to get the GrapesJS generated JSX/CSS as text and make it live again by loading the JSX/CSS text into a React 
components

My concrete plan was to implement something like 
[grapesjs-component-countdown](https://github.com/artf/grapesjs-component-countdown) but using the 
[react-compound-timer](https://www.npmjs.com/package/react-compound-timer) and by making it look uglier. 💩


# 🚀How?🚀

## 🍇 A GrapesJS plugin, block, component (and trait, button, command)
																																													
To display a React component in the canvas I needed a [plugin](src/timer/index.js),
which provides a GrapesJS [component](src/timer/components.jsx). This component implements `ComponentsView`'s 
`onRender` function. This is practically needs to be something like:

```
onRender({el}) {
   let someValue = "This will be passed in a prop";

   ReactDOM.render(
      <div>
        <SomeReactComponent someProp={someValue}/>
      <div>
      , el);
}	
```

## 🔍 A custom HTML parser

To have the same JSX generated into the GrapesJS template is a bit tricky because GrapesJS is a HTML5 editor and 
uses the browser's DOM to parse whatever is added to its component model. A component can be added to the model either
as an object (a [Component Definition](https://grapesjs.com/docs/modules/Components.html#how-components-work)) or HTML. 
HTML is the natural way, however because it is handled as HTML5 all tag and attribute names will be
converted to lowercase, so if we have this:

```
onRender({el}) {
   let someValue = "This will be passed in a prop";

   const comps = this.model.get('components');
   comps.reset();
   comps.add(`<div>
                <SomeReactComponent someProp="${someValue}"/>
              <div>`);

   ReactDOM.render(
      <div>
        <SomeReactComponent someProp={someValue}/>
      <div>
      , el);
}	
```

The [`editor.getHtml()`](https://grapesjs.com/docs/api/editor.html#gethtml) will return something like:
```
<div id="i0g38s">
    <div>
        <somereactcomponent someprop="This will be passed in a prop"/>
    <div>
</div>
```

This is not a JSX that could be compiled to have a working version of `SomeReactComponent` because React's JSX is case 
sensitive and React components must start with an [uppercase character](https://reactjs.org/docs/jsx-in-depth.html).

When `comps.add(...)` is called GrapesJS checks whether the parameter is a string or an object. If it is an object,
than it is expected to have the Component Definition format. If it is a string then GrapesJS uses an HTML parser 
([`ParserHtml.js`](https://github.com/artf/grapesjs/blob/dev/src/parser/model/ParserHtml.js)) to convert the HTML string into the Component Definition format. This, as mentioned above, uses the
browser's own DOM and hence everything gets lowercased.

To work around it I had to define my own [HTML parser](src/timer/ParserHtmlCaseSensitive.js) and replace the built in one 
with that. (_As there seems to be no public API to provide a custom HTML parser the replacement of the built-in parser
is a bit hackish, see [src/timer/index.js](src/timer/index.js). Anyway, it works._) This implementation uses
[node-html-parser](https://www.npmjs.com/package/node-html-parser) and is based on the original `ParserHtml.js`, so it more or less
works the same way but keeps the case of tags and attributes.

Now with this HTML parser the final template will look like this:

```
<div id="i0g38s">
    <div>
        <SomeReactComponent someProp="This will be passed in a prop"/>
    <div>
</div>
```

much better. However, there are still some problems.

The actual `onRender` of my Timer component looks like this:

```
onRender({el}) {
    // Calc initialTime. If startFrom is set in the trait, then calculate, otherwise leave it 0
    let initialTime = 0;

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
    comps.add(`<span className="timer-label">${this.model.attributes.timerLabel}</span>`);
    const compString =
        `<Timer
                `+(direction=="backward" ? `initialTime="${initialTime}"` : "")+`
                direction="${direction}"
                formatValue={formatValue}
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
            </Timer>`;
    comps.add(compString);

    ReactDOM.render(
        <>
            {this.model.attributes.timerLabel != ""
                ?
                    <span className="timer-label">{this.model.attributes.timerLabel}: </span>
                : ""}
            <Timer
                initialTime={initialTime}
                direction={direction}
                formatValue={(value) => `${(value < 10 ? `0${value}` : value)}`}
            >
            <span className="timer-days">
                <Timer.Days/>{this.model.attributes.displayLabels ? " "+this.model.attributes.labels.labelDays+" " : ', '}
            </span>
            <span className="timer-hours">
                <Timer.Hours/>{this.model.attributes.displayLabels ? " "+this.model.attributes.labels.labelHours+" " : ':'}
            </span>
                <span className="timer-minutes">
                <Timer.Minutes/>{this.model.attributes.displayLabels ? " "+this.model.attributes.labels.labelMinutes+" " : ':'}
            </span>
                <span className="timer-seconds">
                <Timer.Seconds/>{this.model.attributes.displayLabels ? " "+this.model.attributes.labels.labelSeconds : ''}
            </span>
            </Timer>
        </>
        , el);
},
```

(_Note: my Timer component also has support for some [Traits](https://grapesjs.com/docs/modules/Traits.html#add-traits-to-components). 
The `this.model.attributes` values come from there. One can set in the GrapesJS settings panel for a Timer a Start date (`startFrom`) 
in which case the Timer will count down to that date, have a Label (`timerLabel`) for the timer and a Display labels 
checkbox (`displayLabels`) to switch between displaying labels for day, hours, etc. or just display ':'. 
These settings were added to prove myself that the resulting JSX component can be configured from GrapesJS._)

The JSX I want to use in the component definition has JSX expressions associate with props:

```
        `<Timer
                ...
                formatValue={formatValue}
            >
```

This, again is not valid HTML, so `ParserHtmlCaseSensitive.js` takes care of these expressions and puts quotes around 
them. All in all the final template for the Timer component looks like this:

```
<div class="timer">
  <span className="timer-label">Timer</span>
  <Timer direction="forward" formatValue="{formatValue}">
    <span className="timer-days"><Timer.Days>
      </Timer.Days>, 
    </span>
    <span className="timer-hours"><Timer.Hours>
      </Timer.Hours>:
    </span>
    <span className="timer-minutes"><Timer.Minutes>
      </Timer.Minutes>:
    </span>
    <span className="timer-seconds"><Timer.Seconds>
      </Timer.Seconds></span>
  </Timer>
</div>
```

## 🖥️ A way to display the JSX template as an actual React component

So now we have a block, which can be dragged onto the canvas, it displays our component and can generate a JSX of 
itself (well, actually it can be any JSX one adds using `comps.add()`). Now we need a way to load this template, which is
provided by [`editor.getHtml()`](https://grapesjs.com/docs/api/editor.html#gethtml) and 
[`editor.getCss()`](https://grapesjs.com/docs/api/editor.html#getcss) as a string and make it work as an actual 
React component.

For this I implemented [TemplateDisplay](src/templateDisplay/index.tsx). It uses two cool React packages:
- [react-jsx-parser](https://www.npmjs.com/package/react-jsx-parser): it is a React component which can parse JSX and 
output rendered React Components. The thing with JSX is that it is not actually HTML and cannot be used right away 
in the browser's DOM, but needs to be compiled to React components (usually done by webpack), which are then used by 
the React engine to do all the magic with virtual DOM. `react-jsx-parser` allows compilation of JSX on-the-fly for any
string passed to it.
- [react-style-tag](https://www.npmjs.com/package/react-style-tag): allows adding any CSS to React like this: 
`<Style>{cssString}</Style>`. So, this is practically does the same for CSS as `react-jsx-parser` for JSX: makes the
CSS available to React provided as a string.

In the app whenever you press the bell icon the template (which can also be viewed by pressing the </> button) will be
passed to `TemplateDisplay` and will display the same content that has been edited in the editor.

### 🛠️ Some adjustment to the JSX before passing to TemplateDisplay

As described earlier JSX expressions in attributes are surrounded by quotes to make them look like actual HTML
attributes. For `react-jsx-parser` to actually use those expressions these quotes have to be removed first. 
So, before actually passing the JSX to TemplateDisplay in [commands.js](src/timer/commands.js) we call  
`unquoteJsxExpresionsInAttributes()` on the template. This will result in an actual JSX with expressions and all.

One more thing needs to noted. When the Timer's React component is generated the Timer is configured like this:

```
<Timer
   initialTime={initialTime}
   direction={direction}
   formatValue={(value) => `${(value < 10 ? `0${value}` : value)}`}
>
```

however in the component definition JSX we have

```
<Timer
   ...
   formatValue={formatValue}
>
```

The reason for this is that `react-jsx-parser` doesn't allow function expression in the JSX:
>The component does not support inline function declarations, such as:
> 
> ```
> onClick={function (event) { /* do stuff */ }}, or
> onKeyPress={event => { /* do stuff */}}
> ```
> This is to prevent inadvertent XSS attack vectors.

To work around this `TemplateDisplay` provides a `formatValue` binding function, which implements the same logic, 
and this now can be called from the JSX template component:

```
<JsxParser components={{Timer}} jsx={jsxString} bindings={
    {
        // This is called from the formatValue attribute of the Timer coming in htmlString
        formatValue: (value) => `${(value < 10 ? `0${value}` : value)}`
    }
}/>
``` 

## 🏃‍♀️ ️Running the example

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). To run it:

```
yarn i
```
```
yarn start
```

Drag some components, including the Timer from the Timer block, configure the Timer if you like and then press the bell 
icon to pass the template generated by the editor to be displayed below the editor. 
