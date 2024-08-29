import { user, IUser } from "../model/userModel";
import { admin } from "../model/adminModel";
import { userData } from "../utils/ReuseFunctions/interface/data";
import {User,ChatRoom, Requests, Order } from "../interfaces/data";
import {orders,IOrder} from '../model/orderModel'
import { Books } from "../interfaces/data";
import { books, IBooks } from "../model/bookModel";
import { genres } from "../model/genresModel";
import { notification, INotification } from "../model/notificationModel";
import { Notification } from "../interfaces/data";
import mongoose from 'mongoose';
import {
    GetObjectCommand,
    GetObjectCommandInput,

} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import config from "../config/config";
import { s3Client } from "../utils/imageFunctions/store";
import {IMessage } from "../model/message";
import {chatRoom,IChatRoom} from '../model/chatRoom'
import {message} from "../model/message";
import { requests,IRequests } from "../model/requests";
import { TrustedAdvisor } from "aws-sdk";

export class UserRepository {
    async findUserByEmail(email: string): Promise<IUser | null> {
        try {
            return await user.findOne({ email });
        } catch (error) {
            console.log("Error findUserByEmail:", error);
            throw error;
        }
    }

    async findByGmail(email: string): Promise<IUser | null> {
        try {
            return await user.findOne({ email, isGoogle: true });
        } catch (error) {
            console.log("Error findByGmail:", error);
            throw error;
        }
    }

    async findUpdateIsGoogleTrue(email:string){
        try{
            return await user.findOneAndUpdate({email:email},{isGoogle:true,password:null},{new:true})
        }catch(error:any){
            console.log("Error findUpdateIsGoogleTrue:",error)
            throw error
        }
    }

  

 

    async createUser(data: Partial<User>): Promise<IUser | null> {
        try {
            return new user({
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password,
            }).save();
        } catch (error) {
            console.log("Error createUser:", error);
            throw error;
        }
    }
    async findByUserName(name: string): Promise<IUser | null> {
        try {
            return user.findOne({ name });
        } catch (error) {
            console.log("Error findByUserName:", error);
            throw error;
        }
    }

    async createUserByGoogle(data: User): Promise<IUser | null> {
        try {
            return new user({
                name: data.name,
                email: data.email,
                image: data.image,
                isGoogle: true,
            }).save();
        } catch (error) {
            console.log("Error createUserByGoogle:", error);
            throw error;
        }
    }

    async updatePassword(data: User): Promise<IUser | null> {
        try { 
            return await user.findOneAndUpdate(
                { email: data.email },
                { $set: { password: data.password ,resetToken:undefined,resetTokenExpiration:undefined} }
            );
        } catch (error) {
            console.log("Error updatePassword:", error);
            throw error;
        }
    }
    async addToBookRent(bookRentData: Books): Promise<IBooks | null> {
        try {
            return new books({
                bookTitle: bookRentData.bookTitle,
                description: bookRentData.description,
                author: bookRentData.author,
                publisher: bookRentData.publisher,
                publishedYear: bookRentData.publishedYear,
                genre: bookRentData.genre,
                images: bookRentData.images,
                rentalFee: bookRentData.rentalFee,
                extraFee:bookRentData.extraFee,
                address: {
                    street: bookRentData.address?.street || "",
                    city: bookRentData.address?.city || "",
                    district: bookRentData.address?.district || "",
                    state: bookRentData.address?.state || "",
                    pincode: bookRentData.address?.pincode || "",
                },
                isRented: true,
                quantity:bookRentData.quantity,
                maxDistance:bookRentData.maxDistance,
                maxDays:bookRentData.maxDays,
                minDays:bookRentData.minDays,
                lenderId: bookRentData.lenderId,
                latitude:bookRentData.latitude,
                longitude:bookRentData.longitude
            }).save();
        } catch (error) {
            console.log("Error addToBookRent:", error);
            throw error;
        }
    }
    async findUserById(_id: string): Promise<IUser | null> {
        try {    
            const lender = await user.findById(_id);
            return lender
         
        } catch (error) {
            console.log("Error findUserById:", error);
            throw error;
        }
    }
    async findAllGenres() {
        try {
            return await genres.find();
        } catch (error) {
            console.log("Error findAllGenres:", error);
            throw error;
        }
    }
    async findAllBooks() {
        try {
            return await books.find();
        } catch (error) {
            console.log("Error findAllGenres:", error);
            throw error;
        }
    }
    async updateUser(userId:string,filteredUser: User): Promise<IUser | null> {
        try {
           
            const userToUpdate: IUser | null = await this.findUserById(userId)

            if (!userToUpdate) {
                console.log("Error finding the user to update:");
                return null;
            }else{
                
                const updateFields: Partial<IUser> = {
                    name: filteredUser.name || userToUpdate.name,
                    email: filteredUser.email || userToUpdate.email,
                    phone: filteredUser.phone || userToUpdate.phone,
                 
                    address: {
                        street: filteredUser.address?.street || userToUpdate.address?.street,
                        city: filteredUser.address?.city || userToUpdate.address?.city,
                        district: filteredUser.address?.district || userToUpdate.address?.district,
                        state: filteredUser.address?.state || userToUpdate.address?.state,
                        pincode: filteredUser.address?.pincode || userToUpdate.address?.pincode,
                    }
                };
                const updatedUser = await user.findByIdAndUpdate(
                    userId,
                    updateFields,
                    { new: true }
                );
    
                if (!updatedUser) {
                    console.log("Error updating the user:");
                    return null;
                }
                return updatedUser;
            }
        } catch (error) {
            console.log("Error findAllGenres:", error);
            throw error;
        }
    }
    async addToBookSell(bookSelldata: Books): Promise<IBooks | null> {
        try {
            return await new books({
                bookTitle: bookSelldata.bookTitle,
                description: bookSelldata.description,
                author: bookSelldata.author,
                publisher: bookSelldata.publisher,
                publishedYear: bookSelldata.publishedYear,
                genre: bookSelldata.genre,
                images: bookSelldata.images,
                price: bookSelldata.price,
                address: {
                    street: bookSelldata.address?.street || "",
                    city: bookSelldata.address?.city || "",
                    district: bookSelldata.address?.district || "",
                    state: bookSelldata.address?.state || "",
                    pincode: bookSelldata.address?.pincode || "",
                },
                isSell: true,
                lenderId: bookSelldata.lenderId,
                latitude:bookSelldata.latitude,
                longitude:bookSelldata.longitude,

            }).save();
        } catch (error) {
            console.log("Error addToBookSell:", error);
            throw error;
        }
    }
    async findBook(bookId: string): Promise<IBooks | null> {
        try {
            const book:IBooks | null = await books.findById(bookId);
            if (!book) {
                console.log(`Book with ID ${bookId} not found.`);
                return null;
            }
    
                if (book.images && Array.isArray(book.images)) {
                    const imageUrls = await Promise.all(
                        book.images.map(async (imageKey: string) => {
                            const getObjectParams: GetObjectCommandInput = {
                                Bucket: config.BUCKET_NAME,
                                Key: imageKey,
                                
                            };
                            const command = new GetObjectCommand(getObjectParams);
                            return await getSignedUrl(s3Client, command, {
                                expiresIn: 3600,
                            });
                        })
                    );
                    book.images = imageUrls;
                } else {
                    book.images = [];
                }
    
            return book
        } catch (error: any) {
            console.log("Error findBook:", error);
            throw error
        }
    }

    async addSaveRequest(data:Requests):Promise<IRequests | null>{
        try{
            return await new requests({senderId:data.senderId,receiverId:data.receiverId,bookId:data.bookId,types:data.types ,totalDays:data.totalDays,
                quantity:data.quantity,
                totalRentalPrice:data.totalRentalPrice,}).save()
        }catch(error){
            console.log("Error addSaveRequest:",error);
            throw error;
        }
    }
    async createNotification(
        data: Partial<Notification>
    ): Promise<INotification | null> {
        try {
            console.log(data.bookId)
            return new notification({
                senderId: data.senderId,
                receiverId: data.receiverId,
                bookId: data.bookId,
                type: data.type,
                content: data.content,
                requestId:data.requestId
            }).save();
        } catch (error) {
            console.log("Error createUser:", error);
            throw error;
        }
    }

    async notificationsByUserId(userId: string): Promise<INotification[]> {
        try {
            const notifications =  await notification.find({ receiverId: new mongoose.Types.ObjectId(userId) })
            .populate('senderId')
            .populate('receiverId')
            .populate('bookId')
            .populate('requestId');
            
            return notifications
        } catch (error) {
          console.log("Error notificationsByUserId:", error);
          throw error;
        }
      }
      async activeUsers () {
       try{
        const users = await user.find({isBlocked: false })
        return users
       }catch(error:any){
        console.log("Error getActiveUsers:", error);
          throw error;
       }
    };

    async createChatRoom(senderId:string,receiverId:string): Promise<IChatRoom | null> {
        try {
            const chatRoomCreated = await new chatRoom({
                 senderId,
                 receiverId,
            }).save();
            console.log(chatRoomCreated,'chatRoom created')
            return chatRoomCreated;
        } catch (error) {
            console.log("Error createMessage:", error);
            throw error;
        }
    }

    async MessagesList(userId:string):Promise<IChatRoom[] | null>{
        try{
            const chatRooms = await chatRoom.find({
                $or: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            })            
            .populate('receiverId', 'name email image')
            .populate('senderId', 'name email image')
            .exec();
        
           return chatRooms;
        }catch(error){
            console.log("Error MessagesList:",error)
            throw error
        }
    }
    async findUserChat(chatRoomId:string){
        try{
            return await chatRoom.findById({_id:chatRoomId})
            .populate('receiverId','name image')
            .populate('senderId','name image')
            .exec()
        }catch(error){
            console.log("Error findUpdateMessagesList:",error)
            throw error
        }
    }
    async createSendMessage(senderId:string,receiverId:string,content:string,chatRoomId:string):Promise<IMessage | null>{
        try{
 
            const saveMessage = await new message({
                senderId,receiverId,content,chatRoomId
            }).save();
          
            return saveMessage
        }catch(error){
            console.log("Error findSendMessage:",error)
            throw error
        }
    }

    async updateChatRoom(chatRoomId:string,messageId:string){
        try{
            return await chatRoom.findByIdAndUpdate(
                chatRoomId,
                { $push: { messageId: messageId } },
                { new: true }
            );
        }catch(error){
            console.log("Erro updateChatroom:",error);
            throw error;
        }
    }

    async findMessage(messageId:string):Promise<IMessage[] | null>{
        try{
      
            return await message.findById({_id:messageId});
           
        }catch(error){
            console.log("Erro updateChatroom:",error);
            throw error;
        }
    }
    
    async findAllMessages(chatRoomId: string): Promise<IChatRoom | null> {
        try {
            return await chatRoom.findById(chatRoomId)
                .populate({
                    path: 'messageId',
                    select: 'content senderId receiverId createdAt',
                    populate: {
                        path: 'senderId receiverId',
                        select: 'name image', 
                    }
                });
        } catch (error) {
            console.log("Error finding all messages:", error);
            throw error;
        }
    }
    
    
    async updateNotificationType(notificationId:string){
        try{
            const update= await notification.findByIdAndUpdate(notificationId,{isAccepted:true},{new:true})
            return update
        }catch(error){
            console.log("Error updateNotificationType:",error)
            throw error;
        }
    }

    async findChatRoom(userId: string, receiverId: string): Promise<IChatRoom | null> {
        try {
            return await chatRoom.findOne({
                $or: [
                    { senderId: userId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: userId }
                ]
            });
        } catch (error) {
            console.log("Error finding chat room:", error);
            throw error;
        }
    }

  
    
    // async messages(userId:string): Promise<IMessage[] | null>{
    //     try{
           
    //          return messages
    //     }catch(error){
    //         console.log("Error messages:",error)
    //         throw error
    //     }
    // }

    async updateProfileImage(userId:string,imageUrl:string): Promise<IUser | null> {
        try{
            return await user.findByIdAndUpdate(userId,{image:imageUrl},{new:true})
           
        }catch(error){
            console.log("Error updateProfileImage:",error)
            throw error
        }
    }

    async deleteUserImage(userId:string):Promise<IUser | null>{
        try{
            return await user.findByIdAndUpdate(userId,{$unset: {image: ""}},{new:true});
        }catch(error){
            console.log("Error deleteUserImage:",error)
            throw error
        }
    }

    async findCheckRequest(userId: string, bookId: string): Promise<boolean> {
        try {
            // console.log(userId,'usreId',bookId,'bookid')
            const existingRequest = await requests.findOne({ senderId:userId, bookId:bookId ,types: "requested"});
        //    console.log(existingRequest,'existingRequest')
     
            return !!existingRequest
        } catch (error) {
            console.log("Error getCheckRequest:", error);
            throw error;
        }
    }

    async findCheckAccept(userId: string, bookId: string): Promise<boolean> {
        try {
           
            const existingAccepted = await notification.find({ userId:userId, bookId:bookId ,type:"Accepted"});
            console.log(existingAccepted,'existingAccepted')
            return existingAccepted.length>0;
        } catch (error) {
            console.log("Error getCheckRequest:", error);
            throw error;
        }
    }
    async saveToken(userId:string,resetToken:string,resetTokenExpiration:number){
        try{
            return await user.findByIdAndUpdate(userId,{resetToken,resetTokenExpiration},{new:true})
        }catch(error){
            console.log('Error saveToken:',error)
            throw error
        }
    }

    async updateIsGoogle(gmail:string,resetToken:string,resetTokenExpiration:number){
        try{
            const update = await user.findOneAndUpdate({email:gmail},{isGoogle:false,resetToken:null,resetTokenExpiration:null},{new:true})
            console.log(update,'update')
            return update
        }catch(error){
            console.log("Error updateIsGoogle:",error)
            throw error
        }
    }

    async findRequestById(requestId:string){
        try{
            const request = await requests.findById({_id:requestId})
            console.log(request,'request')
            return request
        }catch(error){
            console.log("Error findRequestById:",error)
            throw error
        }
    }

    async findAcceptRequest(requestId:string,types:string){
        try{
            const request = await requests.findByIdAndUpdate({_id:requestId},{types:types},{new:true})
            console.log(request,'acpet')
            return request
        }catch(error){
            console.log("Error findAcceptRequest:",error)
            throw error
        }
    }
    async findRequestDetails(requestId:string){
        try{
            const details = await requests.findById({_id:requestId})
            .populate('bookId')
            .populate('receiverId')
            return details
        }catch(error){
            console.log("Error findRequestDetails:",error)
            throw error
        }
    }
    async findCreateOrderProcess(data:Order){
        try{
            const order = await new orders({
                sessionId:data.sessionId,
                bookId:data.bookId,
                userId:data.userId,
                totalPrice:data.totalPrice,
                lenderId:data.lenderId,
                quantity:data.quantity,
                depsoitAmount:data.depositAmount,
                
            }).save()
           
            return order
        }catch(error){
            console.log("Error findCreateOrderProcess:",error)
            throw error
        }
    }
    async findCreateOrder(userId:string,bookId:string){
        try{
          
            const order = await orders.findOneAndUpdate({userId:userId,bookId:bookId},{
                isSuccessfull:true,
                isMoneyTransactionStatus:"sent_to_website",
                isTrasaction: ["pending"], 
            },{new:true})
            .populate('bookId')    
            .populate('userId')  
            .populate('lenderId'); 
           
            return order
        }catch(error){
            console.log("Error findCreateOrder:",error)
            throw error
        }
    }

    async findOrders(userId:string){
        try{
            const order = await orders.find({userId:userId})
            .populate('bookId')    
            .populate('userId')  
            .populate('lenderId'); 
           console.log(order,'o')
            return order
        }catch(error){
            console.log("Error findOrders:",error)
            throw error
        }
    }

    async findUpdateRequest(requestId:string){
        try{
            const update = await requests.findByIdAndUpdate({_id:requestId},{isPaid:true},{new:true})
      
            return update
        }catch(error){
            console.log("Error findUpdateRequest:",error)
            throw error
        }
    }
}
