#!/usr/bin/perl

# This is to check if the express plugin is installed and in case it's not
# it will print an error with the hint that the unifi_presence plugin requires
# the express plugin.

require LoxBerry::Web;
use LoxBerry::System;
use CGI;

if (LoxBerry::System::plugindata("express")) {
    my $q = CGI->new;
    print $q->header(-status => 307, -location => 'express/');
    exit(0);
}

my $template = HTML::Template->new(
    filename => "$lbptemplatedir/error.html",
    global_vars => 1,
    loop_context_vars => 1,
    die_on_bad_params => 0,
);
%L = LoxBerry::System::readlanguage($template, "language.ini");
LoxBerry::Web::lbheader("Unifi Presence", "", "");
print $template->output();
LoxBerry::Web::lbfooter();

