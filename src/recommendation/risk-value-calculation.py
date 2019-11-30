import csv
import os

import risk_indicators.economic_pack.economic_ri as er
import risk_indicators.security_type_pack.security_type_ri as st
import risk_indicators.transaction_pack.transaction_ri as tr
#import risk_indicators.volatility_pack.volatility_ri as vr

ER_FACTOR = 0.20
ST_FACTOR = 0.40
TR_FACTOR = 0.20
#VR_FACTOR = 0.20

current_path = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(current_path, 'risk_indicators/security_type_pack/all-securities.csv')

with open(csv_path) as csv_file:
  risk_dict = {}
  secs = csv.reader(csv_file)

  # First row contains the names of the columns
  next(secs)

  # Iteration counter
  i = 0

  for elem in secs:

    i += 1
    print(i)

    isin = elem[0]
    er_val = er.risk_value(isin)
    st_val = st.risk_value(isin)
    tr_val = tr.risk_value(isin)
    #vr_val = vr.risk_value(isin)

    not_null = []

    if er_val is not None: not_null.append(er_val)
    if st_val is not None: not_null.append(st_val)
    if tr_val is not None: not_null.append(tr_val)
    #if vr_val is not None: not_null.append(vr_val)

    fac_dict = {
      er_val: ER_FACTOR,
      st_val: ST_FACTOR,
      tr_val: TR_FACTOR,
      #vr_val: VR_FACTOR
    }

    if len(not_null) == 0:
      print('No risk value for ' + isin)
      continue

    # Sum of the indicator factors, where not None was returned.
    fac_sum = 0
    for e in not_null: fac_sum += fac_dict.get(e)

    # Every factor gets it's percentage of the fac_sum as weight.
    risk_value = 0
    for e in not_null: risk_value += (fac_dict.get(e) * e) / fac_sum

    risk_dict[isin] = risk_value

with open('risk-values.csv', 'w', newline='') as csv_file:
  filewriter = csv.writer(csv_file, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL)
  filewriter.writerow(['isin', 'risk_value'])
  for e in risk_dict.keys():
    filewriter.writerow([e, str(risk_dict.get(e))])
