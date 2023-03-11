const router = require('express').Router();
const { Review, User, Movie } = require('../models');
const withAuth = require('../utils/auth');

router.get('/home', async (req, res) => {
  const reviewData = await Review.findAll({
    order: [['updated_at', 'DESC']],
    include: [{
      model: Movie
    }, 
    {
      model: User
    }]
  })
  const reviews = reviewData.map((review) => review.get({ plain: true }));
  res.render('home', {reviews});
})

// router is either login/1 to login or login/0 sign up
router.get('/login/:login', (req, res) => {
  let login = req.params.login * 1;
  res.render('login', {login})
});

router.get('/dashboard', withAuth, async (req, res) => {
  let user = req.session;
  try {
    const reviewData = await Review.findAll({
      where: {
        userId: user.userId
      },
      include: [{
          model: Movie
      }]
    });

    const reviews = reviewData.map((review) => review.get({ plain: true }));

    res.render('dashboard', {
      user,
      reviews,
      logged_in: user.logged_in
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/search', withAuth, (req, res) => {
  let userId = req.session.userId;
  res.render('search', {userId})
});

router.get('/logout', withAuth, (req, res) => {
  req.session.logged_in = false;
  req.session.userId = null;
  req.session.username = null;
  res.render('welcome')
});

router.get('/movie/:id', withAuth, async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id, {
      include: [{
        model: Review,
        include: [{
          model: User,
        }]
      }]
    });
    const userId = req.session.userId;
    // res.status(200).json(movie);
    res.render('movie', {userId, movie: movie.get({ plain: true })})
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get('/review/:id', withAuth, (req, res) => {
  let userId = req.session.userId;
  res.render('addReview', {userId})
});

router.get('/editReview/:id', async (req, res) => {
  try{ 
      const editData = await Review.findByPk(req.params.id);
      if(!editData) {
          res.status(404).json({message: 'No review with this id!'});
          return;
      }
      const editReview = editData.get({ plain: true });
      res.render('editReview', {editReview});
    } catch (err) {
        res.status(500).json(err);
    };     
});

router.get('*', async (req, res) => {
    try {
      if(req.session.logged_in){
        res.render('home');
      } else {
        res.render('welcome');
      }
    } catch (err) {
      res.status(500).json(err);
    }
});

module.exports = router;