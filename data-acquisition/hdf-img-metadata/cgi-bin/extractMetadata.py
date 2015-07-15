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

#Set HDF File Name here
filename = str(sys.argv[1]) 
m = re.search('CAL_LID_L1-ValStage1-V3-30.(.+?)T([0-9\-]+)', filename)
if m:
    date = m.group(1)
    time = m.group(2)
img_dir = os.path.join(os.path.dirname(__file__),"images")
output_dir = os.path.join(os.path.dirname(__file__))
metadata_file = os.path.join(output_dir, 'metadata.json')

if __name__ == '__main__':
    with HDF(filename) as product:
	x1 = -1


	x2 = 0
	i = -1

	granule_dir = os.path.join(img_dir, date, time)
	if not os.path.exists(granule_dir):
		os.makedirs(granule_dir)

	if not os.path.exists(os.path.join(metadata_file)):
		f = open(metadata_file, 'w')
	else:
		f = open(metadata_file, 'a')
	f.write('[\n')
	f.close()
	comma = ","

	while (x2 != len(product['Profile_UTC_Time'][::]) - 1):

		if product['Day_Night_Flag'][0][0] == 1:
			orbitType = 'Day-Time'
		else:
			orbitType = 'Night-Time'

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
		time = product['Profile_UTC_Time'][x1:x2, 0]
		height = product['metadata']['Lidar_Data_Altitudes']

		def my_range(start, end, step):
	    		while start <= end:
				yield start
				start += step

		latLon = []
		for index in my_range(x1, x2, 1000):
	   		latLon.append(float(product['Longitude'][index][0]))
			latLon.append(float(product['Latitude'][index][0]))




		sections = []
		section = {
		  'start_time': str(product['Profile_UTC_Time'][x1][0]),
		  'end_time': str(product['Profile_UTC_Time'][x2][0]),
		  'orbit': orbitType,
		  'img': outputFile,
		  'coordinates': latLon
		}

		out_file = open(metadata_file, "a")
		json.dump(section,out_file, indent=4)
		out_file.write(comma)
		out_file.close()
	

	f = open(metadata_file, 'a')
	f.write('\n]\n')
	f.close()



