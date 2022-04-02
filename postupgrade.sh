#!/bin/sh

# To use important variables from command line use the following code:
COMMAND=$0    # Zero argument is shell command
PTEMPDIR=$1   # First argument is temp folder during install
PSHNAME=$2    # Second argument is Plugin-Name for scipts etc.
PDIR=$3       # Third argument is Plugin installation folder
PVERSION=$4   # Forth argument is Plugin version
#LBHOMEDIR=$5 # Comes from /etc/environment now. Fifth argument is
              # Base folder of LoxBerry
PTEMPPATH=$6  # Sixth argument is full temp path during install (see also $1)

# Combine them with /etc/environment
PHTMLAUTH=$LBHOMEDIR/webfrontend/htmlauth/plugins/$PDIR
PHTML=$LBPHTML/$PDIR
PTEMPL=$LBPTEMPL/$PDIR
PDATA=$LBPDATA/$PDIR
PLOGS=$LBPLOG/$PDIR # Note! This is stored on a Ramdisk now!
PCONFIG=$LBPCONFIG/$PDIR
PSBIN=$LBPSBIN/$PDIR
PBIN=$LBPBIN/$PDIR

echo "<INFO> Copy back existing backup"
cp -p -v -r $PTEMPL\_upgrade/config/$PDIR/* $PCONFIG 
cp -p -v -r $PTEMPL\_upgrade/data/$PDIR/* $PDATA

echo "<INFO> Remove temporary folders"
rm -r $PTEMPL\_upgrade

echo "<INFO> installing dependencies"
npm --prefix $PHTMLAUTH ci --only=production
npm --prefix $PBIN ci --only=production


echo "<INFO> Start Event App"
npm --prefix $PBIN start

echo "<INFO> Register Plugin at Express Server"
curl -X POST http://localhost:3000/system/express/plugin/unifi_presence

exit 0;