
# Ganglia monitoring system php web frontend
#

Alias /ganglia /usr/share/ganglia

<Location /ganglia>
	AllowOverride All
	Order allow,deny
	Allow from all
	Deny from none
</Location>