const User = require('../models/user.model');

async function initGetUser(req, res) {
  const { userId } = req.body;

  try {
    const userStored = await User.findOne({ userId: userId.toString() }).lean().exec();

    if (!userStored) {
      const user = new User();
      const userAuth0 = req.auth;
      user.userId = userId;
      user.email = userAuth0.email;
      user.name = userAuth0.given_name || userAuth0.nickname;
      user.lastname = userAuth0.family_name || '';
      user.appInfo.language = userAuth0.locale || 'en';
      user.appInfo.colorPrimary = '#fff';
      user.appInfo.colorPrimaryBg = '#232F3E';
      user.appInfo.wishlistColor = '#fff';
      user.appInfo.wishlistColorBg = '#697C8C';
      user.wishlistsInfo.currentWishlist = 'list-id-no-selected';
      user.wishlistsInfo.wishlistsOrder = 'name';
      user.wishlistsInfo.wishlistsDirection = 'asc';

      try {
        const userSaved = await user.save();
        return res.status(201).send({ status: 200, user: userSaved });
      } catch (err) {
        return res.status(500).send({ status: 500, error: err });
      }
    } else {
      return res.status(200).send({ status: 201, user: userStored });
    }
  } catch (err) {
    return res.status(500).send({ status: 501, error: err });
  }
}

async function updateUser(req, res) {
  const { userId } = req.params;
  const data = req.body;

  try {
    const userStored = await User.findOneAndUpdate({ _id: userId.toString() }, data, {
      new: true,
    })
      .lean()
      .exec();

    if (!userStored) {
      return res.status(400).send({ status: 400 });
    }
    return res.status(200).send({ status: 200, user: userStored });
  } catch (err) {
    return res.status(500).send({ status: 501, error: err });
  }
}

async function changeLanguage(req, res) {
  const { language } = req.body;
  const userId = req.auth.sub;

  try {
    const userStored = await User.updateOne({ userId: userId }, { $set: { 'appInfo.language': language } })
      .lean()
      .exec();

    if (!userStored) return res.status(400).send({ status: 400 });
    return res.status(200).send({ status: 200 });
  } catch (err) {
    return res.status(500).send({ status: 501, error: err });
  }
}

async function updateAppColor(req, res) {
  const { colorPrimary, colorPrimaryBg } = req.body;
  const userId = req.auth.sub;

  try {
    const userStored = await User.updateOne(
      { userId: userId },
      {
        $set: {
          'appInfo.colorPrimary': colorPrimary,
          'appInfo.colorPrimaryBg': colorPrimaryBg,
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

async function updateWishlistColor(req, res) {
  const { wishlistColor, wishlistColorBg } = req.body;
  const userId = req.auth.sub;

  try {
    const userStored = await User.updateOne(
      { userId: userId },
      {
        $set: {
          'appInfo.wishlistColor': wishlistColor,
          'appInfo.wishlistColorBg': wishlistColorBg,
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

async function changeWishlistsDirection(req, res) {
  const { wishlistsDirection } = req.body;
  const userId = req.auth.sub;

  try {
    const userStored = await User.updateOne(
      { userId: userId },
      {
        $set: {
          'wishlistsInfo.wishlistsDirection': wishlistsDirection,
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
  initGetUser,
  updateUser,
  changeLanguage,
  updateWishlistColor,
  updateAppColor,
  changeWishlistsDirection,
};
