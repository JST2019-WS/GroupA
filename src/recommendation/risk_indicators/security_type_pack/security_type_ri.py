import os
import csv


def risk_value(isin):
  current_path = os.path.dirname(os.path.abspath(__file__))
  csv_path = os.path.join(current_path, 'all-securities.csv')
  with open(csv_path) as csv_file:
    secs = csv.reader(csv_file)
    sec = None
    for elem in secs:
      if elem[0] == isin:
        sec = elem
        break
    if sec is None:
      return None

    type = sec[1]

    switcher = {
      'STK': 4,
      'FND': 4,
      'IND': -1,
      'ETF': 4,
      'KNO': 5,
      'ZER': 4,
      'CUR': -1,
      'ETC': 1,
      'BND': 1,
      'CRYP': 5,
      'ETN': 5,
      'FUT': 5,
      'INT': -1,
      'OPT': 5,
      'RES': 3,
      'WNT': 5
    }

    risk_class = switcher.get(type)

    if risk_class is None or risk_class == -1:
      return None

    return (risk_class * 16.667) + (16.667 / 2)
