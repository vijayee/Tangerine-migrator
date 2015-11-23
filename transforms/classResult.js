// puts class results into an array like everything else
var classResult = function(doc) {

    if (doc.subtestData && !doc.subtestData.forEach) {
      doc.subtestData = [doc.subtestData];
    }

    return doc;

};

module.exports = classResult;