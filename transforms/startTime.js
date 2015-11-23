// for results documents
// turn start_time and starttime to startTime
function startTime(doc) {
  var time = doc.starttime || doc.start_time;
  delete doc["start_time"];
  delete doc["starttime"];
  doc.startTime = time;
  return doc;
}

module.exports = startTime;
