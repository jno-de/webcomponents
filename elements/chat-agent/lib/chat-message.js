/**
 * Copyright 2024 The Pennsylvania State University
 * @license Apache-2.0, see License.md for full text.
 */
import { DDD } from "@haxtheweb/d-d-d/d-d-d.js";
import "@haxtheweb/type-writer/type-writer.js";
import { css, html } from "lit";
import { autorun, toJS } from "mobx";
import { ChatStore } from "./chat-agent-store.js";

class ChatMessage extends DDD {
  static get tag() {
    return "chat-message";
  }

  constructor() {
    super();

    this.darkMode = null;
    this.editMode = null;
    this.hasSuggestedPrompts = false; // may be removed by by checking the length of this.suggestedPrompts
    this.hat = "none";
    this.isSentPrompt = false;
    this.message = "";
    this.messageWasSuggestedPrompt = false;
    this.suggestedPrompts = ChatStore.currentSuggestions; // needs to remain this way that way it doesn't update.

    autorun(() => {
      this.darkMode = toJS(ChatStore.darkMode);
    });

    autorun(() => {
      this.editMode = toJS(ChatStore.editMode);
    });
  }

  static get styles() {
    return [
      super.styles,
      css`
        /* https://haxtheweb.org/documentation/ddd */

        :host {
          container-type: inline-size;
          display: block;
        }

        .chat-message-wrapper {
          border-bottom-style: dashed;
          border-bottom: var(--ddd-border-md);
          padding: var(--ddd-spacing-2) var(--ddd-spacing-3);
        }

        .sent-chat-message,
        .message {
          align-items: center;
          display: flex;
          flex-direction: row;
          gap: var(--ddd-spacing-3);
        }

        .received-chat-message {
          display: flex;
          flex-direction: column;
        }

        .author-icon {
          align-items: center;
          background-color: var(--ddd-theme-default-white);
          border-radius: var(--ddd-radius-circle);
          border: var(--ddd-border-md);
          border-color: var(--ddd-theme-default-coalyGray);
          display: flex;
          height: var(--ddd-spacing-18);
          justify-content: center;
          width: var(--ddd-spacing-18);
        }

        :host([dark-mode]) .author-icon {
          border-color: var(--ddd-theme-default-slateGray);
        }

        .received-chat-message .author-icon {
          border-radius: var(--ddd-radius-xl);
        }

        simple-icon-lite {
          color: var(--data-theme-primary, var(--ddd-primary-13));
          --simple-icon-height: var(--ddd-icon-md);
          --simple-icon-width: var(--ddd-icon-md);
        }

        rpg-character {
          height: var(--ddd-spacing-12);
          margin-bottom: var(--ddd-spacing-3);
          width: var(--ddd-spacing-12);
        }

        .message-content {
          border-radius: var(--ddd-radius-sm);
          border: var(--ddd-border-md);
          border-color: var(--ddd-theme-default-coalyGray);
          color: var(--ddd-theme-default-coalyGray);
          font: var(--ddd-font-primary);
          font-size: var(--ddd-font-size-4xs);
          margin: var(--ddd-spacing-0);
          padding: var(--ddd-spacing-2);
          width: 80%;
        }

        :host([dark-mode]) .message-content {
          border-color: var(--ddd-theme-default-slateGray);
          color: var(--ddd-theme-default-white);
          background-color: var(--ddd-theme-default-coalyGray);
        }

        .suggested-prompts {
          display: flex;
          flex-direction: column;
          gap: var(--ddd-spacing-2);
          justify-content: center;
          padding-top: var(--ddd-spacing-3);
        }

        @container (max-width: 190px) {
          .author-icon {
            display: none;
          }

          .received-chat-message .message-content {
            background: rgba(73, 29, 112, 0.1);
          }

          .message {
            align-items: center;
            display: flex;
            justify-content: center;
          }
        }
      `,
    ];
  }

  /**
   * @description Render chat message
   */
  render() {
    return html`
      <div class="chat-message-wrapper">
        ${this.isSentPrompt
          ? this.renderSentMessage()
          : this.renderReceivedMessage()}
      </div>
    `;
  }

  /**
   * @description Renders a message recevied from Merlin-AI
   */
  renderReceivedMessage() {
    return html`
      <div class="received-chat-message">
        <div class="message">
          <div class="author-icon">
            <simple-icon-lite icon="hax:wizard-hat"></simple-icon-lite>
          </div>
          <type-writer
            class="message-content"
            text="${this.message}"
            speed="${ChatStore.merlinTypeWriterSpeed}"
          ></type-writer>
        </div>
        <div class="suggested-prompts">
          ${this.suggestedPrompts.map(
            (suggestedPrompt) => html`
              <chat-suggestion
                suggestion="${suggestedPrompt.suggestion}"
                prompt-type="${suggestedPrompt.type}"
                @click=${this.disableSuggestions}
                @keypress=${this.disableSuggestions}
              ></chat-suggestion>
            `,
          )}
        </div>
      </div>
    `;
  }

  /**
   * @description Renders a message sent by the end user
   */
  renderSentMessage() {
    return html`
      <div class="sent-chat-message">
        <p class="message-content">${this.message}</p>
        <div class="author-icon">
          <rpg-character
            seed="${ChatStore.userName}"
            hat="${this.hat}"
          ></rpg-character>
        </div>
      </div>
    `;
  }

  firstUpdated() {
    this.pickHat();
  }

  /**
   * @description Picks a hat for the user's <rpg-character> based on certain dates or if editMode enabled
   */
  pickHat() {
    if (ChatStore.month === 2 && ChatStore.day === 12) {
      this.hat = "party";
    } else if (ChatStore.month === 6 && ChatStore.day === 6) {
      // Closest I could get for a consistent "cowboy" day. If you get the pop-culture reference then that's awesome
      this.hat = "cowboy";
    } else if (ChatStore.month === 7 && ChatStore.day === 27) {
      // Birthday of a famous cartoon "wabbit"
      this.hat = "bunny";
    } else if (ChatStore.month === 8 && ChatStore.day === 15) {
      // International Watermelon Day
      this.hat = "watermelon";
    } else if (ChatStore.month === 9 && ChatStore.day === 19) {
      // International Talk Like a Pirate Day
      this.hat = "pirate";
    } else if (ChatStore.month === 10 && ChatStore.day === 1) {
      // International Coffee Day
      this.hat = "coffee";
    } else if (ChatStore.month === 10 && ChatStore.day === 5) {
      // International Teacher Day
      this.hat = "education";
    } else if (ChatStore.month === 12 && ChatStore.day === 5) {
      // Day of the Ninja
      this.hat = "ninja";
    } else if (ChatStore.month === 12 && ChatStore.day === 18) {
      // Fellowship of the Ring founded
      this.hat = "knight";
    } else {
      this.hat = "none";
    }

    if (this.editMode) this.hat = "construction";

    this.requestUpdate();
  }

  /**
   * @description Disables the suggestions after one is clicked
   * @param {Event} e - click
   */
  disableSuggestions(e) {
    const SUGGESTIONS = this.shadowRoot.querySelectorAll("chat-suggestion");

    ChatStore.devStatement("Disabling previous suggestions.", "info");

    SUGGESTIONS.forEach((suggestion) => {
      if (!suggestion.hasAttribute("disabled")) {
        suggestion.setAttribute("disabled", "");
      }
    });

    if (!e.currentTarget.hasAttribute("chosen-prompt")) {
      let existingChosenPrompt = false;
      SUGGESTIONS.forEach((suggestion) => {
        if (suggestion.hasAttribute("chosen-prompt")) {
          existingChosenPrompt = true;
        }
      });

      if (!existingChosenPrompt) {
        e.currentTarget.setAttribute("chosen-prompt", "");
      }
    }
  }

  static get properties() {
    return {
      ...super.properties,
      darkMode: {
        type: Boolean,
        attribute: "dark-mode",
        reflect: true,
      },
      editMode: {
        type: Boolean,
        attribute: "edit-mode",
        reflect: true,
      },
      hasSuggestedPrompts: {
        type: Boolean,
        attribute: "suggested-prompts",
      },
      hat: {
        type: String,
        attribute: "hat",
      },
      isSentPrompt: {
        type: Boolean,
        attribute: "sent-prompt",
      },
      message: {
        type: String,
        attribute: "message",
      },
      messageWasSuggestedPrompt: {
        type: Boolean,
        attribute: "suggested-message",
      },
      suggestedPrompts: {
        type: Array,
      },
    };
  }
}

globalThis.customElements.define(ChatMessage.tag, ChatMessage);
export { ChatMessage };
