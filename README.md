# nodejs-shop

Online shop built using Node.js, Express, and MongoDB/Mongoose. The user can create an account, reset their password, add and remove cart items, upload and delete products, update data for products they added, checkout their cart, place orders, and view past orders (with the option to download an invoice PDF for each).

It follows the MVC design pattern, and renders views on the server using the EJS templating engine. The SendGrid API is used to send emails (confirmation of account creation and password reset instructions) and payments are handled using the Stripe API. Other features include pagination, error handling, validation of user input, sessions, authentication, and file storage.

Prior to the final version, I also used SQL (MySQL)/Sequelize, and output dynamic content with Pug and Handlebars. The code was refactored numerous times to try different approaches.

Built as a course project for Udemy's [NodeJS - The Complete Guide](https://www.udemy.com/course/nodejs-the-complete-guide/) by Maximilian Schwarzmüller.

## View Live: https://nodejs-e-shop.herokuapp.com/

Note: File storage is not persistent in the live version. Source code is saved and redeployed when the server is shut down or goes to sleep (which happens after some time since Heroku's free tier is being used), but user-generated/uploaded files not stored and recreated upon server restart. (A solution would be to use multer, configured with multer-s3, to store images on Amazon S3.)

When you place an order in the app, you'll be redirected to Stripe checkout in test mode. You can simulate a purchase using [test card numbers](https://stripe.com/docs/testing#cards). For a production app, I'd use live keys rather than testing keys after activating my Stripe account.

## View Locally

1. Install dependencies

```
npm install
```

2. Change the filename of `example-nodemon.json` to `nodemon.json`. Use the example as a guideline to replace keys with appropriate API keys, etc., from MongoDB, SendGrid, and Stripe. These can each be acquired using a free account.

3. Start Nodemon server at http://localhost:3000 (the `start:dev` script must be used since `nodemon.json` is used to store environment variables, and the other scripts do not use Nodemon)

```
npm run start:dev
```
