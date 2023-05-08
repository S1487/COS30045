/*
    mig.csv
    Afghanistan -> Czech Replublic missing 2000, 2001, 2002
    Afghanistan -> Italy missing 2001
    Afghanistan -> Mexico missing 2000 ~ 2006
    BE CAREFUL WITH THIS DATA
    FILL IN THE MISSING VALUES AS 0

    China in mig.csv seems to be split into China P.R. Hong Kong, 
    etc in the other two files
    mig.csv also has Chinese Taipei
    Congo seems to be split into "Congo, Dem Rep of the" and "Congo, Rep of" (two 
    different areas according to Google Maps)
    Korea seems to be split into North Korea and South Korea
    Weird political shit going on with Serbia and Montenegro, and Rep. of Serbia
    Sudan and South Sudan are different countries
 */

var dataMassaged = {}, countries = [], migsCountryToCountry = {};

var importData = async function() {
    // let's filter all files so that all files have the same list of countries!!
    // i.e. no countries are missing from the other files!!
    var disastersCountries = [], tempCountries = [], migCountries = [];
    await d3.csv('disasters.csv').then( data => {
        data.forEach( countryData => {
            disastersCountries.push( countryData.country );
        });
    });

    await d3.csv('temp_change.csv').then( data => {
        data.forEach( tempData => {
            tempCountries.push( tempData.country );
        });
    });

    await d3.csv('mig.csv').then( data => {
        data.forEach( migData => {
            if( !migCountries.includes( migData.country ) ) {
                migCountries.push( migData.country );
            }
        });
    });

    disastersCountries.forEach( country => {
        if( tempCountries.includes(country) && migCountries.includes(country) ) {
            countries.push(country);
        }
    });

    /*
        load disasters and temp_change data
     */
    await d3.csv("disasters.csv").then(function(data) {
        var i = 0;
        while( i < data.length ) {
            if( countries.includes(data[i].country) ) {
                dataMassaged[data[i].country] = [];
                var j = 0;
                while( j < 21 ) {
                    var index = new Number( j + 2000 ).toString();
                    var disastersValue = data[i][index];
                    if( disastersValue === '' ) { disastersValue = 0 }
                    else { disastersValue = +disastersValue; }
                    dataMassaged[data[i].country][j] = {
                        'disasters': disastersValue
                    };
                    ++j;
                }
            }
            ++i;
        }
    });

    await d3.csv("temp_change.csv").then(function(data) {
        var i = 0;
        while( i < data.length ) {
            if( countries.includes( data[i].country ) ) {
                var j = 0;
                while( j < 21 ) {
                    var index = new Number( j + 2000 ).toString();
                    var tempChangeValue = data[i][index];
                    if( tempChangeValue === '' ) { tempChangeValue = 0 }
                    else { tempChangeValue = +tempChangeValue; }
                    dataMassaged[data[i].country][j]['temp_change'] = tempChangeValue;;
                    ++j;
                }
            }
            ++i;
        }
    });

    /*
        create a separate variable for "country from" and "country to" migration
        data. From that we can caluclate total migration data year by year.
        Because of some missing values, we initialise these arrays as all zeros.
     */
    await d3.csv('mig.csv').then(function(data) {
        var i = 0;
        while( i < data.length ) {
            if( countries.includes(data[i].country) ) {
                if( !Object.keys( migsCountryToCountry ).includes( data[i].country ) ) {
                    migsCountryToCountry[ data[i].country ] = {};
                }
                if( !Object.keys( 
                        migsCountryToCountry[ data[i].country ] 
                    ).includes( data[i].to ) 
                ) {
                    migsCountryToCountry[ data[i].country ][ data[i].to ] = 
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                }
                var index = +data[i].year - 2000;
                migsCountryToCountry[ data[i].country ][ data[i].to ][index] = 
                    +data[i].value;
            }
            ++i;
        }

        /*
            now let's calculate total migration values per country
            (migrated to ANY country)
         */
        // migsCountryToCountry should have keys ONLY that are in the countries
        // variable!!
        var countriesHopefully = Object.keys( migsCountryToCountry );
        countriesHopefully.forEach( country => {
            var countryMigData = migsCountryToCountry[country];
            var countriesMigTo = Object.keys( countryMigData );
            var totalMigrations = 
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            countriesMigTo.forEach( countryTo => {
                for( var i = 0; i < 21; ++i ) {
                    totalMigrations[i] += 
                        migsCountryToCountry[ country ][ countryTo ][i];
                }
            });
            for( var i = 0; i < 21; ++i) {
                dataMassaged[ country ][i]['migrations'] = totalMigrations[i];
            }
        });
    });
}