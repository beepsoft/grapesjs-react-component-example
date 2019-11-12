/**
 * Block appearing in the block section of grapesjs. Can be dragged onto the canvas to generate a Timer.
 */

import {
    cardRef
} from './consts';

export default function (editor, opt = {}) {
    const c = opt;
    const bm = editor.BlockManager;
    

    // These are the styles that can be used both in the components and in the live view. See component.js onRender().
    // These styles will also appear in the template's css.
    // NOTE: only styles that have '.timer' in them will be put into the template's css.
    const style = c.defaultStyle ? `<style>
    .card {
      text-align: center;
      font-family: Helvetica, serif;
    }
  </style>` : '';

    bm.remove(cardRef);
    // if (c.blocks.indexOf(timerRef) >= 0) {
    bm.add(cardRef, {
        label: 'Credit Card 2020',
        category: c.blockLabel,
        attributes: {class: 'fa fa-clock-o'},
        content: `
        <div class="card" data-gjs-type="${cardRef}"></div>
        ${style}
      `
    });
    // }
}
