const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { populate } = require('../models/author');

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate('book').exec();

  res.render('bookinstance_list', {
    title: 'Book Instance List',
    bookinstance_list: allBookInstances,
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate('book')
    .exec();

  if (bookInstance === null) {
    const err = new Error('Book copy not found');
    err.status = 404;
    return next(err);
  }

  res.render('bookinstance_detail', {
    title: 'Book:',
    bookinstance: bookInstance,
  });
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec();

  res.render('bookinstance_form', {
    title: 'Create BookInstance',
    book_list: allBooks,
    selected_book: '',
    errors: '',
    bookinstance: '',
  });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('status').escape(),
  body('due_back', 'Invalid date')
    .optional({ values: 'falsy' })
    .isISO8601()
    .escape(),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again
      const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec();

      res.render('bookinstance_form', {
        title: 'Create BookInstance',
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      // Data from form is valid
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate({
      path: 'book',
      populate: {
        path: 'author',
      },
    })
    .exec();

  if (bookInstance === null) {
    // No results
    res.redirect('/catalog/bookinstances');
  }

  res.render('bookinstance_delete', {
    title: 'Delete Book Instance',
    bookinstance: bookInstance,
    bookTitle: bookInstance.book.title,
    bookAuthor: bookInstance.book.author.name,
  });
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  await BookInstance.findByIdAndDelete(req.body.bookinstanceid);
  res.redirect('/catalog/bookinstances');
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec();
  const selectedBook = await BookInstance.findById(req.params.id)
    .populate({ path: 'book' })
    .exec();
  const bookInstance = await BookInstance.findById(req.params.id).exec();

  res.render('bookinstance_form', {
    title: 'Create BookInstance',
    book_list: allBooks,
    selected_book: selectedBook.book._id.toString(),
    errors: '',
    bookinstance: bookInstance,
  });
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: BookInstance update POST');
});
