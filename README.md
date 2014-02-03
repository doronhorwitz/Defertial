Defertial
=========
By [Doron Horwitz](http://milktek.com/ "milktek.com")

Description
-----------
Use jQuery's deferreds in a sequential way.

Deferreds, which use the promise pattern, are useful for delaying tasks to be executed after a certain process has been completed. For example, processing the data returned from an AJAX call. Sometimes there is a need to do a series of delayed tasks one after another; each being executed only after the previous one has completed. For example, an animation, in which an on-screen element moves, then grows and then changes colour. Or a purchasing sequence in which the client has to go through stages of payment authorisation using confirmation data from previous stages to proceed to the next stages.

Whilst jQuery's Deferreds offer the `.then()` method, for multiple sequential stages it results in very confusing code. This is where Defertial steps in. It provides very simple sematics for queueing up a series of functions to be executed one after another, only once the previous function is resolved or rejected. Individual functions can be queued up or a single function can be looped over, which each iteration of the loop waits for the deferred of the previous loop to be resolved or rejected.

Basic Example
-------------
```javascript
function delayedFunc1(arg1, arg2) {

    // ... do work

    /**
     * 'this' contains useful things for interacting with Defertial, but
     * it will be overridden in the ajax callback, so we back it up
     */
    var _this = this;

    $.ajax('/url1.html').done(function(data){

        // ... do more work

        _this.deferred.resolve(data)
    });
}

function delayedFunc2(arg3, arg4) {

    // ... do work

    var _this = this;

    $.ajax('/url2.html').done(function(data){

        // ... do more work

        _this.deferred.resolve(data)
    });
}

$(function(){
    var defertial = $.Defertial();

    /**
     * The first param is the function, the remaining are the values passed
     * into the function
     */
    defertial.add(delayedFunc1, 'val1', 'val2');
    defertial.add(delayedFunc2, 'val3', 'val3');

    /**
     * 1. run() returns a deferred
     * 2. In the function attached to the final deferred, "finalDefertialInfo"
     *    contains the data usually available to a delayed function in the
     *    "this" variable.
     */
    defertial.run().done(function(finalDefertialInfo){
        // ... do work after entire sequence is complete
    });
});
```

Looped example
-------------
```javascript
$(function(){
    var defertial = $.Defertial();

    //Define the array to be looped over
    var array = ['val1', 'val2', 'val3'];

    //loop over the array
    defertial.loop(array, function(index, value){
            // ... do work using the current value in the array being iterated over

            var _this = this;

            $.ajax('/url.html').done(function(data){

                // ... do more work

                //resolve the deferred to move on to the next item in the array
                _this.deferred.resolve(data)
            });
        }).done(function(finalDefertialInfo){
                // ... do work after iteration is complete
            });
});
```

Installation
------------
Requires jQuery (minimum version 1.5, since Defertial uses jQuery's Deferreds).

Include the Defertial Javascript after jQuery:
```html
<script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
<script src="jquery.Defertial.js" type="text/javascript"></script>
```

Usage
-----
The script makes the `$.Defertial()` constructor available. Similar to `$.Deferred()` it can be initialised as
```javascript
var defertialObj = $.Defertial();
```
or
```javascript
var defertialObj = new $.Defertial();
```

The new Defertial object can now have delayed functions added to it and then eventually can be run.

**Adding a function (passing in values as well):**
```javascript
function delayedFunction(arg1, arg2) {
    // ... do work and then resolve this.deferred
}

defertialObj.add(delayedFunction, 'pass in value', 'another pass in value');
```

**Running the Defertial and attaching a function to be called when the sequence is complete:**
```javascript
defertialObj.run().done(function(finalDefertialInfo){
    // ... do work after sequence is complete
})
```

**Running a loop over an array using the Defertial object:**
```javascript
defertialObj.loop(array, loopedDelayedFunction).done(function(finalDefertialInfo){
    // ... do work after iteration is complete
})
```

Every delayed function that is added to the Defertial queue (or the looped function) has the following available to it in
the `this` context variable (and also within `finalDefertialInfo`).
* **this.deferred**
    * type: Deferred
    * description: every delayed function must use the deferred contained in this parameter to indicate
    the end of the current delayed function by calling `.resolve()` or `.reject()` on it.
* **this.isPreviousRejected**
    * type: boolean
    * description: from within the delayed function it is possible to either `.resolve()` or `.reject()`
    the deferred made available to the function. If it is rejected, then this parameter is set to `true`.
    This parameter can be used, for example, if a step in an authorisation handshake fails and the logic of
    the handshake needs to abort and show an error to the user.
* **this.isGlobalRejected**
    * type: boolean
    * description: it is possible to run Defertial in a mode which specifies that the whole Defertial will seize
    if any added delayed function is rejected (see the `failAllOnReject` argument for `.run()`). In this case,
    `finalDefertialInfo` will have this parameter set as `true`.
* **this.previousArgs**
    * type: array
    * description: this will contain an array of values sent through the `.resolve()` or `.reject()` within
    the previous delayed function.
* **this.previousReturnVal**
    * type: mixed
    * description: delayed functions can return values. If a delayed function returns a value, it will be made available
    to the next delayed function in this parameter.
* **isInDefertialQueue:**
    * type: boolean
    * description: this will always be `true` and is just a means to allow a delayed function to check if it is being run
    within a Defertial queue, effectively allowing for duck-typing `this`. See below for the use of the
    `$.Defertial.isInDefertialQueue()` function.

A Defertial instance's `.run()` method takes 2 arguments:

* **failAllOnReject**
    * type: boolean
    * required: no
    * default: false
    * description: if this argument is set to `true`, then if any delayed function in the queue rejects its deferred then
    the entire queue will seize, calling any attached `.fail()` methods. Also, the `isGlobalRejected` context parameter will be
    `true`.
* **initialArguments**
    * type: array
    * required: no
    * default: empty array
    * description: the arguments which will appear in the `this.previousArgs` of the first delayed function.

A Defertial instance's `.loop()` method takes 4 arguments:

* **array**
    * type: array
    * required: yes
    * description: the array to be iterated over
* **func**
    * type: function
    * required: yes
    * description: the delayed function which will be called for all items in the array
* **failAllOnReject** and **initialArguments**: these two parameters have the same meaning as in the `.run()` method.

The Defertial module also has a utility function:
```javascript
$.Defertial.isInDefertialQueue(_this)
```
The function returns a boolean indicating if the current delayed function is running in a Defertial queue.
It takes the following argument:
* **_this**
    * type: any
    * required: yes
    * description: the current context variable, `this`, should be passed in here to determine if it is a Defertial context.

Defertial can be used to loop over a jQuery as well:
```javascript
$(...).defertialEach(func)
```
The callback function is similar to the loop in the normal jQuery `.each()` method, but the `this` is the Defertial context and function must resolve or reject the deferred in the `this` to move on to the next iteration. `.defertialEach()` takes the following arguments:
* **func**
    * type: function
    * required: yes
    * description: the delayed function which will be called for all items in the jQuery
* **failAllOnReject** and **initialArguments**: these two parameters have the same meaning as in the `.run()` method.

License
-------
*Defertial is covered by the BSD New License*

Copyright (c) 2014, Doron Horwitz
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* The name of Doron Horwitz may not be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
