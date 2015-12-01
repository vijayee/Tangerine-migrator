var _ = require('underscore');
var sequenceId=function (doc, docs, opts){
    if(!opts || !opts.sequence || !opts.mapping )
        return doc;
    for (var property in doc) {
        if(String(property).indexOf('id') != -1) {
            if(opts.mapping[doc[property]]){
                doc[property] = opts.mapping[doc[property]];
            }
            else{
                if(doc[property]== "id") {
                    opts.mapping[doc[property]] = String(doc["collection"]).charAt(0) + opts.sequence.next();
                    doc[property] = opts.mapping[doc[property]];
                }
                else{
                    var query= doc[property];
                    var result= _.find(docs,function(doc){
                        return doc["id"]== query;
                    });
                    opts.mapping[doc[property]] = String(result["collection"]).charAt(0) + opts.sequence.next();
                    doc[property] = opts.mapping[doc[property]];
                }
            }
        }
    }
    return doc;
};
var sequenceTransform= function(docs, opts){
    var documents =documents;
    var options= opts;
    docs.forEach( function(doc, dI) {
        documents[dI] =  sequenceId(docs, documents, options)
    },this);
}
module.exports= sequenceId;


