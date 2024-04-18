# DATA

In the input folder:
* copy the geojson + png files provided by the researcher on ENAC drive
* run the tranform script with `make transform`
* run `make cdn` to upload data on the CDN
* update the `VITE_CDN_URL` variable in the `.env` file with the new CDN folder
* run `make martin` to upload data to the Martin tile server
* update the `VITE_MARTIN_URL` variable in the `.env` file with the Martin tile server URL


The data looks like this: 

```json
[
  {
    "name": "",
    "description": "",
    "receiver_location": "",
    "main_concrete_type": "",
    "distance_km": "",
    "start_date_precs": "",
    "component_age_at_start_date": "",
    "design_solution_status": "",
    "reference": "",
    "impact_design_alternative": "",
    "impact_difference": "",
    "impact_source": "",
    "cost_design_alternative": "",
    "cost_difference": "",
    "cost_source": ""
  }
]
```