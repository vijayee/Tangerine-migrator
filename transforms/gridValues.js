
// shortening grid values to current schema
var gridValues = function(subtestData) {

    var arr = subtestData.data.items;

    var gridValueMap = {
      correct   : "C",
      incorrect : "I",
      missing   : "M",
      skipped   : "S"
    };

    arr.forEach(function(el, i) {
      arr[i].v = gridValueMap[arr[i].v];
    });

    return subtestData;

};

module.exports = gridValues;