import glob, os

#Set directory here
dir = '.'

def inplace_change(filename, old_string, new_string):
        s=open(filename).read()
        if old_string in s:
                print 'Swapped Day and Night in  "{filename}"'.format(**locals())
                s=s.replace(old_string, new_string)
                f=open(filename, 'w')
                f.write(s)
                f.flush()
                f.close()

os.chdir(dir)

for file in glob.glob("*.json"):
	inplace_change(file, "Day-Time", "Something")
	inplace_change(file, "Night-Time", "Day-Time")
	inplace_change(file, "Something", "Night-Time")


