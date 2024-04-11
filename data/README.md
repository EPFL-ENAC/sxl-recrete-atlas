# ALICE-PERL-EERL URBTREES DATA

In the input folder:
* copy the geojson + png files provided by the researcher on ENAC drive
* run the tranform script with `make transform`
* run `make cdn` to upload data on the CDN
* update the `VITE_CDN_URL` variable in the `.env` file with the new CDN folder
* run `make martin` to upload data to the Martin tile server
* update the `VITE_MARTIN_URL` variable in the `.env` file with the Martin tile server URL