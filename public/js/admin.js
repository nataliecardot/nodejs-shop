// This JS runs in the client/browser; served statically
const deleteProduct = (btn) => {
  // Will use these pieces of info to send asynchronous request to server
  const prodId = btn.parentNode.querySelector('[name=productId]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
};
