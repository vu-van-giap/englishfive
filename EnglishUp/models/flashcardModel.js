//models flashcardModel.js
const { ObjectId } = require('mongodb');

/**
 * Hàm khởi tạo Model Flashcard
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {{
 * createFlashcard: Function,
 * getAllFlashcards: Function,
 * getFlashcardById: Function,
 * getFlashcardsByTopic: Function,
 * searchFlashcards: Function,
 * updateFlashcard: Function,
 * deleteFlashcard: Function,
 * ensureIndexes: Function
 * }}
 */

async function flashcardModel(fastify) {
    //Lấy collection mỗi lần gọi (để tránh require lúc fastify chưa init)
        if (!fastify || !fastify.mongo || !fastify.mongo.db) {
            throw new Error('flashcardModel: fastify.mongodb is not initialized');
        }

        const collection = fastify.mongo.db.collection('flashcard');    
    
    // Helper: validate ObjectId
    const isValidId = (id) =>  ObjectId.isValid(id);

    // Helper :chuẩn hóa dữ liệu input
    const normalizeInput = (data ={}) => {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid input data');
        }
        const front = data.front ? String(data.front).trim() : '';
        const back = data.back ? String(data.back).trim() : '';
        const topic = (data.topic === null || data.topic === undefined) ? null : String(data.topic).trim();
        if (topic === '') return { front, back, topic: null };
        return { front, back, topic };
    }; 

    return {
        /**
        * Tạo flashcard mới
        * @param {{front: string, back: string, topic?: string}} data
        * @returns {Promise<ObjectId>}        
        */
       async createFlashcard(data) {
        try {
            const { front, back, topic } = normalizeInput(data);
            if (!front || !back) {
                throw new Error('Front and back are required');
            }
            const doc = {
                front,
                back,
                topic,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await collection.insertOne(doc);
            return result.insertedId;
        } catch (err) {
            throw err;
        }
       },

       /**
        * Lấy tất cả flashcards với pagination
        * @param {{page: number, limit: number}} options
        * @returns {Promise<{data: Array, total: number, page: number, limit: number}>}
        */
       async getAllFlashcards({ page = 1, limit = 20 } = {}) {
        try {
            const skip = (page - 1) * limit;
            const total = await collection.countDocuments();
            const data = await collection.find({}).skip(skip).limit(limit).toArray();
            return { data, total, page, limit };
        } catch (err) {
            throw err;
        }
       },

       /**
        * Lấy flashcard theo ID
        * @param {string} id
        * @returns {Promise<Object|null>}
        */
       async getFlashcardById(id) {
        try {
            if (!isValidId(id)) {
                throw new Error('Invalid flashcard ID');
            }
            return await collection.findOne({ _id: new ObjectId(id) });
        } catch (err) {
            throw err;
        }
       },

       /**
        * Lấy flashcards theo topic
        * @param {string} topic
        * @param {{page: number, limit: number}} options
        * @returns {Promise<{data: Array, total: number, page: number, limit: number}>}
        */
       async getFlashcardsByTopic(topic, { page = 1, limit = 20 } = {}) {
        try {
            const skip = (page - 1) * limit;
            const query = { topic: topic };
            const total = await collection.countDocuments(query);
            const data = await collection.find(query).skip(skip).limit(limit).toArray();
            return { data, total, page, limit };
        } catch (err) {
            throw err;
        }
       },

       /**
        * Tìm kiếm flashcards theo front hoặc back
        * @param {string} query
        * @param {{page: number, limit: number}} options
        * @returns {Promise<{data: Array, total: number, page: number, limit: number}>}
        */
       async searchFlashcards(query, { page = 1, limit = 20 } = {}) {
        try {
            const skip = (page - 1) * limit;
            const searchRegex = new RegExp(query, 'i');
            const searchQuery = {
                $or: [
                    { front: searchRegex },
                    { back: searchRegex }
                ]
            };
            const total = await collection.countDocuments(searchQuery);
            const data = await collection.find(searchQuery).skip(skip).limit(limit).toArray();
            return { data, total, page, limit };
        } catch (err) {
            throw err;
        }
       },

       /**
        * Cập nhật flashcard
        * @param {string} id
        * @param {{front?: string, back?: string, topic?: string}} data
        * @returns {Promise<boolean>}
        */
       async updateFlashcard(id, data) {
        try {
            if (!isValidId(id)) {
                throw new Error('Invalid flashcard ID');
            }
            const updateData = normalizeInput(data);
            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { ...updateData, updatedAt: new Date() } }
            );
            return result.modifiedCount > 0;
        } catch (err) {
            throw err;
        }
       },

       /**
        * Xóa flashcard
        * @param {string} id
        * @returns {Promise<boolean>}
        */
       async deleteFlashcard(id) {
        try {
            if (!isValidId(id)) {
                throw new Error('Invalid flashcard ID');
            }
            const result = await collection.deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch (err) {
            throw err;
        }
       },

       /**
        * Đảm bảo indexes
        */
       async ensureIndexes() {
        try {
            await collection.createIndex({ userId: 1 });
            await collection.createIndex({ topic: 1 });
            await collection.createIndex({ front: 'text', back: 'text' });
        } catch (err) {
            throw err;
        }
       }
    };
}

module.exports = flashcardModel;