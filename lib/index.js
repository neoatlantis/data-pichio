/*
 * $: All-in-one Toolkit and Initialization
 * ========================================
 *
 * by requiring this file, following tasks are achieved:
 *
 *  1. A tree beginning with `$` is initialized. This helps our program to
 *     quickly call the functions.
 *  2. Configurations are read. If there are any errors in configurations,
 *     they should be checked out and printed as error messages before ending
 *     the program.
 */

///////////////////////// STEP 1: PATCH JAVASCRIPT ///////////////////////////

require('./javascript.js');

///////////////////////// STEP 2: INTEGRATE MODULES //////////////////////////

$ = {};

$.node = require('./node.js');
$.error = require('./error.js');

$.tools = require('./tools');
$.crypto = require('./crypto');
$.controller = require('./controller.js');

///////////////////// STEP 3: ENVIRONMENT INITIALIZATION /////////////////////

$.config = JSON.parse(
    $.node.fs.readFileSync($.tools.resolve('conf', 'pichio.json'))
);
