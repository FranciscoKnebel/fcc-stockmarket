# fcc-stockmarket

Stock Market web application.
The user can create an account and view data from their chosen stocks. You can add, remove and change your stocks in real time.

Uses [yahoo-finance](https://github.com/pilwon/node-yahoo-finance) for obtaining stock data. Uses [Highcharts](https://github.com/highcharts/highcharts) to display charts, along with [highcharts-ng](https://github.com/pablojim/highcharts-ng).

##### User Stories

* I can view a graph displaying the recent trend lines for each added stock.

* I can add new stocks by their symbol name.

* I can remove stocks.

* I can see changes in real-time when any other user adds or removes a stock.


#### Deployment

* Project root .env file has the following items:
```
MONGODB_URI
SESSION_SECRET
PORT
```

#### Demo
Demo is currently running at Heroku. [Click here to access it.](http://fcc-stockmarket.herokuapp.com/)

On the routes/api file, the stockAge constant defines the amount of years of data should be shown.


#### License
MIT License. [Click here for more information.](LICENSE)
