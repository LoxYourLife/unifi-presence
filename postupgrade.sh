#!/bin/bash
PLUGINNAME=REPLACELBPPLUGINDIR
PATH="/sbin:/bin:/usr/sbin:/usr/bin:$LBHOMEDIR/bin:$LBHOMEDIR/sbin"

ENVIRONMENT=$(cat /etc/environment)
export $ENVIRONMENT


npm --prefix $LBHOMEDIR/bin/plugins/${PLUGINNAME} restart
exit 0;