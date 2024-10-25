"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRepository = exports.chatRepository = exports.notificationRepository = exports.adminRepository = exports.walletRepository = exports.bookRepository = exports.userRepository = void 0;
const userRepository_1 = require("./user/userRepository");
const bookRepository_1 = require("./book/bookRepository");
const walletRepository_1 = require("./wallet/walletRepository");
const adminRespository_1 = require("./admin/adminRespository");
const chatRepository_1 = require("./chat/chatRepository");
const notificationRepository_1 = require("./notification/notificationRepository");
const cartRepository_1 = require("./cart/cartRepository");
const userRepository = new userRepository_1.UserRepository();
exports.userRepository = userRepository;
const bookRepository = new bookRepository_1.BookRepository();
exports.bookRepository = bookRepository;
const walletRepository = new walletRepository_1.WalletRepository();
exports.walletRepository = walletRepository;
const adminRepository = new adminRespository_1.AdminRepository();
exports.adminRepository = adminRepository;
const notificationRepository = new notificationRepository_1.NotificationRepository();
exports.notificationRepository = notificationRepository;
const chatRepository = new chatRepository_1.ChatRepository();
exports.chatRepository = chatRepository;
const cartRepository = new cartRepository_1.CartRepository();
exports.cartRepository = cartRepository;
//# sourceMappingURL=index.js.map