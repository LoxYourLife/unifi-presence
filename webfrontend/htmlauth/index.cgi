#!/usr/bin/perl

use LoxBerry::System;
use CGI;

my $cfgfile = "$lbpconfigdir/unifi.json";

my $cgi = CGI->new;
my $q = $cgi->Vars;

my %pids;

my $template;

if( $q->{ajax} ) {
} else {
    require LoxBerry::Web;
	
	## Normal request (not ajax)
	
	# Init template
	
	$template = HTML::Template->new(
		filename => "$lbptemplatedir/settings.html",
		global_vars => 1,
		loop_context_vars => 1,
		die_on_bad_params => 0,
	);

    my $cfgfilecontent = LoxBerry::System::read_file($cfgfile);
	$cfgfilecontent = jsescape($cfgfilecontent);
	$template->param('JSONCONFIG', $cfgfilecontent);

    if( !$q->{form} or $q->{form} eq "settings" ) {
		$navbar{10}{active} = 1;
		$template->param("FORM_SETTINGS", 1);
		settings_form(); 
	}
}

print_form();

exit;

######################################################################
# Print Form
######################################################################
sub print_form
{
	my $plugintitle = "UniFi Presence" . LoxBerry::System::pluginversion();
	my $helplink = "https://www.loxwiki.eu/x/S4ZYAg";
	my $helptemplate = "help.html";
	
	our %navbar;
	$navbar{10}{Name} = "Settings";
	$navbar{10}{URL} = 'index.cgi';
 
 	$navbar{20}{Name} = "Clients";
	$navbar{20}{URL} = 'index.cgi?form=clients';
 
	$navbar{30}{Name} = "Logs";
	$navbar{30}{URL} = 'index.cgi?form=logs';
		
	LoxBerry::Web::lbheader($plugintitle, $helplink, $helptemplate);

	print $template->output();

	LoxBerry::Web::lbfooter();
}


########################################################################
# Settings Form 
########################################################################
sub settings_form
{

	#my $mslist_select_html = LoxBerry::Web::mslist_select_html( FORMID => 'Main.msno', LABEL => 'Receiving Miniserver', DATA_MINI => "0" );
	#$template->param('mslist_select_html', $mslist_select_html);

}