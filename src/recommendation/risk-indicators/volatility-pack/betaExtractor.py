# -*- coding: utf-8 -*-
import urllib.request
import urllib.parse
import urllib.error
from bs4 import BeautifulSoup
import ssl
import json
import ast
import os
from urllib.request import Request, urlopen
import requests
import sys

# For ignoring SSL certificate errors
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# convert the ISIN into a ticker symbol
isin = sys.argv[1]
url_base = 'https://finance.yahoo.com/_finance_doubledown/api/resource/searchassist;searchTerm='
url = url_base + isin
res = requests.get(url)
res_json = json.loads(res.text)
ticker = ''
if res_json['items'] == []:
    print('-100')
else:
    ticker = res_json['items'][0]['symbol']
    url = "http://finance.yahoo.com/quote/%s?p=%s"%(ticker,ticker)
    # Making the website believe that you are accessing it using a Mozilla browser
    req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    webpage = urlopen(req).read()

    # Creating a BeautifulSoup object of the HTML page for easy extraction of data.
    soup = BeautifulSoup(webpage, 'html.parser')
    html = soup.prettify('utf-8')

    # Extract the beta-3Y value
    beta_value = ''

    for td in soup.findAll('td', attrs={'data-test': 'BETA_3Y-value'}):
        for span in td.findAll('span', recursive=False):
            beta_value = span.text.strip()

    print(beta_value)
    