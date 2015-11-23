
// shortening survey values to current schema
function surveyValues(subtestData) {

  var surveyValueMap = {
    checked   : "C",
    unchecked : "U",
    skipped   : "S",
    missing   : "M"
  };

  var obj = subtestData.data;
  for (var key in obj) {
    var question = obj[key];
    for (var qKey in question) {
      var qVal = question[qKey];
      question[qKey] = surveyValueMap[qVal];
    }
  }

  return subtestData;

}

module.exports = surveyValues;