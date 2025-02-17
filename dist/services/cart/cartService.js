"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
class CartService {
    constructor(cartRepository) {
        this.cartRepository = cartRepository;
    }
    async getCreateCart(data) {
        try {
            return await this.cartRepository.findCreatCart(data);
        }
        catch (error) {
            console.log("Error getCreateCart:", error);
            throw error;
        }
    }
    async getCartById(cartId) {
        try {
            return await this.cartRepository.findCartById(cartId);
        }
        catch (error) {
            console.log("Error getCartById:", error);
            throw error;
        }
    }
    async getUpdateCart(cartId, types) {
        try {
            return await this.cartRepository.findUpdateCart(cartId, types);
        }
        catch (error) {
            console.log("Error getUpdateCart:", error);
            throw error;
        }
    }
    async getCartDetails(cartId) {
        try {
            return await this.cartRepository.findCartDetails(cartId);
        }
        catch (error) {
            console.log("Error getCartDetails:", error);
            throw error;
        }
    }
    async getUpdateIsPaid(cartId) {
        try {
            return await this.cartRepository.findUpdateIsPaid(cartId);
        }
        catch (error) {
            console.log("Error getUpdateIsPaid:", error);
            throw error;
        }
    }
    async getIsOrderExistByCart(cartId) {
        try {
            return await this.cartRepository.findIsOrderExistByCart(cartId);
        }
        catch (error) {
            console.log("Error getIsOrderExistByCart:", error);
            throw error;
        }
    }
}
exports.CartService = CartService;
//# sourceMappingURL=cartService.js.map