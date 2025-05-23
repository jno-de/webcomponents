import { LitElement, html, css } from "lit";
import { SchemaBehaviors } from "@haxtheweb/schema-behaviors/schema-behaviors.js";
import { OERSchema } from "@haxtheweb/oer-schema/lib/oerschema.js";
/**
 * `oer-schema`
 * `A LRN element to wrap an oer schema prefix onto materials.`
 * @demo demo/index.html
 * @element oer-schema
 */
class OerSchemaElement extends SchemaBehaviors(LitElement) {
  /**
   * LitElement constructable styles enhancement
   */
  static get styles() {
    return [
      css`
        :host {
          display: inline-block;
        }
      `,
    ];
  }
  render() {
    return html`
      <span property="oer:${this.oerProperty}">
        <slot></slot> ${this.text}
      </span>
    `;
  }
  static get tag() {
    return "oer-schema";
  }
  constructor() {
    super();
    this.text = "";
    this.oerProperty = "name";
    this.typeof = "Resource";
  }
  updated(changedProperties) {
    if (super.updated) {
      super.updated(changedProperties);
    }
    changedProperties.forEach((oldValue, propName) => {
      if (propName == "relatedResource") {
        this._OERLink = this._generateforComponentLink(this.relatedResource);
      }
    });
  }
  static get properties() {
    return {
      ...super.properties,
      /**
       * Text to wire into the middle of the element.
       * This is easier to manage then slotted data though
       * this supports both methods.
       */
      text: {
        type: String,
      },
      /**
       * Property value for this oer resource
       */
      oerProperty: {
        type: String,
        attribute: "oer-property",
      },
      /**
       * Property value for this oer resource
       */
      typeof: {
        type: String,
      },
      /**
       * Related Resource ID
       */
      relatedResource: {
        type: String,
        attribute: "related-resource",
      },
    };
  }
  static get haxProperties() {
    let oerSchema = new OERSchema();
    return {
      canScale: false,

      canEditSource: true,
      gizmo: {
        title: "Schema",
        description: "Schematized element area",
        icon: "hax:oerschema",
        color: "blue",
        tags: [
          "Other",
          "developer",
          "Instructional",
          "pedagogical",
          "SEO",
          "Search engine",
        ],
        handles: [],
        meta: {
          author: "HAXTheWeb core team",
          inlineOnly: true,
        },
      },
      settings: {
        configure: [
          {
            slot: "",
            title: "Text",
            inputMethod: "textfield",
            icon: "editor:title",
          },
          {
            property: "typeof",
            title: "Schema typeof",
            inputMethod: "select",
            allowNull: true,
            options: oerSchema.types,
          },
          {
            property: "oerProperty",
            title: "Schema property",
            description: "The OER Schema property this represents",
            inputMethod: "select",
            allowNull: true,
            options: {
              name: "name",
              additionalType: "additionalType",
              description: "description",
              image: "image",
              mainEntityOfPage: "mainEntityOfPage",
              sameAs: "sameAs",
              uri: "uri",
            },
          },
          {
            property: "relatedResource",
            title: "Related resource",
            description: "A reference to the related Schema resource",
            inputMethod: "textfield",
            icon: "editor:title",
          },
        ],
        advanced: [],
      },
      saveOptions: {
        unsetAttributes: ["_oerlink"],
      },
    };
  }
  _generateforComponentLink(source) {
    if (globalThis.document && globalThis.document.head) {
      // remove existing if this is moving around
      if (this._OERLink) {
        globalThis.document.head.removeChild(this._OERLink);
      }
      let link = globalThis.document.createElement("link");
      link.setAttribute("property", "oer:forComponent");
      link.setAttribute("content", this.relatedResource);
      globalThis.document.head.appendChild(link);
      return link;
    }
  }
}
globalThis.customElements.define(OerSchemaElement.tag, OerSchemaElement);
export { OerSchemaElement };
