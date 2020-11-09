//this script runs before angular starts
/*
setting <base> element at this point is too late, so it must be changed manually when deployed
function setBase(s) {
	var ele_base = document.head.getElementsByTagName('base');
	if (!ele_base || !ele_base.length || ele_base.length == 0)
		return false;
	ele_base[0].setAttribute('href', s);
	return true;
}

if (window.appConfig && window.appConfig.base) {
	setBase(window.appConfig.base);
}
*/