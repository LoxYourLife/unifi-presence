#!/usr/bin/perl

use LoxBerry::System;
use LoxBerry::Log;
use LoxBerry::JSON;
use CGI;

my $cfgfile = "$lbpconfigdir/unifi.json";

my $cgi = CGI->new;
my $q = $cgi->Vars;

my %pids;

my $template;

if( $q->{ajax} ) {

	my %response;
	ajax_header();

	# Save Unifi Connection Settings
	if( $q->{ajax} eq "savesettings" ) {
		LOGINF "P$$ savesettings: savesettings was called.";
		$response{error} = &savemain();
		
		if(not defined $response{error}) {

			$version = `node $lbpbindir/index.js version`;
			$version =~ s/\015?\012?$//;
			$response{version} = $version;

			if ($version lt '6.4.54') {
				$response{error} = 'version';
			} else {
				LOGINF "Fetching client list";
				$jsonobj = LoxBerry::JSON->new();
				$clientsString = `node $lbpbindir/index.js clients`;
				$clients = $jsonobj->parse($clientsString);
				$response{clients} = $clients;

				system("npm --prefix $lbpbindir run restart > /dev/null 2>&1");
			}
		}
		print JSON->new->canonical(1)->encode(\%response);
	} 

	if($q->{ajax} eq "saveclients") {
		LOGINF "P$$ saveclients: savesettings was called.";
		$response{error} = &saveclients();
		system("npm --prefix $lbpbindir run restart > /dev/null 2>&1");
		print JSON->new->canonical(1)->encode(\%response);
	}

	exit;
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
	%L = LoxBerry::System::readlanguage($template, "language.ini");

    my $cfgfilecontent = LoxBerry::System::read_file($cfgfile);
	$cfgfilecontent = jsescape($cfgfilecontent);
	$template->param('JSONCONFIG', $cfgfilecontent);


	$version = `node $lbpbindir/index.js version`;
	$version =~ s/\015?\012?$//;
	$template->param('UNIFI_VERSION', $version);

	if ($version ge '6.4.54') {	
		$jsonobj = LoxBerry::JSON->new();
		$clients = `node $lbpbindir/index.js clients`;
		$template->param('CLIENTS', jsescape($clients));
	}

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
	my $plugintitle = "UniFi Presence " . LoxBerry::System::pluginversion();
	my $helplink = "https://www.loxwiki.eu/x/S4ZYAg";
	my $helptemplate = "help.html";
	
	our %navbar;
	$navbar{10}{Name} = "Settings";
	$navbar{10}{URL} = 'index.cgi';
 
 	#$navbar{20}{Name} = "Logs";
	#$navbar{20}{URL} = 'index.cgi?form=logs';
		
	LoxBerry::Web::lbheader($plugintitle, $helplink, $helptemplate);

	print $template->output();

	LoxBerry::Web::lbfooter();
}


########################################################################
# Settings Form 
########################################################################
sub settings_form
{

	my $mqttplugindata = LoxBerry::System::plugindata("mqttgateway");
	$template->param("MQTTGATEWAY_INSTALLED", 1) if ( $mqttplugindata );
	#my $mslist_select_html = LoxBerry::Web::mslist_select_html( FORMID => 'Main.msno', LABEL => 'Receiving Miniserver', DATA_MINI => "0" );
	#$template->param('mslist_select_html', $mslist_select_html);

}

#################################################################################
# Escape a json string for JavaScript code
#################################################################################
sub jsescape
{
	my ($stringToEscape) = shift;
		
	my $resultjs;
	
	if($stringToEscape) {
		my %translations = (
		"\r" => "\\r",
		"\n" => "\\n",
		"'"  => "\\'",
		"\\" => "\\\\",
		);
		my $meta_chars_class = join '', map quotemeta, keys %translations;
		my $meta_chars_re = qr/([$meta_chars_class])/;
		$stringToEscape =~ s/$meta_chars_re/$translations{$1}/g;
	}
	return $stringToEscape;
}

sub savemain
{
	my $errors;
	$jsonobj = LoxBerry::JSON->new();
	$cfg = $jsonobj->open(filename => $cfgfile);

	$cfg->{ipaddress} = $q->{ipaddress};
	$cfg->{username} = $q->{username};
	$cfg->{password} = $q->{password};
	$cfg->{topic} = $q->{topic};
	$cfg->{native} = $q->{native} eq "true" ? \1 : \0;
	$cfg->{port} = $q->{port} eq '' ? undef : 0 + $q->{port};
	$token = $q->{token};

	# Write
	$jsonobj->write();

	if ($token eq "") {
		$loginSuccessful = `node $lbpbindir/index.js login`;
	} else {
		$loginSuccessful = `node $lbpbindir/index.js login --token=$token`;
	}
	$loginSuccessful =~ s/\015?\012?$//;
	LOGINF "UniFi Login: '$loginSuccessful'" ;
	
	if ($loginSuccessful eq "2FA") {
		LOGINF "Unifi requires 2FA";
		$errors = '2FA';
	} elsif ($loginSuccessful eq false) {
		LOGINF "UniFi Login: Error";
		$errors = 'UniFi Login failed';
	}

	return ($errors);
}

sub saveclients
{
	my $errors;
	$jsonobj = LoxBerry::JSON->new();
	$cfg = $jsonobj->open(filename => $cfgfile);

	$clients = LoxBerry::JSON->new();
	$parsedClients = $clients->parse($q->{clients});
	
	$cfg->{clients} = $parsedClients;
	LOGINF $parsedClients;
	

	# Write
	$jsonobj->write();
	
	return ($errors);
}

sub ajax_header
{
	print $cgi->header(
			-type => 'application/json',
			-charset => 'utf-8',
			-status => '200 OK',
	);	
}