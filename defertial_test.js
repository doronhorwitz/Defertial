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
	});
});