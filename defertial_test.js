function def1(arg1, arg2, arg3) {
    var _this = this;
    setTimeout(function(){
        console.log('***************');
        console.log('calling def1');
        console.log('in defertial queue:', $.Defertial.isInDefertialQueue(_this));
        console.log(_this);
        console.log(arg1,arg2,arg3);
        console.log('***************');

        _this.deferred.reject('resolve1','resolve2','resolve3');

    },2000);

    return 'def1 return';
}

function def2(arg4, arg5, arg6) {
    var _this = this;
    setTimeout(function(){
        console.log('***************');
        console.log('calling def2');
        console.log('in defertial queue:', $.Defertial.isInDefertialQueue(_this));
        console.log(_this);
        console.log(arg4,arg5,arg6);
        console.log('***************');
        _this.deferred.resolve('resolve4','resolve5','resolve6');

    },2000);

    return 'def2 return';
}

function loopedDef(index, value) {
    console.log("index "+index+": "+value);
    var _this = this;
    setTimeout(function() {
        _this.deferred.resolve();
    }, 2000);
}

$(function(){
    var defertial = $.Defertial();
    defertial.add(def1,'myarg1','myarg2','myarg3');
    defertial.add(def2,'myarg4','myarg5','myarg6');
    defertial.run(false).done(function(finalDefertialInfo){
        console.log('***************');
        console.log('all complete');
        console.log(finalDefertialInfo);
        console.log('***************');
    }).fail(function(finalDefertialInfo){
        console.log('***************');
        console.log('all failed');
        console.log(finalDefertialInfo);
        console.log('***************');
    }).always(function(){
        var loopedDefertial = $.Defertial();
        defertial.loop(['loopedArg1', 'loopedArg2', 'loopedArg3'], loopedDef).always(function(){
            console.log('***************');
            $('head,body').defertialEach(function(index,Element){
                console.log($(Element));
                var _this = this;
                setTimeout(function(){
                    _this.deferred.resolve();
                },2000)
            });
        });
    });
});