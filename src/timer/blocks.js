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
    // NOTE: only styles that have '.timer' in them will be put into the template's css.
    const style = c.defaultStyle ? `<style>
    .timer {
      text-align: center;
      font-family: Helvetica, serif;
    }
    .timer .timer-block {
      display: inline-block;
      margin: 0 10px;
      padding: 10px;
    }

    .timer .timer-days {
      font-size: 3rem;
    }
    
    .timer .timer-hours {
      font-size: 3rem;
    }
    
    .timer .timer-minutes {
      font-size: 3rem;
    }
    
    .timer .timer-seconds {
      font-size: 3rem;
    }

    .timer .timer-cont {
      display: inline-block;
    }
        
    span.timer-label {
      font-size: 3rem;
      padding-right: 10px;
    }
  </style>` : '';

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
