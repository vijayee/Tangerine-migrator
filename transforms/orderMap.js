// for results
// standardizes orderMap
function orderMap(doc) {
  var om = doc.order_map || doc.orderMap;
  delete doc.order_map;
  if (om === undefined) {
    om = doc.subtestData.map(function(d,i){return i;});
  }
  doc.orderMap = om;
  return doc;
}

module.exports = orderMap;
