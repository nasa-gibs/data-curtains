#!/usr/bin/env python
import cgitb
#print "Content-type: text/html\n\n"
#print
#print """Script started!<br><br>"""
import sys
import numpy as np
import matplotlib as mpl
mpl.use('Agg')
import matplotlib.pyplot as plt
import pylab
from ccplot.hdf import HDF
from ccplot.algorithms import interp2d_12
import ccplot.utils
import json
import re
import os

# Enable for debugging
# cgitb.enable()



filename = str(sys.argv[1])

m = re.search('CAL_LID_L1-ValStage1-V3-30.(.+?)T([0-9\-]+)', filename)
if m:
	date = m.group(1)

if not os.path.exists('meta-data'):
    os.makedirs('meta-data')
metadata_dir = os.path.join(os.path.dirname(__file__), "meta-data")
metadata_file = os.path.join(metadata_dir, date+'.json')

f = open(metadata_file, 'w')
f.write('[\n{\"date\": \"'+date+'\",\n\"curtains\": [\n')
f.close()



for x in range(1,len(sys.argv)):

	
	filename = str(sys.argv[x])

	m = re.search('CAL_LID_L1-ValStage1-V3-30.(.+?)T([0-9\-]+)', filename)
	if m:
	    date = m.group(1)
	    time = m.group(2)
	img_dir = os.path.join(os.path.dirname(__file__),"images")



	if __name__ == '__main__':
	    with HDF(filename) as product:

		if product['Day_Night_Flag'][0][0] == 0:
			orbitType = 'Daytime'
		else:
			orbitType = 'Nighttime'

		comma = ','

		f = open(metadata_file, 'a')
		f.write('{\n\"orbit\":\"'+orbitType+'\",\n\"sections\":[')
		f.close()

		x1 = -1


		x2 = 0
		i = -1

		granule_dir = os.path.join(img_dir, date, time)
		if not os.path.exists(granule_dir):
			os.makedirs(granule_dir)

		time = product['Profile_UTC_Time'][0:len(product['Profile_UTC_Time'][::]), 0]
		convertedTime = np.array([ccplot.utils.calipso_time2dt(t) for t in time])

		while (x2 != len(product['Profile_UTC_Time'][::]) - 1):

			i = i + 1
			x1 = x2 + 1
			x2 = x2 + 10000
			if x2 >= len(product['Profile_UTC_Time'][::]):
				x2 = len(product['Profile_UTC_Time'][::]) - 1
				w = 3
				h = 6
				comma = ""
			outputFile = os.path.join(granule_dir, str(i)+'.png')

			# Import datasets.


			height = product['metadata']['Lidar_Data_Altitudes']

			def my_range(start, end, step):
		    		while start <= end:
					yield start
					start += step

			latLon = []
			for index in my_range(x1, x2, 100):
		   		latLon.append(float(product['Longitude'][index][0]))
				latLon.append(float(product['Latitude'][index][0]))




			sections = []
			st = convertedTime[x1].strftime('%H:%M:%S')
			et = convertedTime[x2].strftime('%H:%M:%S')
			section = {
			  'start_time': str(st),
			  'end_time': str(et),
			  'img': outputFile,
			  'coordinates': latLon
			}

			out_file = open(metadata_file, "a")
			json.dump(section,out_file, indent=4)
			out_file.write(comma)
			out_file.close()
			

	f = open(metadata_file, 'a')
	f.write('\n]\n}')
	f.close()

	if x == len(sys.argv)-1:
		f = open(metadata_file, 'a')
		f.write('\n]')
		f.close()	
	else:
		f = open(metadata_file, 'a')
		f.write(',')
		f.close()			

f = open(metadata_file, 'a')
f.write('\n}\n]')
f.close()


