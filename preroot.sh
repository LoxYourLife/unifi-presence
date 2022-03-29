#!/bin/bash

# Shell script which is executed *BEFORE* installation is started
# (*BEFORE* preinstall and *BEFORE* preupdate). Use with caution and remember,
# that all systems may be different!
#
# Exit code must be 0 if executed successfull.
# Exit code 1 gives a warning but continues installation.
# Exit code 2 cancels installation.
#
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# Will be executed as user "root".
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
#
# You can use all vars from /etc/environment in this script.
#
# We add 5 additional arguments when executing this script:
# command <TEMPFOLDER> <NAME> <FOLDER> <VERSION> <BASEFOLDER>
#
# For logging, print to STDOUT. You can use the following tags for showing
# different colorized information during plugin installation:
#
# <OK> This was ok!"
# <INFO> This is just for your information."
# <WARNING> This is a warning!"
# <ERROR> This is an error!"
# <FAIL> This is a fail!"

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

echo "<INFO> Checking for express Plugin"
REQUIRED_VERSION="0.0.1"
EXPRESS=$(perl -e "use LoxBerry::System;print !LoxBerry::System::plugindata("express") ? 1 : LoxBerry::System::pluginversion('express') ge '$REQUIRED_VERSION' ? 0 : 2;exit;")
if [ $EXPRESS = "1" ]
then
  echo "<ERROR> the plugin youre trying to install requires the Express plugin. Please install the plugin first. https://loxwiki.atlassian.net/wiki/spaces/LOXBERRY/pages/1673527328/Express+Server"
  exit 2;
elif [ $EXPRESS = "2" ]
then
  echo "<ERROR> the plugin youre trying to install requires the Express plugin with a version >= $REQUIRED_VERSION Please upgrade the Express plugin. https://loxwiki.atlassian.net/wiki/spaces/LOXBERRY/pages/1673527328/Express+Server"
  exit 2;
fi

# Your code goes here

exit 0