"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.OrderToShowSuccess = exports.search = exports.orders = exports.createOrder = exports.createCheckout = exports.lendingProcess = exports.lenderDetails = exports.soldBooks = exports.rentedBooks = exports.sellBook = exports.rentBookUpdate = exports.rentBook = exports.bookDetail = exports.genres = exports.exploreBooks = exports.genresOfBooks = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const sharp_1 = __importDefault(require("sharp"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../config/config"));
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const rentBookValidation_1 = __importDefault(require("../utils/ReuseFunctions/rentBookValidation"));
const sellBookValidation_1 = __importDefault(require("../utils/ReuseFunctions/sellBookValidation"));
const store_1 = require("../utils/imageFunctions/store");
const stripe_1 = __importDefault(require("stripe"));
const bookService_1 = require("../services/bookService");
const cartService_1 = require("../services/cartService");
const userService_1 = require("../services/userService");
const walletService_1 = require("../services/walletService");
const bookService = new bookService_1.BookService();
const cartService = new cartService_1.CartService();
const userService = new userService_1.UserService();
const walletService = new walletService_1.WalletService();
const genresOfBooks = async (req, res) => {
    try {
        const genres = await bookService.getAllGenres();
        for (const genre of genres) {
            if (genre.image) {
                const getObjectParams = {
                    Bucket: config_1.default.BUCKET_NAME,
                    Key: genre.image,
                };
                const command = new client_s3_1.GetObjectCommand(getObjectParams);
                const url = await (0, s3_request_presigner_1.getSignedUrl)(store_1.s3Client, command, {
                    expiresIn: 3600,
                });
                genre.image = url;
            }
            else {
                genre.image = " ";
            }
        }
        return res.status(200).json(genres);
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.genresOfBooks = genresOfBooks;
const genres = async (req, res) => {
    try {
        const genres = await bookService.getAllGenres();
        for (const genre of genres) {
            if (genre.image && typeof genre.image === "string") {
                const getObjectParams = {
                    Bucket: config_1.default.BUCKET_NAME,
                    Key: genre.image,
                };
                const command = new client_s3_1.GetObjectCommand(getObjectParams);
                const imageUrl = await (0, s3_request_presigner_1.getSignedUrl)(store_1.s3Client, command, {
                    expiresIn: 3600,
                });
                genre.image = imageUrl;
            }
            else {
                genre.image = "";
            }
        }
        return res.status(200).json(genres);
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.genres = genres;
const exploreBooks = async (req, res) => {
    try {
        const userId = req.userId;
        const allBooks = await bookService.getAllBooks();
        const booksToShow = [];
        for (const book of allBooks) {
            if (book.lenderId !== userId) {
                const isLenderExist = await userService.getUserById(book.lenderId);
                if (isLenderExist && !isLenderExist.isBlocked) {
                    booksToShow.push(book);
                }
            }
        }
        return res.status(200).json(booksToShow);
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.exploreBooks = exploreBooks;
const bookDetail = async (req, res) => {
    try {
        const bookId = req.params.Id;
        const book = await bookService.getBookById(bookId);
        if (!book) {
            return res.status(500).json({ message: "Book is not found " });
        }
        const lenderId = book.lenderId;
        const lender = await userService.getUserById(lenderId);
        return res.status(200).json({ book, lender });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.bookDetail = bookDetail;
const randomImageName = (bytes = 32) => crypto_1.default.randomBytes(bytes).toString("hex");
const rentBook = async (req, res) => {
    try {
        const { bookTitle, description, author, publisher, publishedYear, genre, rentalFee, extraFee, quantity, street, city, district, state, pincode, maxDistance, maxDays, minDays, latitude, longitude, } = req.body;
        if (!req.userId) {
            return res
                .status(403)
                .json({ message: "User ID not found in request" });
        }
        const userId = req.userId;
        const files = req.files;
        if (!files || files.length === 0) {
            return res
                .status(404)
                .json({ message: "Please provide book images" });
        }
        const images = files.map((file) => {
            return file.location;
        });
        const bookRentData = {
            bookTitle,
            description,
            author,
            publisher,
            publishedYear,
            genre,
            images,
            rentalFee,
            extraFee,
            quantity,
            address: {
                street,
                city,
                district,
                state,
                pincode,
            },
            isRented: true,
            lenderId: userId,
            maxDistance,
            maxDays,
            minDays,
            latitude,
            longitude,
        };
        const validationError = (0, rentBookValidation_1.default)(bookRentData);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }
        const bookAdded = await bookService.getAddToBookRent(bookRentData);
        return res
            .status(200)
            .json({ message: "Book rented successfully", bookAdded });
    }
    catch (error) {
        console.error("Error renting book:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.rentBook = rentBook;
const rentBookUpdate = async (req, res) => {
    try {
        const { bookTitle, description, author, publisher, publishedYear, genre, rentalFee, extraFee, quantity, street, city, district, state, pincode, maxDistance, maxDays, minDays, latitude, longitude, } = req.body;
        const { bookId } = req.params;
        if (!req.userId) {
            return res
                .status(403)
                .json({ message: "User ID not found in request" });
        }
        const userId = req.userId;
        let { images } = req.body;
        if (typeof images === "string") {
            images = [images];
        }
        images = images || [];
        let finalImages = [...images];
        const files = req.files;
        if (files && files.length > 0) {
            const newImages = files.map((file) => file.location);
            finalImages = [...finalImages, ...newImages];
        }
        console.log(finalImages, "finalImages after");
        const bookRentData = {
            bookTitle,
            description,
            author,
            publisher,
            publishedYear,
            genre,
            images: finalImages,
            rentalFee,
            extraFee,
            quantity,
            address: {
                street,
                city,
                district,
                state,
                pincode,
            },
            isRented: true,
            lenderId: userId,
            maxDistance,
            maxDays,
            minDays,
            latitude,
            longitude,
        };
        const validationError = (0, rentBookValidation_1.default)(bookRentData);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }
        const bookAdded = await bookService.getUpdateBookRent(bookRentData, bookId);
        return res
            .status(200)
            .json({ message: "Book rented successfully", bookAdded });
    }
    catch (error) {
        console.error("Error renting book:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.rentBookUpdate = rentBookUpdate;
const sellBook = async (req, res) => {
    try {
        const { bookTitle, description, author, publisher, publishedYear, genre, price, quantity, street, city, district, state, pincode, latitude, longitude, } = req.body;
        if (!req.userId) {
            return res
                .status(403)
                .json({ message: "User ID not found in request" });
        }
        const userId = req.userId;
        const images = req.files;
        if (!images || images.length === 0) {
            return res
                .status(404)
                .json({ message: "Please provide book images" });
        }
        const bookImages = [];
        for (let i = 0; i < images.length; i++) {
            const buffer = await (0, sharp_1.default)(images[i].buffer)
                .resize({ height: 1920, width: 1080, fit: "contain" })
                .toBuffer();
            const image = randomImageName();
            const params = {
                Bucket: "bookstore-web-app",
                Key: image,
                Body: buffer,
                ContentType: images[i].mimetype,
            };
            const command = new client_s3_1.PutObjectCommand(params);
            try {
                await store_1.s3Client.send(command);
                bookImages.push(image);
            }
            catch (error) {
                console.error(error);
                return res
                    .status(404)
                    .json({ message: `Failed to upload image ${i}` });
            }
        }
        const bookSelldata = {
            bookTitle,
            description,
            author,
            publisher,
            publishedYear,
            genre,
            images: bookImages,
            price,
            quantity,
            address: {
                street,
                city,
                state,
                district,
                pincode,
            },
            lenderId: userId,
            latitude,
            longitude,
        };
        const validationError = (0, sellBookValidation_1.default)(bookSelldata);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }
        await bookService.getAddToBookSell(bookSelldata);
        return res
            .status(200)
            .json({ message: "Book sold successfully", bookSelldata });
    }
    catch (error) {
        console.error("Error renting book:", error.message);
        return res.status(404).json({ error: "Internal server error" });
    }
};
exports.sellBook = sellBook;
const rentedBooks = async (req, res) => {
    try {
        const userId = req.userId;
        const allBooks = await bookService.getAllBooks();
        const booksToShow = [];
        for (const book of allBooks) {
            if (book.lenderId == userId && book.isRented) {
                // const isLenderExist = await bookService.getUserById(book.lenderId);
                // if(isLenderExist && !isLenderExist.isBlocked ){
                booksToShow.push(book);
            }
            // }
        }
        return res.status(200).json(booksToShow);
    }
    catch (error) {
        console.log("Error rentedBooks:", error);
    }
};
exports.rentedBooks = rentedBooks;
const soldBooks = async (req, res) => {
    try {
        const userId = req.userId;
        const allBooks = await bookService.getAllBooks();
        const booksToShow = [];
        for (const book of allBooks) {
            if (book.lenderId == userId && book.isSell) {
                if (book.images && Array.isArray(book.images)) {
                    const imageUrls = await Promise.all(book.images.map(async (imageKey) => {
                        const getObjectParams = {
                            Bucket: config_1.default.BUCKET_NAME,
                            Key: imageKey,
                        };
                        const command = new client_s3_1.GetObjectCommand(getObjectParams);
                        return await (0, s3_request_presigner_1.getSignedUrl)(store_1.s3Client, command, {
                            expiresIn: 3600,
                        });
                    }));
                    book.images = imageUrls;
                }
                else {
                    book.images = [];
                }
                booksToShow.push(book);
            }
        }
        return res.status(200).json(booksToShow);
    }
    catch (error) {
        console.log("Error rentedBooks:", error);
    }
};
exports.soldBooks = soldBooks;
const lenderDetails = async (req, res) => {
    try {
        // const bookId = req.params.Id as string;
        // const book: IBooks | null = await bookService.getBookById(bookId);
        // if (!book) {
        //     return res.status(500).json({ message: "Book is not found " });
        // }
        // const lenderId: string = book.lenderId;
        // const lender = await bookService.getUserById(lenderId);
        return res.status(200).json({});
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.lenderDetails = lenderDetails;
const lendingProcess = async (req, res) => {
    try {
        const { cartId } = req.params;
        if (!cartId) {
            return res.status(500).json({ message: "cartId not found" });
        }
        const details = await cartService.getCartDetails(cartId);
        return res.status(200).json({ details });
    }
    catch (error) {
        console.log("Error userDetails:", error);
        return res
            .status(500)
            .json({ message: "Internal server error at userDetails" });
    }
};
exports.lendingProcess = lendingProcess;
const stripeKey = config_1.default.STRIPE_KEY;
const stripe = new stripe_1.default(stripeKey, { apiVersion: "2024-06-20" });
const createCheckout = async (req, res) => {
    const { bookTitle, totalPrice, cartId, quantity, userId, lenderId, bookId, depositAmount, totalRentalPrice, } = req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: bookTitle,
                        },
                        unit_amount: totalPrice * 100,
                    },
                    quantity: quantity,
                },
            ],
            mode: "payment",
            success_url: `${config_1.default.API}/home/payment-success?book_id=${bookId}&user_id=${userId}&cart_id=${cartId}`,
            cancel_url: `${config_1.default.API}/payment-cancel`,
        });
        res.json({ id: session.id });
        //    const sessionData = {
        //     cartId,
        //      sessionId:session.id,
        //      userId,
        //      lenderId,
        //      bookId,
        //      totalPrice,
        //      quantity,
        //      depositAmount,
        //      totalRentalPrice,
        //    };
        //    const order = await bookService.getCreateOrder(sessionData);
        //    console.log(order,'orderee')
        //    const cart = await cartService.getUpdateIsPaid(cartId)
        //    console.log(cart,'carttt')
        //    const wallet = await walletService.getCreateWalletForWebsite(cartId)
        //    console.log(wallet,'walllettt')
        //    const cart = await cartService.getUpdateIsPaid(cartId)
        //    const dataWallet ={
        //     userId,
        //     lenderId,
        //     total_amount:totalPrice,
        //     rental_amount:totalRentalPrice,
        //     deposit_amount:depositAmount,
        //    }
        //    const wallet = await walletService.getCreateWalletForWebsite(dataWallet)
    }
    catch (error) {
        console.error("Error createCheckout :", error);
        res.status(500).json({ error: error.message });
    }
};
exports.createCheckout = createCheckout;
// const createCheckout = async (req:Request,res:Response) => {
//     const { bookTitle, totalPrice,cartId, quantity, userId, lenderId, bookId, depositAmount,totalRentalPrice } = req.body;
//     try {
//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         line_items: [
//           {
//             price_data: {
//               currency: "usd",
//               product_data: {
//                 name: bookTitle,
//               },
//               unit_amount: totalPrice * 100,
//             },
//             quantity: quantity,
//           },
//         ],
//         mode: "payment",
//         success_url: `${config.API}/home/payment-success?book_id=${bookId}&user_id=${userId}&cart_id=${cartId}`,
//         cancel_url: `${config.API}/payment-cancel`,
//       });
//       res.json({ id: session.id });
//     } catch (error:any) {
//       res.status(500).json({ error: error.message });
//     }
//   };
const createOrder = async (req, res) => {
    try {
        const { userId, bookId, cartId } = req.body;
        console.log(userId, 'userid', bookId, 'bookdi', cartId, 'cartid');
        if (!userId || !bookId) {
            return res
                .status(400)
                .json({ message: "user or book id is missing" });
        }
        const cartData = await cartService.getCartById(cartId);
        if (!cartData) {
            console.log("cart is not found");
        }
        else {
            const orderData = {
                cartId: cartId,
                userId: typeof cartData?.userId === "string" ? cartData.userId : "",
                lenderId: typeof cartData?.ownerId === "string"
                    ? cartData.ownerId
                    : "",
                bookId: typeof cartData?.bookId === "string" ? cartData.bookId : "",
            };
            const order = await bookService.getCreateOrder(orderData);
            const cart = await cartService.getUpdateIsPaid(cartId);
            const wallet = await walletService.getCreateWalletForWebsite(cartId);
            res.status(200).json({ order });
        }
        //    console.log(order,'orderee')
        //  const order = await bookService.getUpdateOrder(userId,bookId)
        //  const cart = await cartService.getUpdateIsPaid(cartId)
        //    const dataWallet ={
        //     cartId,
        //     total_amount:totalPrice,
        //     rental_amount:totalRentalPrice,
        //     deposit_amount:depositAmount,
        //    }
        //    const wallet = await walletService.getCreateWalletForWebsite(cartId)
        //  res.status(200).json({order});
    }
    catch (error) {
        console.error("Error createOrder:", error);
        res.status(500).json({
            error: "An error occurred while create Order.",
        });
    }
};
exports.createOrder = createOrder;
const orders = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "user is missing" });
        }
        const orders = await bookService.getOrders(userId);
        res.status(200).json({ orders });
    }
    catch (error) {
        console.error("Error createOrder:", error);
        res.status(500).json({ error: "An error occurred getting Orders." });
    }
};
exports.orders = orders;
const search = async (req, res) => {
    const { searchQuery } = req.params;
    const booksToShow = [];
    const userId = req.userId;
    try {
        const books = await bookService.getSearchResult(searchQuery);
        for (const book of books) {
            if (book.lenderId !== userId) {
                // const isLenderExist = await bookService.getUserById(book.lenderId);
                // if(isLenderExist && !isLenderExist.isBlocked ){
                // if (book.images && Array.isArray(book.images)) {
                //     const imageUrls = await Promise.all(
                //         book.images.map(async (imageKey: string) => {
                //             const getObjectParams: GetObjectCommandInput = {
                //                 Bucket: config.BUCKET_NAME,
                //                 Key: imageKey,
                //             };
                //             const command = new GetObjectCommand(
                //                 getObjectParams
                //             );
                //             return await getSignedUrl(s3Client, command, {
                //                 expiresIn: 3600,
                //             });
                //         })
                //     );
                //     book.images = imageUrls;
                // } else {
                //     book.images = [];
                // }
                booksToShow.push(book);
            }
        }
        return res.status(200).json(booksToShow);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.search = search;
const updateOrderStatus = async (req, res) => {
    try {
        const { selectedOrderId } = req.params;
        const { isBookHandover } = req.body;
        const bookStatus = isBookHandover;
        if (!selectedOrderId) {
            return res.status(400).json({ message: "Order ID is missing" });
        }
        const order = await bookService.getUpdateOrderStatus(selectedOrderId, bookStatus);
        res.status(200).json({ order });
    }
    catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({
            error: "An error occurred updating the order status.",
        });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const OrderToShowSuccess = async (req, res) => {
    try {
        const { userId, bookId } = req.query;
        console.log(userId, "userId", bookId, "bokid");
        if (!userId || !bookId) {
            return res
                .status(400)
                .json({ message: "user or book id is missing" });
        }
        const order = await bookService.getOrderToShowSuccess(userId, bookId);
        res.status(200).json({ order });
    }
    catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({
            error: "An error occurred updating the order status.",
        });
    }
};
exports.OrderToShowSuccess = OrderToShowSuccess;
//# sourceMappingURL=bookController.js.map