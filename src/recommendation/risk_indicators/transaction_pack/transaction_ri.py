# -*- coding: utf-8 -*-
import os
import pycountry
import csv


def risk_value(isin):
  currentPath = os.path.dirname(os.path.abspath(__file__))
  csvPath = os.path.join(currentPath, 'transaction_risk_countries.csv')

  # Hard coded values for missing ISINs
  special_codes = {
    'AN': 'Netherlands Antilles',
    'CS': 'Serbia',
    'EU': 'European Union',
    'ZR': 'Democratic Republic of the Congo'
  }

  # Prevent different country name clashes for the same country
  country_name_new = {
    'Russian Federation': 'Russia',
    'Venezuela, Bolivarian Republic of': 'Venezuela',
    'Brunei Darussalam': 'Brunei',
    'Côte d\'Ivoire': 'Ivory Coast'
  }

  # Converting ISINs to country
  country_name = ''
  country_code = isin[:2]
  try:
    country = pycountry.countries.get(alpha_2=country_code.upper())
    try:
      country_name = country_name_new[country.name]
    except:
      country_name = country.name
  except:
    try:
      country = special_codes[country_code]
      country_name = country
    except:
      country_name = 'NULL'

  # Retrieving the ratings for the countries from csv file
  # Scaling the rating [0 - 100], -100 being invalid
  risk_ratings = {}
  with open(csvPath) as ctrRating:
    ratings = csv.reader(ctrRating)
    for count, row in enumerate(ratings):
      risk_ratings[row[1]] = round(int(row[2]) * (100 / 7), 2)
  rating = None
  try:
    rating = risk_ratings[country_name]
  except:
    pass

  return rating
