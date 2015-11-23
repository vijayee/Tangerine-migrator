// for results with student ids
// changes property name "participant_id" to participantId
function participantId(subtestData) {
  var id = subtestData.participant_id;
  delete subtestData.participant_id;
  subtestData.participantId = id;
}


function participantIdUndo(subtestData) {
  var id = subtestData.participantId;
  delete subtestData.participantId;
  subtestData.participant_id = id;
}

module.exports = participantId;
