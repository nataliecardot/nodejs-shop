// This JS runs in the client/browser; served statically
const deleteProduct = (btn) => {
  // Will use these pieces of info to send asynchronous request to server
  const prodId = btn.parentNode.querySelector('[name=productId]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  // Method supported by browser for sending HTTP requests -- actually for both fetching and sending data. Automatically sent to current host/server unless otherwise specified
  fetch('/admin/product/' + prodId, {
    method: 'DELETE',
    // csurf package looks for token in query parameters and headers [with csrf-token key] (in addition to body, but DELETE requests don't have a body)
    headers: {
      'csrf-token': csrf,
    },
  })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => console.log(err));
};
