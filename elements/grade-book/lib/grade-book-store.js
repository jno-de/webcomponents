import { LitElement } from "lit";
import { observable, makeObservable, configure, computed, toJS } from "mobx";
configure({ enforceActions: false }); // strict mode off

class GradeBookStoreClass extends LitElement {
  static get tag() {
    return "grade-book-store";
  }
  constructor() {
    super();
    this.gradeScale = [];
    this.activeRubric = [];
    // internal data structure of the "app". This is bridging all data from the
    // backend sheets and then informing how our application works
    this.database = {
      tags: {
        categories: [],
        data: [],
      },
      submissions: [],
      rubrics: [],
      assignments: [],
      roster: [],
      grades: {},
      gradesDetails: {},
      gradeScale: [],
      settings: {},
    };
    this.activeStudent = 0;
    this.activeAssignment = 0;
    makeObservable(this, {
      gradeScale: observable,
      activeStudent: observable,
      activeRubric: observable,
      activeAssignment: observable,
      database: observable,
      activeSubmission: computed,
    });
  }

  get activeSubmission() {
    const db = toJS(this.database);
    const activeStudent = toJS(this.activeStudent);
    const activeAssignment = toJS(this.activeAssignment);
    for (var i in this.database.submissions) {
      let row = this.database.submissions[i];
      // look for student AND that the assignment column name is there
      if (
        row.student === db.roster[activeStudent].student &&
        row[db.assignments[activeAssignment].shortName]
      ) {
        return row[db.assignments[activeAssignment].shortName];
      }
    }
    return null;
  }
}
globalThis.customElements.define(GradeBookStoreClass.tag, GradeBookStoreClass);
export { GradeBookStoreClass };
globalThis.GradeBookStore = globalThis.GradeBookStore || {};
globalThis.GradeBookStore.requestAvailability = function () {
  if (!globalThis.GradeBookStore.instance) {
    globalThis.GradeBookStore.instance =
      globalThis.document.createElement("grade-book-store");
    globalThis.document.body.appendChild(globalThis.GradeBookStore.instance);
  }
  return globalThis.GradeBookStore.instance;
};
// export the singleton so everyone can directly reference it
export const GradeBookStore = globalThis.GradeBookStore.requestAvailability();
