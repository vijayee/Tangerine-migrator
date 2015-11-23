
// shortening grid keys
var gridKeys = function(subtestData) {
  var arr = subtestData.data.items;
  arr.forEach(function(el, i){
    arr[i].v = el.itemResult;
    arr[i].l = el.itemLabel;
    delete arr[i].itemResult;
    delete arr[i].itemLabel;
  });
  return subtestData;
};


var gridKeysUndo = function(subtestData) {
  var arr = subtestData.data.items;
  arr.forEach(function(el, i){
    arr[i].itemResult = el.v;
    arr[i].itemLabel  = el.l;
    delete arr[i].v;
    delete arr[i].l;
  });
  return subtestData;
};

module.exports = gridKeys;