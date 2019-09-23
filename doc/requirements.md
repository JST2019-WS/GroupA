# Requirements

## Data

Data delivered to the service originates from two sources

### Comments from WSO
The data comprises
    * Username
    * Stock type
    * Stock ID
    * Stock name
    * Age

### Feedback from recommendations given
    * User (?)
    * Choices presented
    * User's choice


## Services provided / API

### Data retrieval

Upon receiving new data (i.e. via a call to the API) 
1. Validation
2. Transform the data into some internal format (scrape stock data for additional information etc.)
    * Data cleanup (removal of outliers etc is done by teams B/C)
3. Update the database
4. Call the machine learning services to update their model

Open questions:
* Should updates/notifications happen periodically or event based (i.e. upon arrival of new data)

### Frontend

Generate recommendations upon request from the frontend. The request will (probably) include some means of identifying the user.

The frontend will also notify the backend when 
* A new user joins the system
* A new stock is added to offerings

___ So are we only responsible for data storage/maintenance? ___

### Statistics / Monitoring

Just some general run time statistics, e.g.
* How often a certain service/endpoint has been called
    * Queryable? (I.e. how often has user X accepted the recommendation)
* Statistics on the data
    * How many data entries for each user?
    * Most clicked stocks
    * Least clicked stocks
    * etc
    * _ Figure out what exactly! Ask ML guys _
