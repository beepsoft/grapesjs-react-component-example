/**
 * Adds loadHtmltemplate command
 */
import {loadHtmltemplate} from "./consts";

export default (editor, config) => {
  const cm = editor.Commands;

  cm.add(loadHtmltemplate, e => {
      config.setHtmlString(e.getHtml())
      config.setCssString(e.getCss())
  });
}
