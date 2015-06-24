#!/usr/bin/env python

import numpy as np
import matplotlib as mpl
import matplotlib.pyplot as plt
from ccplot.hdf import HDF
from ccplot.algorithms import interp2d_12
import ccplot.utils
import json

#Set HDF File Name here
filename = 'CAL_LID_L1-ValStage1-V3-01.2007-06-12T03-42-18ZN.hdf'

name = 'Total_Attenuated_Backscatter_532'
label = 'Total Attenuated Backscatter 532nm (km$^{-1}$ sr$^{-1}$)'
colormap = '/usr/local/share/ccplot/cmap/calipso-backscatter.cmap'
x1 = 0
x2 = 1000
h1 = 0  # km
h2 = 20  # km
nz = 500  # Number of pixels in the vertical.

if __name__ == '__main__':
    with HDF(filename) as product:
        # Import datasets.
        time = product['Profile_UTC_Time'][x1:x2, 0]
        height = product['metadata']['Lidar_Data_Altitudes']
        dataset = product[name][x1:x2]

	def my_range(start, end, step):
    		while start <= end:
        		yield start
        		start += step

	latLon = []
	for index in my_range(0, len(product['Latitude'][::]) - 1, 5000):
   		latLon.append(float(product['Longitude'][index][0]))
		latLon.append(float(product['Latitude'][index][0]))

	if product['Day_Night_Flag'][0][0] == 1:
		orbitType = 'Day-Time'
	else:
		orbitType = 'Night-Time'

	outputFile = '1.png'

	section = {                   
	  'start_time': product['metadata']['Date_Time_at_Granule_Start'],
	  'end_time': product['metadata']['Date_Time_at_Granule_End'],
	  'orbit': orbitType,
	  'img': outputFile,
	  'coordinates': latLon
	}

	out_file = open("metadata.json","w")
	json.dump(section,out_file, indent=4)
	out_file.close()                                  

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
        fig = plt.figure(figsize=(12, 6))
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
	fig.savefig(outputFile, bbox_inches=extent)

