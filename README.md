# nodejs-shop

This is a mock online shop built using Node.js, Express, and MongoDB/Mongoose. The user can create an account, reset their password, add and remove cart items, upload and delete products, checkout their cart, and view past orders (plus download an invoice PDF for each).

It follows the MVC framework, and renders views on the server using the EJS templating engine. Sendgrid is used to send emails and Stripe is used to handle payments. Other features include pagination, error handling, validation of user input, sessions, authentication, and file storage.

Prior to the final version, I also used SQL/Sequelize, and output dynamic content with Pug and Handlebars. The code was refactored numerous times to try different approaches.

It was built as a course project for Udemy's [NodeJS - The Complete Guide](https://www.udemy.com/course/nodejs-the-complete-guide/) by Maximilian Schwarzmüller.

## View Locally

1. Install dependencies
   `npm install`

2. Change the file example-nodemon.json to nodemon.json. Use the example to replace keys with appropriate API keys, etc., from MongoDB, Sendgrid, and Stripe. These can each be acquired for free.

3. Start Node server at http://localhost:3000
   `npm start`
