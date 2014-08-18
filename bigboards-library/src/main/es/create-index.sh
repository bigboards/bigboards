#!/bin/sh
curl -XDELETE http://localhost:9200/bigboards
curl -XPUT http://localhost:9200/bigboards -H "Content-Type: application/json" -d @library-index.json
#curl -s -XPOST http://localhost:9200/bigboards/_bulk -H "Content-Type: application/json" --data-binary @library.json
