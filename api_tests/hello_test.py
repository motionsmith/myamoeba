import json, httplib


AUTH_HEADERS = {
    "X-Parse-Application-Id": "iLnBp9fs6Rt8bT4aFWZdiVShVs0fZuxhbpyh20UX",
    "X-Parse-REST-API-Key": "O0aoMOzkCjHAzmSeTHTv22n2gSonI69FTf8pjHr2"
}

connection = httplib.HTTPSConnection('api.parse.com', 443)
connection.connect()
connection.request('POST', '/1/functions/getAncestors', json.dumps({'nodeId':'bcNsUyLrh1'}),
 	{
       "X-Parse-Application-Id": "iLnBp9fs6Rt8bT4aFWZdiVShVs0fZuxhbpyh20UX",
       "X-Parse-REST-API-Key": "O0aoMOzkCjHAzmSeTHTv22n2gSonI69FTf8pjHr2",
       "Content-Type": "application/json"
     })
result = json.loads(connection.getresponse().read())
print json.dumps(result, indent=2)