const { Schema, model } = require("mongoose");

const UserSchema = Schema({
	userId: {
		type: String,
		required: true,
		unique: [true, 'Ya existe']
	}, // Auth0 id
	email: String,
	name: String,
	lastname: String,
	language: String,
	wishlistsInfo: {
		currentWishlist: String,
		wishlistsOrder: String,
		wishlistsDirection: String
	},
}, {
  timestamps: true
});

module.exports = model("User", UserSchema);