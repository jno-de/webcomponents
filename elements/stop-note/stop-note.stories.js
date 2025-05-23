import { html } from "lit-html";
import { withKnobs, text, boolean } from "@open-wc/demoing-storybook";
import { StorybookUtilities } from "@haxtheweb/storybook-utilities/storybook-utilities.js";
import { StopNote as sbClass } from "./stop-note.js";
// need to account for polymer goofiness when webpack rolls this up

export default {
  title: `Education|Stop note`,
  component: sbClass.tag,
  decorators: [withKnobs],
  parameters: {
    options: { selectedPanel: "storybookjs/knobs/panel" },
  },
};
const utils = new StorybookUtilities();
export const StopNoteStory = () => {
  return utils.makeUsageDocs(
    sbClass,
    import.meta.url,
    utils.makeElementFromHaxDemo(sbClass),
  );
};
