const express = require('express');
const WishlistController = require('../controllers/wishlist.controller');
const api = express.Router();
const md_auth = require('../middlewares/auth.middleware');

api
  .get('/get-wishlists-by-user-id', [md_auth.checkJwt], WishlistController.getWishlistsByUserId)
  .get('/get-wishlist-by-id/:wishlistId/:userId', [md_auth.checkJwt], WishlistController.getWishlistById)
  .post('/post-new-wishlist', [md_auth.checkJwt], WishlistController.postNewWishlist)
  //Item
  .post('/post-new-wishlist-item/:wishlistId', [md_auth.checkJwt], WishlistController.postNewWishlistItem)
  .delete(
    '/remove-wishlist-item/:wishlistId/:wishlistItemId',
    [md_auth.checkJwt],
    WishlistController.removeWishlistItem
  )
  .delete('/remove-wishlist/:wishlistId', [md_auth.checkJwt], WishlistController.removeWishlist)
  .put('/update-wishlist/:wishlistId', [md_auth.checkJwt], WishlistController.updateWishlist)
  .put(
    '/update-wishlist-item/:wishlistId/:wishlistItemId',
    [md_auth.checkJwt],
    WishlistController.updateWishlistItem
  )
  .put('/change-wishlist-color/:wishlistId', [md_auth.checkJwt], WishlistController.changeWishlistColor);

module.exports = api;
