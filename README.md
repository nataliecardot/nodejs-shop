# nodejs-shop

This is a mock online shop built using Node.js, Express, and MongoDB/Mongoose. The user can create an account, reset their password, add and remove cart items, upload and delete products, update product data, checkout their cart, and view past orders (with the option to download an invoice PDF for each).

It follows the MVC framework, and renders views on the server using the EJS templating engine. Sendgrid is used to send emails and Stripe is used to handle payments. Other features include pagination, error handling, validation of user input, sessions, authentication, and file storage.

Prior to the final version, I also used SQL/Sequelize, and output dynamic content with Pug and Handlebars. The code was refactored numerous times to try different approaches.

It was built as a course project for Udemy's [NodeJS - The Complete Guide](https://www.udemy.com/course/nodejs-the-complete-guide/) by Maximilian Schwarzmüller.

## View Locally

1. Install dependencies

```
npm install
```

2. Change the filename of `example-nodemon.json` to `nodemon.json`. Use the example as a guideline to replace keys with appropriate API keys, etc., from MongoDB, Sendgrid, and Stripe. These can each be acquired using a free account.

3. Start Node server at http://localhost:3000

```
 npm start
```

When you place an order in the app, you'll be redirected to Stripe checkout in test mode. You can simulate a purchase using [test card numbers](https://stripe.com/docs/testing#cards).

## Screenshots

<img src="https://user-images.githubusercontent.com/33387780/82859964-22f22400-9ecd-11ea-9b1e-31b4ea99ba77.jpg" width="800">
<img src="https://user-images.githubusercontent.com/33387780/82863375-d6abe180-9ed6-11ea-8c24-77cdf255519f.JPG" width="800">
<img src="https://user-images.githubusercontent.com/33387780/82863392-e3c8d080-9ed6-11ea-9263-d13ae76c6547.JPG" width="800">
<img src="https://user-images.githubusercontent.com/33387780/82860386-3651bf00-9ece-11ea-84be-e5da6e870a74.JPG" width="800">
<img src="https://user-images.githubusercontent.com/33387780/82860439-72851f80-9ece-11ea-8869-f47be59cdd02.JPG" width="800">
<img src="https://user-images.githubusercontent.com/33387780/82861970-3bfdd380-9ed3-11ea-981b-f5c9d23df19f.JPG" width="800">
<img src="https://user-images.githubusercontent.com/33387780/82863189-5e452080-9ed6-11ea-86c2-9986c0d82894.JPG" width="800">
