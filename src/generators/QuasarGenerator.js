import chalk from "chalk";
import BaseGenerator from "./BaseGenerator";
import handlebars from "handlebars";
import hbh_comparison from "handlebars-helpers/lib/comparison";
import hbh_array from "handlebars-helpers/lib/array";
import hbh_string from "handlebars-helpers/lib/string";

export default class extends BaseGenerator {
  constructor(params) {
    super(params);

    this.registerTemplates(`quasar/`, [
      // modules
      "store/modules/foo/index.js",
      "store/modules/foo/create/actions.js",
      "store/modules/foo/create/getters.js",
      "store/modules/foo/create/index.js",
      "store/modules/foo/create/mutation_types.js",
      "store/modules/foo/create/mutations.js",
      "store/modules/foo/create/state.js",
      "store/modules/foo/delete/actions.js",
      "store/modules/foo/delete/getters.js",
      "store/modules/foo/delete/index.js",
      "store/modules/foo/delete/mutation_types.js",
      "store/modules/foo/delete/mutations.js",
      "store/modules/foo/delete/state.js",
      "store/modules/foo/list/actions.js",
      "store/modules/foo/list/getters.js",
      "store/modules/foo/list/index.js",
      "store/modules/foo/list/mutation_types.js",
      "store/modules/foo/list/mutations.js",
      "store/modules/foo/list/state.js",
      "store/modules/foo/show/actions.js",
      "store/modules/foo/show/getters.js",
      "store/modules/foo/show/index.js",
      "store/modules/foo/show/mutation_types.js",
      "store/modules/foo/show/mutations.js",
      "store/modules/foo/show/state.js",
      "store/modules/foo/update/actions.js",
      "store/modules/foo/update/getters.js",
      "store/modules/foo/update/index.js",
      "store/modules/foo/update/mutation_types.js",
      "store/modules/foo/update/mutations.js",
      "store/modules/foo/update/state.js",

      // components
      "components/foo/Create.vue",
      "components/foo/Filter.vue",
      "components/foo/Form.vue",
      "components/foo/List.vue",
      "components/foo/Update.vue",
      "components/foo/Show.vue",
      "components/common/Breadcrumb.vue",

      // routes
      "router/foo.js",

      // error
      "error/SubmissionError.js",

      // utils
      "utils/fetch.js",
      "utils/dates.js",
      "utils/notify.js",

      // i18n
      "i18n/index.js"
    ]);

    handlebars.registerHelper("compare", hbh_comparison.compare);
    handlebars.registerHelper("ifEven", hbh_comparison.ifEven);
    handlebars.registerHelper("ifOdd", hbh_comparison.ifOdd);
    handlebars.registerHelper("inArray", hbh_array.inArray);
    handlebars.registerHelper("forEach", hbh_array.forEach);
    handlebars.registerHelper("downcase", hbh_string.downcase);

    this.registerSwitchHelper();
  }

  help(resource) {
    const titleLc = resource.title.toLowerCase();

    console.log(
      'Code for the "%s" resource type has been generated!',
      resource.title
    );
    console.log(
      "Paste the following definitions in your application configuration:"
    );
    console.log(
      chalk.green(`
//Add to quasar.conf
// 1. in 'framework.components'
  'QTable',
  'QTh',
  'QTr',
  'QTd',
  'QBreadcrumbs',
  'QBreadcrumbsEl',
  'QSpace',
  'QInput',
  'QForm',
  'QSelect',
  'QMarkupTable',
  'QDate',
  'QTime',
  'QCheckbox',
  'QPopupProxy',
  'QSpinner',
  'QInnerLoading',
  'QCard',
  'QCardSection',
  'QCardActions',
  'QExpansionItem',
  'QDialog',
  'QAvatar',

// 2. in 'framework.config', customize later
notify: {
  position: 'top',
  multiLine: true,
  timeout: 0,
},

// 3. in 'framework.directives
  'ClosePopup'

// 4. in 'framework.plugins
  'Notify'

//import routes
import ${titleLc}Routes from './router/${titleLc}';

// Add routes to VueRouter
const router = new VueRouter({
  // ...
  routes: [
      ...${titleLc}Routes,
  ]
});

// Add the modules in the store
import ${titleLc} from './store/modules/${titleLc}/';

export const store = new Vuex.Store({
  // ...
  modules: {
    ${titleLc}
  }
});
`)
    );
  }

  registerSwitchHelper() {
    /*
      https://github.com/wycats/handlebars.js/issues/927#issuecomment-318640459

      {{#switch state}}
        {{#case "page1" "page2"}}page 1 or 2{{/case}}
        {{#case "page3"}}page3{{/case}}
        {{#case "page4"}}page4{{/case}}
        {{#case "page5"}}
          {{#switch s}}
            {{#case "3"}}s = 3{{/case}}
            {{#case "2"}}s = 2{{/case}}
            {{#case "1"}}s = 1{{/case}}
            {{#default}}unknown{{/default}}
          {{/switch}}
        {{/case}}
        {{#default}}page0{{/default}}
      {{/switch}}
    */
    handlebars.__switch_stack__ = [];

    handlebars.registerHelper("switch", function(value, options) {
      handlebars.__switch_stack__.push({
        switch_match: false,
        switch_value: value
      });
      let html = options.fn(this);
      handlebars.__switch_stack__.pop();
      return html;
    });
    handlebars.registerHelper("case", function(value, options) {
      var args = Array.from(arguments);
      options = args.pop();
      var caseValues = args;
      var stack =
        handlebars.__switch_stack__[handlebars.__switch_stack__.length - 1];

      if (stack.switch_match || caseValues.indexOf(stack.switch_value) === -1) {
        return "";
      } else {
        stack.switch_match = true;
        return options.fn(this);
      }
    });
    handlebars.registerHelper("default", function(options) {
      var stack =
        handlebars.__switch_stack__[handlebars.__switch_stack__.length - 1];
      if (!stack.switch_match) {
        return options.fn(this);
      }
    });
  }

  generate(api, resource, dir) {
    return resource.getParameters().then(params => {
      params = params.map(param => ({
        ...param,
        ...this.getHtmlInputTypeFromField(param)
      }));
      params = this.cleanupParams(params);
      this.generateFiles(api, resource, dir, params);
    });
  }

  cleanupParams(params) {
    const stats = {};
    const result = [];

    params.forEach(p => {
      let key = p.variable.endsWith("[]")
        ? p.variable.slice(0, -2)
        : p.variable;
      if (!stats[key]) {
        stats[key] = 0;
      }
      stats[key] += 1;
    });

    params.forEach(p => {
      if (p.variable.endsWith("[exists]")) {
        return; // removed for the moment, it can help to add null option to select
      }
      if (!stats[p.variable] && p.variable.endsWith("[]")) {
        if (stats[p.variable.slice(0, -2)] === 1) {
          result.push(p);
        }
      } else {
        if (stats[p.variable] === 2) {
          p.multiple = true;
        }
        result.push(p);
      }
    });

    return result;
  }

  printObject(obj) {
    var cache = [];
    console.log(
      JSON.stringify(obj, function(key, value) {
        if (typeof value === "object" && value !== null) {
          if (cache.indexOf(value) !== -1) {
            // Duplicate reference found, discard key
            return;
          }
          // Store value in our collection
          cache.push(value);
        }
        return value;
      })
    );
    cache = null;
  }

  generateFiles(api, resource, dir, params) {
    const lc = resource.title.toLowerCase();
    const titleUcFirst =
      resource.title.charAt(0).toUpperCase() + resource.title.slice(1);

    const formFields = this.buildFields(resource.writableFields);

    const dateTypes = ["time", "date", "dateTime"];
    const formContainsDate = formFields.some(e => dateTypes.includes(e.type));

    const fields = this.buildFields(resource.readableFields);
    const listContainsDate = fields.some(e => dateTypes.includes(e.type));

    const parameters = [];
    params.forEach(p => {
      const param = fields.find(field => field.name === p.variable);
      if (!param) {
        parameters.push(p);
      } else {
        param.multiple = p.multiple;
        parameters.push(param);
      }
    });

    const paramsHaveRefs = parameters.some(
      e => e.type === "text" && e.reference
    );

    const labels = this.commonLabelTexts();

    const context = {
      title: resource.title,
      name: resource.name,
      lc,
      uc: resource.title.toUpperCase(),
      fields,
      dateTypes,
      listContainsDate,
      paramsHaveRefs,
      parameters,
      formFields,
      formContainsDate,
      hydraPrefix: this.hydraPrefix,
      titleUcFirst,
      labels
    };

    // Create directories
    // These directories may already exist
    for (let dir of [
      `${dir}/config`,
      `${dir}/error`,
      `${dir}/router`,
      `${dir}/utils`,
      `${dir}/i18n`,
      `${dir}/i18n/en-us`
    ]) {
      this.createDir(dir, false);
    }

    for (let dir of [
      `${dir}/store/modules/${lc}`,
      `${dir}/store/modules/${lc}/create`,
      `${dir}/store/modules/${lc}/delete`,
      `${dir}/store/modules/${lc}/list`,
      `${dir}/store/modules/${lc}/show`,
      `${dir}/store/modules/${lc}/update`,
      `${dir}/components/${lc}`,
      `${dir}/components/common`
    ]) {
      this.createDir(dir);
    }

    for (let common of ["components/common/Breadcrumb.vue"]) {
      this.createFile(common, `${dir}/${common}`, context, false);
    }

    for (let pattern of [
      // modules
      "store/modules/%s/index.js",
      "store/modules/%s/create/actions.js",
      "store/modules/%s/create/getters.js",
      "store/modules/%s/create/index.js",
      "store/modules/%s/create/mutation_types.js",
      "store/modules/%s/create/mutations.js",
      "store/modules/%s/create/state.js",
      "store/modules/%s/delete/actions.js",
      "store/modules/%s/delete/getters.js",
      "store/modules/%s/delete/index.js",
      "store/modules/%s/delete/mutation_types.js",
      "store/modules/%s/delete/mutations.js",
      "store/modules/%s/delete/state.js",
      "store/modules/%s/list/actions.js",
      "store/modules/%s/list/getters.js",
      "store/modules/%s/list/index.js",
      "store/modules/%s/list/mutation_types.js",
      "store/modules/%s/list/mutations.js",
      "store/modules/%s/list/state.js",
      "store/modules/%s/show/actions.js",
      "store/modules/%s/show/getters.js",
      "store/modules/%s/show/index.js",
      "store/modules/%s/show/mutation_types.js",
      "store/modules/%s/show/mutations.js",
      "store/modules/%s/show/state.js",
      "store/modules/%s/update/actions.js",
      "store/modules/%s/update/getters.js",
      "store/modules/%s/update/index.js",
      "store/modules/%s/update/mutation_types.js",
      "store/modules/%s/update/mutations.js",
      "store/modules/%s/update/state.js",

      // components
      "components/%s/Create.vue",
      "components/%s/Filter.vue",
      "components/%s/Form.vue",
      "components/%s/List.vue",
      "components/%s/Update.vue",
      "components/%s/Show.vue",

      // routes
      "router/%s.js"
    ]) {
      if (
        pattern === "components/%s/Filter.vue" &&
        !context.parameters.length
      ) {
        continue;
      }
      this.createFileFromPattern(pattern, dir, lc, context);
    }

    // error
    this.createFile(
      "error/SubmissionError.js",
      `${dir}/error/SubmissionError.js`,
      context,
      false
    );

    this.createEntrypoint(api.entrypoint, `${dir}/config/entrypoint.js`);
    this.createFile(
      "utils/fetch.js",
      `${dir}/utils/fetch.js`,
      { hydraPrefix: this.hydraPrefix },
      false
    );

    this.createFile("utils/dates.js", `${dir}/utils/dates.js`, {}, false);
    this.createFile("utils/notify.js", `${dir}/utils/notify.js`, {}, false);

    this.createFile(
      "i18n/index.js",
      `${dir}/i18n/en-us/index.js`,
      { labels: Object.values(labels) },
      false
    );

    const contextLabels = {
      labels: this.contextLabelTexts(formFields, fields)
    };
    this.createFile(
      "i18n/index.js",
      `${dir}/i18n/en-us/${lc}.js`,
      contextLabels,
      false
    );
  }

  contextLabelTexts(formFields, fields) {
    let texts = [];
    formFields.forEach(x => texts.push(x.name)); // forms
    fields.forEach(x => texts.push(x.name)); // for show, too
    return [...new Set(texts)];
  }

  commonLabelTexts() {
    return {
      submit: "Submit",
      reset: "Reset",
      delete: "Delete",
      confirmDelete: "Are you sure you want to delete this item?",
      noresults: "No results",
      close: "Close",
      updated: "Updated",
      field: "Field",
      value: "Value",
      filters: "Filters",
      filter: "Filter",
      unavail: "Data unavailable",
      loading: "Loading...",
      deleted: "Deleted",
      numValidation: "Please, insert a value bigger than zero!",
      stringValidation: "Please type something",
      required: "Field is required",
      recPerPage: "Records per page:"
    };

    // handlebars.registerPartial("myPartial", "{{name}}");
  }
}
