#!/usr/bin/env python
import cgitb ; cgitb.enable()
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

#Set HDF File Name here
filename = str(sys.argv[1]) #'CAL_LID_L1-ValStage1-V3-01.2007-06-12T03-42-18ZN.hdf'
m = re.search('CAL_LID_L1-ValStage1-V3-30.(.+?)T', filename)
if m:
    date = m.group(1)
name = 'Total_Attenuated_Backscatter_532'
label = 'Total Attenuated Backscatter 532nm (km$^{-1}$ sr$^{-1}$)'
colormap = '/usr/local/share/ccplot/cmap/calipso-backscatter.cmap'


if __name__ == '__main__':
    with HDF(filename) as product:
	x1 = -1
	h1 = 0  # km
	h2 = 30  # km
	nz = 600  

	x2 = 0 

	i = -1
	if not os.path.exists('./metadata.json'):
		f = open('metadata.json','w')
	else:
		f = open('metadata.json','a')
	f.write('[\n')
	f.close()
	comma = ","

	if not os.path.exists('./'+date):
    		os.makedirs('./'+date)

	if not os.path.exists('./'+date+'/1/'):
    		os.makedirs('./'+date+'/1/')
		path = './'+date+'/1/'
	elif not os.path.exists('./'+date+'/2/'):
		os.makedirs('./'+date+'/2/')
		path = './'+date+'/2/'	

	while (x2 != len(product['Profile_UTC_Time'][::]) - 1):

		if product['Day_Night_Flag'][0][0] == 1:
			orbitType = 'Day-Time'
		else:
			orbitType = 'Night-Time'

		w = 12
		h = 6

		i = i + 1
		x1 = x2 + 1
		x2 = x2 + 10000
		if x2 >= len(product['Profile_UTC_Time'][::]):
			x2 = len(product['Profile_UTC_Time'][::]) - 1
			w = 3
			h = 6
			comma = ""
		
		# Import datasets.
		time = product['Profile_UTC_Time'][x1:x2, 0]
		height = product['metadata']['Lidar_Data_Altitudes']
		dataset = product[name][x1:x2]

		def my_range(start, end, step):
	    		while start <= end:
				yield start
				start += step

		latLon = []
		for index in my_range(x1, x2, 1000):
	   		latLon.append(float(product['Longitude'][index][0]))
			latLon.append(float(product['Latitude'][index][0]))


			

		sections = []
		outputFile = path+str(i)+'.png'
		section = {                   
		  'start_time': str(product['Profile_UTC_Time'][x1][0]),
		  'end_time': str(product['Profile_UTC_Time'][x2][0]),
		  'orbit': orbitType,
		  'img': outputFile,
		  'coordinates': latLon
		}

		out_file = open("metadata.json","a")
		json.dump(section,out_file, indent=4)
		out_file.write(comma)
		out_file.close()    
		#print """Generated meta-data.json<br>"""                              

		# Convert time to datetime.
		time = np.array([ccplot.utils.calipso_time2dt(t) for t in time])

		# Mask missing values.
		dataset = np.ma.masked_equal(dataset, -9999)

		# Interpolate data on a regular grid.
		X = np.arange(x1, x2, dtype=np.float32)
		Z, null = np.meshgrid(height, X)
		data = interp2d_12(
		    dataset[::],
		    X.astype(np.float32),
		    Z.astype(np.float32),
		    x1, x2, x2 - x1,
		    h2, h1, nz,
		)

		# Import colormap.
		cmap = ccplot.utils.cmap(colormap)
		cm = mpl.colors.ListedColormap(cmap['colors']/255.0)
		cm.set_under(cmap['under']/255.0)
		cm.set_over(cmap['over']/255.0)
		cm.set_bad(cmap['bad']/255.0)
		norm = mpl.colors.BoundaryNorm(cmap['bounds'], cm.N)

		# Plot figure.
		pylab.plot([1,2,3])
		fig = plt.figure(figsize=(w, h), dpi=100)

		im = plt.imshow(
		    data.T,
		    extent=(mpl.dates.date2num(time[0]), mpl.dates.date2num(time[-1]), h1, h2),
		    cmap=cm,
		    norm=norm,
		    aspect='auto',
		    interpolation='nearest',
	       	 )
	
		ax=fig.add_subplot(1,1,1)
		plt.axis('off')
		extent = ax.get_window_extent().transformed(fig.dpi_scale_trans.inverted())
		fig.savefig(outputFile, bbox_inches=extent, format='png')

		#print """Generated 1.png<br>"""

	f = open('metadata.json','a')
	f.write('\n]\n')
	f.close()
		
	

