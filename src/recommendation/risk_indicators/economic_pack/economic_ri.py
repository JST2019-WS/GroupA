# -*- coding: utf-8 -*-
import os
import sys
import pycountry
import csv

# currentPath = os.path.dirname(os.path.abspath(__file__))
# csvPath = os.path.join(currentPath, 'countryRating.csv')
#
# # convert the ISIN into a ticker symbol
# # isin = sys.argv[1]
#
# # Hard coded values for missing ISINs
# special_codes = {
#   'AN': 'Netherlands Antilles',
#   'CS': 'Serbia',
#   'EU': 'European Union',
#   'ZR': 'Congo'
# }
#
# # Prevent different country name clashes for the same country
# country_name_new = {
#   'Czechia': 'Czech Republic',
#   'Russian Federation': 'Russia',
#   'Venezuela, Bolivarian Republic of': 'Venezuela',
#   'Brunei Darussalam': 'Brunei',
#   'Côte d\'Ivoire': 'Ivory Coast'
# }


# Converting ISINs to country
# country_name = ''
# country_code = isin[:2]
# try:
#   country = pycountry.countries.get(alpha_2=country_code.upper())
#   try:
#     country_name = country_name_new[country.name]
#   except:
#     country_name = country.name
# except:
#   try:
#     country = special_codes[country_code]
#     country_name = country
#   except:
#     country_name = 'NULL'
#
# # Retrieving the ratings for the countries from csv file
# # Scaling the rating [0 - 100], -100 being invalid
# credit_ratings = {}
# with open(csvPath) as ctrRating:
#   ratings = csv.reader(ctrRating)
#   for count, row in enumerate(ratings):
#     if count > 0:
#       credit_ratings[row[0]] = row[5]
#
# rating = -100
# try:
#   rating = credit_ratings[country_name]
# except:
#   pass
#
# print(rating)


def risk_value(isin):
  currentPath = os.path.dirname(os.path.abspath(__file__))
  csvPath = os.path.join(currentPath, 'countryRating.csv')

  # Hard coded values for missing ISINs
  special_codes = {
    'AN': 'Netherlands Antilles',
    'CS': 'Serbia',
    'EU': 'European Union',
    'ZR': 'Congo'
  }

  # Prevent different country name clashes for the same country
  country_name_new = {
    'Czechia': 'Czech Republic',
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
  credit_ratings = {}
  with open(csvPath) as ctrRating:
    ratings = csv.reader(ctrRating)
    for count, row in enumerate(ratings):
      if count > 0:
        credit_ratings[row[0]] = row[5]

  rating = -100
  try:
    rating = credit_ratings[country_name]
  except:
    pass

  if rating != -100:
    # Inverting the risk.
    return 100 - rating
  else:
    return None
