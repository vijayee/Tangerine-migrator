# Migrations

This is an attempt to standardize some of the fragmentation in our internal CouchDB "soft schemas" that have occurred via code conventions being separated by time and deployments.

The iteration in index.js is based on CouchDB's `startkey` property using `_all_docs` which is preferred for performance over `skip`.