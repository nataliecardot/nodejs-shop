// This JS runs in the client/browser; served statically
const deleteProduct = (btn) => {
  // Will use these pieces of info to send asynchronous request to server
  const prodId = btn.parentNode.querySelector('[name=productId]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  // Pass selector to closest() JS method to get element with closest ancestor of that element type. Want to get article parent of button (btn) element, which was passed as this when deleteProduct called in the view
  const productElement = btn.closest('article');

  // Method supported by browser for sending HTTP requests -- actually for both fetching and sending data. Automatically sent to current host/server unless otherwise specified
  fetch('/admin/product/' + prodId, {
    method: 'DELETE',
    // csurf package looks for token in query parameters and headers [with csrf-token key] (in addition to body, but DELETE requests don't have a body)
    headers: {
      'csrf-token': csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    // Will have response body originally in the format ReadableStream
    // Product was deleted on the server, now want to also delete on the DOM so don't have to refresh page to see product gone. With this code, existing page is updated when delete button is clicked
    .then((data) => {
      // productElement.parentNode.removeChild(); would be needed if supporting IE, but I only care about modern browser support
      productElement.remove();
    })
    .catch((err) => console.log(err));
};
