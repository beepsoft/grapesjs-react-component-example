/**
 * Block appearing in the block section of grapesjs. Can be dragged onto the canvas to generate a Timer.
 */

import {
    timerRef
} from './consts';

export default function (editor, opt = {}) {
    const c = opt;
    const bm = editor.BlockManager;

    // These are the styles that can be used both in the components and in the live view. See component.js onRender().
    // These styles will also appear in the template's css.
    const style = c.defaultStyle ? `<style>
    .timer{
      text-align: center;
      font-family: Helvetica, serif;
    }

    .timer-block {
      display: inline-block;
      margin: 0 10px;
      padding: 10px;
    }

    .timer-days,
    .timer-hours,
    .timer-minutes,
    .timer-seconds 
    {
      font-size: 3rem;
    }

    .timer-cont,
    .timer-block {
      display: inline-block;
    }
    
    span.timer-label {
      font-size: 3rem;
        padding-right: 10px;
    }
  </style>` : '';

    console.log("bm", bm);
    bm.remove(timerRef);
    // if (c.blocks.indexOf(timerRef) >= 0) {
    bm.add(timerRef, {
        label: c.blockLabel,
        category: c.blockLabel,
        attributes: {class: 'fa fa-clock-o'},
        content: `
        <div class="timer" data-gjs-type="${timerRef}"></div>
        ${style}
      `
    });
    // }
}
