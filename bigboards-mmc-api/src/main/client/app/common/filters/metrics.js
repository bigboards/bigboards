app.filter('bytes', function() {
    return function(bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
        if (typeof precision === 'undefined') precision = 1;
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
        number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
        }
});

app.filter('percentMetric', function() {
    return function(uft) {
        return (uft.total == 0) ? 0 : ((uft.used / uft.total) * 100);
    }
});

app.filter('temperature', function() {
    return function(temperature) {
        return (isNaN(temperature)) ? '-' : temperature;
    }
});

app.filter('loadMetric', function() {
    return function(load) {
        return (isNaN(load[0])) ? '-' : load[0];
    }
});