#!/usr/bin/env python
import cgi
import cgitb; cgitb.enable()  # for troubleshooting
import requests

form = cgi.FieldStorage()
sel_date = form.getvalue('date')

payload = {'echo_collection_id[]': 'C7299610-LARC_ASDC', 'temporal[]': sel_date+'T00:00:00Z,'+sel_date+'T23:59:59Z'}
r = requests.get("https://api.echo.nasa.gov/catalog-rest/echo_catalog/granules.json", params=payload, verify=False)
metadata = r.json()['feed']['entry']

print "Content-type: text/html"

for index in range(0, len(metadata), 1):
	print
	print """<br>"""
	print "Entry Number: "+ str(index+1)
	print
	print """<br>"""
	print "Orbit: "+metadata[index]['day_night_flag']
	print
	print """<br>"""
	print "Start Time: "+ metadata[index]['time_start']
	print
	print """<br>"""
	print "End Time: "+ metadata[index]['time_end']
	print
	print """<br>"""
	for j in range(0, len(metadata[index]['lines']), 1):
		print
		print """<br>"""
	 	print "Coordinates: "+metadata[index]['lines'][j]
	print
	print """<br><br>"""

