// for results
// changes tangerine_version to tangerineVersion
function version(doc) {
  var v = doc.tangerine_version;
  delete doc.tangerine_version;
  doc.tangerineVersion = v;
  return doc;
}

module.exports = version;