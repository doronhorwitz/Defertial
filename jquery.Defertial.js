/*!
 * Defertial v0.1.0
 * Doron Horwitz
 * https://github.com/doronhorwitz/Defertial
 * Date: 2013-04-05
 *
 * Copyright 2013 Doron Horwitz
 * Released under the BSD New License
 * https://raw.github.com/doronhorwitz/Defertial/master/LICENSE
 *
 */

;(function(window, $, undefined) {
    "use strict";

    var VERSION = "0.1.0";

    function createThisObj(isPreviousRejected, isGlobalRejected, previousArgs, deferred, previousReturnVal) {
        return {
            isPreviousRejected: isPreviousRejected,
            isGlobalRejected:   isGlobalRejected,
            previousArgs:       previousArgs,
            deferred:           deferred,
            previousReturnVal:  previousReturnVal
        };
    }

    function attachHandlersToDeferred(currentDeferred, nextDeferred, finalDeferred, funcObj, previousReturnValContainObj, failAllOnReject) {
        currentDeferred.done(function(){
                var thisObj = createThisObj(false,false, $.makeArray(arguments), nextDeferred, previousReturnValContainObj.previousReturnVal);
                if (funcObj === null) {
                    finalDeferred.resolve(thisObj);
                } else {
                    previousReturnValContainObj.previousReturnVal = funcObj.func.apply(thisObj,funcObj.args);
                }
            }).fail(function(){
                if (failAllOnReject) {
                    var thisObj = createThisObj(true,true,$.makeArray(arguments), nextDeferred, previousReturnValContainObj.previousReturnVal);
                    finalDeferred.reject(thisObj);
                } else {
                    var thisObj = createThisObj(true,false,$.makeArray(arguments), nextDeferred, previousReturnValContainObj.previousReturnVal);
                    if (funcObj === null) {
                        finalDeferred.reject(thisObj);
                    } else {
                        previousReturnValContainObj.previousReturnVal = funcObj.func.apply(thisObj,funcObj.args);
                    }
                }
            });
    }

    $.extend({
        Defertial: function Defertial() {
            var deferredFuncList = [];

            var defertial = {
                add: function add(func) {

                    var funcArgs = $.makeArray(arguments).slice(1);

                    if ($.isFunction(func)) {
                        deferredFuncList.push({
                            func: func,
                            args: funcArgs
                        });
                    }

                    return this;
                },
                run: function run(failAllOnReject, initialArguments) {
                    if ($.type(failAllOnReject) !== "boolean") {
                        failAllOnReject = false;
                    }

                    if (arguments.length < 2) {
                        initialArguments = [];
                    } else if (!$.isArray(initialArguments)) {
                        initialArguments = [initialArguments];
                    }

                    var firstDeferred     = $.Deferred(),
                        currentDeferred   = firstDeferred.resolve.apply(firstDeferred,initialArguments),
                        finalDeferred     = $.Deferred(),
                        previousReturnValContainObj = {
                            previousReturnVal: null
                        };

                    $.each(deferredFuncList,function(indexInArray,valueOfElement){
                        var nextDeferred = $.Deferred();
                        attachHandlersToDeferred(currentDeferred, nextDeferred, finalDeferred, valueOfElement, previousReturnValContainObj, failAllOnReject);
                        currentDeferred = nextDeferred;
                    });

                    attachHandlersToDeferred(currentDeferred, null, finalDeferred, null, previousReturnValContainObj, failAllOnReject);

                    return finalDeferred;
                }
            };

            return defertial;
        }
    });

    $.Defertial.version = VERSION;
}(window, jQuery));
