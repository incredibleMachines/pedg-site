/**
 *
 *	Utility functions for general app
 *
 */
exports.makeSlug = function(title){
  title = title.replace(/[^\w\s]/gi,'')
  title = title.replace( / +/g, ' ' )

	return title.toLowerCase().replace(/ /g,'-');
}
exports.reverseSlug = function(title){
	return title.toLowerCase().replace(/-/g,' ');
}
exports.reverseAPISlug = function(title){
  return exports.capitalize(title.replace(/_/g,' '));
}
exports.captialize = function(string){
  return string.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
}
exports.toTitleCase = function(str){
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
