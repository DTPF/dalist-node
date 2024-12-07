const { v4: uuidv4 } = require('uuid');
const Wishlist = require('../models/wishlist.model');
const User = require('../models/user.model');

async function postNewWishlist(req, res) {
  const { wishlistName, backgroundColor, color } = req.body;
  const userId = req.auth.sub;
  try {
    const wishlists = await Wishlist.find();
    const wishlist = new Wishlist();
    wishlist.userId = userId;
    wishlist.backgroundColor = backgroundColor;
    wishlist.color = color;
    wishlist.position = wishlists.length ? wishlists.length : 0;
    wishlist.wishlistName = wishlistName ? wishlistName : `Nueva lista 📝`;

    try {
      const wishlistStored = await wishlist.save();

      return res.status(200).send({
        status: 200,
        message: 'Añadido correctamente',
        wishlist: wishlistStored,
      });
    } catch (err) {
      return res.status(500).send({ status: 500, message: 'Error del servidor', error: err });
    }
  } catch (error) {
    return res.status(500).send({ status: 500, message: 'Error del servidor', error: err });
  }
}

async function getWishlistsByUserId(req, res) {
  const userId = req.auth.sub;
  try {
    const wishlists = await Wishlist.find({ userId: userId }).sort({ updatedAt: 'desc' }).lean().exec();

    if (wishlists.length === 0) {
      return res.status(400).send({ status: 400, message: 'No se ha encontrado nada' });
    } else {
      return res.status(200).send({
        status: 200,
        wishlists: wishlists,
      });
    }
  } catch (err) {
    res.status(500).send({ status: 406, message: 'Error del servidor' });
  }
}

async function getWishlistById(req, res) {
  const { wishlistId, userId } = req.params;

  try {
    const wishlist = await Wishlist.findById({ _id: wishlistId }).sort({ position: 'asc' }).lean().exec();

    try {
      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { wishlistsInfo: { currentWishlist: wishlistId } },
        { returnOriginal: false }
      )
        .sort({ position: 'asc' })
        .lean()
        .exec();

      return res.status(200).send({
        status: 200,
        wishlist,
        user,
      });
    } catch (err) {
      return res.status(500).send({ status: 500, message: 'Error del servidor' });
    }
  } catch (err) {
    return res.status(500).send({ status: 501, message: 'Error del servidor' });
  }
}

async function postNewWishlistItem(req, res) {
  const { wishlistId } = req.params;
  const { title, description } = req.body;
  const id = uuidv4();

  try {
    const wishlistItem = await Wishlist.findById({ _id: wishlistId }).lean().exec();

    try {
      const newObj = {
        id,
        title,
        description,
        isCompleted: false,
        position: wishlistItem.wishlistItems.length,
      };
      const wishlistItemStored = await Wishlist.findByIdAndUpdate(
        { _id: wishlistId },
        {
          $push: {
            wishlistItems: newObj,
          },
        },
        { returnOriginal: false }
      )
        .lean()
        .exec();

      if (!wishlistItemStored) {
        return res.status(404).send({ status: 404, message: 'No se ha podido crear' });
      }

      return res.status(200).send({
        status: 200,
        message: 'Añadido correctamente',
        wishlistStored: wishlistItemStored,
        newWishlistItem: newObj,
      });
    } catch (err) {
      if (err.name === 'CastError') {
        return res.status(404).send({ status: 404, message: 'No se ha encontrado la lista' });
      } else {
        return res.status(500).send({ status: 500, message: err });
      }
    }
  } catch (err) {
    return res.status(500).send({ status: 500, message: err });
  }
}

async function removeWishlistItem(req, res) {
  const { wishlistId, wishlistItemId } = req.params;

  try {
    const wishlistStored = await Wishlist.findByIdAndUpdate(
      { _id: wishlistId },
      { $pull: { wishlistItems: { id: wishlistItemId } } },
      { returnOriginal: false }
    )
      .lean()
      .exec();

    return res.status(200).send({
      status: 200,
      message: 'Eliminado correctamente',
      wishlist: wishlistStored,
    });
  } catch (err) {
    return res.status(500).send({ status: 500, message: err });
  }
}

async function removeWishlist(req, res) {
  const { wishlistId } = req.params;

  try {
    const response = await Wishlist.findByIdAndDelete({ _id: wishlistId }).lean().exec();

    return res.status(200).send({
      status: 200,
      message: 'Eliminado correctamente',
      wishlistItemIdDeleted: response._id,
    });
  } catch (err) {
    return res.status(500).send({ status: 500, message: 'Error del servidor' });
  }
}

async function updateWishlist(req, res) {
  const { wishlistId } = req.params;
  const wishlist = req.body;
  try {
    const wishlistUpdated = await Wishlist.findByIdAndUpdate({ _id: wishlistId }, wishlist, {
      returnOriginal: false,
    })
      .lean()
      .exec();

    return res.status(200).send({
      status: 200,
      message: 'Actualizado correctamente',
      wishlist: wishlistUpdated,
    });
  } catch (err) {
    return res.status(500).send({ status: 500, message: err });
  }
}

async function updateWishlistItem(req, res) {
  const { wishlistId, wishlistItemId } = req.params;
  const { title, isCompleted, position } = req.body;

  try {
    const wishlist = await Wishlist.findOne({ _id: wishlistId });

    const index = wishlist.wishlistItems.findIndex((item) => item.id === wishlistItemId);
    if (title) {
      wishlist.wishlistItems[index].title = title;
    } else if (position) {
      wishlist.wishlistItems[index].position = position;
    } else if (isCompleted !== undefined) {
      wishlist.wishlistItems[index].isCompleted = isCompleted;
    }

    try {
      const wishlistStored = await Wishlist.findByIdAndUpdate(
        { _id: wishlistId },
        { wishlistItems: wishlist.wishlistItems },
        { returnOriginal: false }
      );

      return res.status(200).send({
        status: 200,
        message: 'Actualizado correctamente',
        wishlist: wishlistStored,
      });
    } catch (error) {
      return res.status(500).send({ status: 500, message: err });
    }
  } catch (err) {
    return res.status(500).send({ status: 500, message: err });
  }
}

async function changeWishlistColor(req, res) {
  const { color, backgroundColor } = req.body;
  const { wishlistId } = req.params;

  try {
    const userStored = await Wishlist.updateOne(
      { _id: wishlistId },
      {
        $set: {
          color: color,
          backgroundColor: backgroundColor,
        },
      }
    )
      .lean()
      .exec();

    if (!userStored) return res.status(400).send({ status: 400 });
    return res.status(200).send({ status: 200 });
  } catch (err) {
    return res.status(500).send({ status: 501, error: err });
  }
}

module.exports = {
  postNewWishlist,
  getWishlistsByUserId,
  getWishlistById,
  postNewWishlistItem,
  removeWishlistItem,
  removeWishlist,
  updateWishlist,
  updateWishlistItem,
  changeWishlistColor,
};
