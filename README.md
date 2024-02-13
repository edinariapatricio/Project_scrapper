# Shoppify Scrapping Bot

Generic Bot to scrap all products from a Shopify or e-commerce website

### Practical use cases

 - A website is required to redesign to another platform

How does it work?
================  

 This script runs sitemapper which find all the pages of the website using
`sitemapper` module. Then it runs metascraper on all the products pages using
browserless in baches of 100 pages to collect product data. All the sites are
stored in `domain.com-sites.json` file and products are stored in
`domain.com-data.json`.

Installation
===============

 - Installing Node.js from [Node.js download page](https://nodejs.org/en/download/)
 - `npm install`
 - Set url variable in [.env](/.env) file. This would assure that you don't
   need to touch code.
 - `npm start` (run the product_scrapper.js, and write all the products to
   domain.com-data.json)
 - Tested on websites
```
URL=https://www.cavamorande.cl/sitemap.xml
URL=https://kharakapas.com/sitemap.xml
URL=https://argentwork.com/sitemap.xml
```

Transforming Response Data
==========================

 - In every website there are some values not available. To remove null value
   use [transform](/transform.js) script. 
 - Write comma seperated values in [.env](/.env) file for keys
 - Run transofrm script `npm run transform`

# Project_Product_Scrapper
