/**
 * Copyright 2021
 * @license Apache-2.0, see License.md for full text.
 */
// register globally so we can make sure there is only one
globalThis.PouchDb = globalThis.PouchDb || {};
// request if this exists. This helps invoke the element existing in the dom
// as well as that there is only one of them. That way we can ensure everything
// is rendered through the same pouch-db element, making it a singleton.
globalThis.PouchDb.requestAvailability = () => {
  // if there is no single instance, generate one and append it to end of the document
  if (!globalThis.PouchDb.instance) {
    globalThis.PouchDb.instance = globalThis.document.createElement("pouch-db");
    globalThis.document.body.appendChild(globalThis.PouchDb.instance);
  }
  return globalThis.PouchDb.instance;
};

export const PouchDBElement = globalThis.PouchDb.requestAvailability();

/**
 * `pouch-db`
 * `read and write localized data elements`
 * @polymer
 * @demo demo/index.html
 * @element pouch-db
 */
class PouchDb extends HTMLElement {
  constructor() {
    super();
    this.windowControllers = new AbortController();
    this.type = "xapi";
    import("./lib/pouchdb.min.js").then(() => {
      this.db = new PouchDB(this.type);
    });
  }
  /**
   * Store the tag name to make it easier to obtain directly.
   * @notice function name must be here for tooling to operate correctly
   */
  static get tag() {
    return "pouch-db";
  }
  /**
   * life cycle, element is afixed to the DOM
   */
  connectedCallback() {
    globalThis.addEventListener(
      "user-engagement",
      this.userEngagmentFunction.bind(this),
      { signal: this.windowControllers.signal },
    );

    globalThis.addEventListener(
      "pouch-db-get-data",
      this.getDataFunction.bind(this),
      { signal: this.windowControllers.signal },
    );
  }

  /**
   * life cycle, element is removed from the DOM
   */
  disconnectedCallback() {
    this.windowControllers.abort();
  }

  userEngagmentFunction(e) {
    var eventData = e.detail;
    var whatEvent = e.target.tagName;

    switch (whatEvent) {
      case "MULTIPLE-CHOICE":
        var dbType = "xapistatements";
        var activityDisplay = eventData.activityDisplay;
        var activityId = "http://adlnet.gov/expapi/verbs/" + activityDisplay; //this may need to be changed in the future for more verbs
        var objectId = "http://haxcms.psu.edu/haxQuiz";
        var objectName = eventData.objectName;
        var objectDescription = "HAX Quiz";
        //hard-coded for now for results, future tracking change to pull data from eventData.x
        var resultScoreScaled = 1;
        var resultScoreMin = 0;
        var resultScoreMax = 100;
        var resultScoreRaw = 100;
        var resultSuccess = eventData.resultSuccess;
        var resultCompletion = true;
        var resultResponse = "sample";
        var resultDuration = "sample";
        //hard-coded for now for results, future tracking change to pull data from eventData.x
        break;
      default:
        break;
    }

    var remoteCouch = false;
    ///var remoteCouch = 'http://35.164.8.64:3000/todos';

    //these need to be updated to pull from global
    var userEmail = "mailto:dave@gmail.com";
    var userName = "Dave Fusco";

    var objectStatement = {
      actor: {
        mbox: userEmail,
        name: userName,
        objectType: "Agent",
      },
      verb: {
        id: activityId,
        display: {
          "en-US": activityDisplay,
        },
      },
      object: {
        id: objectId,
        definition: {
          name: {
            "en-US": objectName,
          },
          description: {
            "en-US": objectDescription,
          },
        },
        objectType: "Activity",
      },
      result: {
        score: {
          scaled: resultScoreScaled,
          min: resultScoreMin,
          max: resultScoreMax,
          raw: resultScoreRaw,
        },
        success: resultSuccess,
        completion: resultCompletion,
        response: resultResponse,
        duration: resultDuration,
      },
    };

    var xapistatement = {
      _id: new Date().toISOString(),
      title: JSON.stringify(objectStatement),
      completed: false,
    };
    console.log(xapistatement);

    this.db.put(xapistatement, function callback(err, result) {
      if (!err) {
        console.log("Successfully posted a statement!");
      }
    });

    if (remoteCouch) {
      var opts = { live: true };
      this.db.replicate.to(remoteCouch, opts, syncError);
      this.db.replicate.from(remoteCouch, opts, syncError);
    }

    //display for testing only - move to own elements
    this.db.allDocs(
      { include_docs: true, descending: true },
      function (err, doc) {
        console.log(doc.rows);
      },
    );
    //display for testing only - move to own elements
  }

  getDataFunction(e) {
    var eventData = e.detail;
    var whatEvent = e.target.tagName;
    switch (eventData.queryRequest) {
      case "all-quizzes":
        var dbType = "xapistatements"; //this needs to be changed to be more dynamic in the future
        break;
      case "single-quiz":
        var dbType = "xapistatements"; //this needs to be changed to be more dynamic in the future
        var objectName = eventData.objectName; //"Quiz2"
        break;
      case "future-query":
        var dbType = "xapistatements";
        var activityDisplay = eventData.activityDisplay;
        var objectName = eventData.objectName;
        var resultSuccess = eventData.resultSuccess;
        var resultCompletion = eventData.resultCompletion;
        break;
      default:
        var dbType = "xapistatements";
        break;
    }

    var remoteCouch = false;
    ///var remoteCouch = 'http://35.164.8.64:3000/todos';

    //ADD SINGLE-QUIZ QUERY

    function processxAPI(statements, callback) {
      var arrayxAPI = [];
      statements.forEach(function (statement) {
        var out = JSON.parse(statement.doc.title);
        //var jsonStatement = out.verb.display['en-US'];  //verb
        var jsonStatement = out.object.definition.name["en-US"]; //all quizzes; quiz name
        arrayxAPI.push(jsonStatement);
      });
      callback(arrayxAPI);
    }

    function processItems(statements, callback) {
      var map = {};
      statements.forEach(function (statement) {
        map[statement] = (map[statement] || 0) + 1;
      });
      callback(map);
    }

    this.db.allDocs(
      { include_docs: true, descending: true },
      function (err, doc) {
        processxAPI(
          doc.rows,
          function displayxAPI(mapxAPI) {
            processItems(
              mapxAPI,
              function display(backMap) {
                var labelsArray = [];
                var resultsArray = [];

                for (let key of Object.keys(backMap)) {
                  labelsArray.push(key);
                }

                for (let value of Object.values(backMap)) {
                  resultsArray.push(value);
                }

                let queryData = [""];
                queryData = {
                  labels: labelsArray,
                  series: [resultsArray],
                  //activityDisplay: eventData.resultCompletion,    //FUTURE
                  //objectName: eventData.objectName,               //FUTURE
                  //resultSuccess: eventData.resultSuccess          //FUTURE
                  //resultCompletion: eventData.resultCompletion    //FUTURE
                };

                globalThis.dispatchEvent(
                  new CustomEvent("pouch-db-show-data", {
                    bubbles: true,
                    composed: true,
                    cancelable: false,
                    detail: queryData,
                  }),
                );
              },
              // end of display function
            );
            //end of processItems
          },
          // end of displayxAPI function
        );
        //end of processxAPI
      },
    );
    //end of this.db.allDocs
  }
  // end of getDataFunction
}
globalThis.customElements.define(PouchDb.tag, PouchDb);
export { PouchDb };
