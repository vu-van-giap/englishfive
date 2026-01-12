//models vocabModel.js
const { ObjectId } = require('mongodb');
const topicsConfig = require('../config/topics.js'); // Danh sách chủ đề + ảnh
const validTopics = topicsConfig.map(t => t.value);

/**
 * Hàm khởi tạo Model Vocab
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {{
 * createVocab: Function,
 * getAllVocabs: Function,
 * getVocabById: Function,
 * getVocabsByTopic: Function,
 * searchVocabs: Function,
 * updateVocab: Function,
 * deleteVocab: Function,
 * ensureIndexes: Function
 * }}
 */

async function vocabModel(fastify) {
    //Lấy collection mỗi lần gọi (để tránh require lúc fastify chuwq init)
        if (!fastify || !fastify.mongo || !fastify.mongo.db) {
            throw new Error('vocabModel: fastify.mongodb chưa được khởi tạo');
        }

        const collection = fastify.mongo.db.collection('vocab');    
    
    // Helper: validate ObjectId
    const isValidId = (id) =>  ObjectId.isValid(id);

    // Helper :chuẩn hóa dữ liệu input
    const normalizeInput = (data = {}) => {
    if (!data || typeof data !== 'object') {
        throw new Error('Dữ liệu đầu vào không hợp lệ');
    }
    const word = data.word ? String(data.word).trim() : '';
    const meaning = data.meaning ? String(data.meaning).trim() : '';
    const partOfSpeech = data.partOfSpeech ? String(data.partOfSpeech).trim() : '';
    const pronunciation = data.pronunciation ? String(data.pronunciation).trim() : '';
    const examples = Array.isArray(data.examples) ? data.examples.map(ex => String(ex).trim()).filter(ex => ex) : [];
    
    // Validate và chuẩn hóa topic
    let topic = data.topic !== undefined && data.topic !== null ? String(data.topic).trim().toLowerCase() : 'general';
    if (!validTopics.includes(topic)) {
        topic = 'general'; // fallback nếu không hợp lệ
    }

    const level = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'other'].includes(data.level) ? data.level : 'other';
    const tags = Array.isArray(data.tags) ? data.tags.map(tag => String(tag).trim()).filter(tag => tag) : [];
    
    return { word, meaning, partOfSpeech, pronunciation, examples, topic, level, tags };
};

    return {
        /**
        * Tạo vocab mới
        * @param {{word: string, meaning: string, partOfSpeech?: string, pronunciation?: string, examples?: string[], topic?: string, lever?: string, tags?: string[]}} data
        * @returns {Promise<ObjectId>}        
        */
       async createVocab(data) {
        try {
            const { word, meaning, partOfSpeech, pronunciation, examples, topic, level, tags } = normalizeInput(data);

        //Validate cơ bản
        if (!word) {
            const e = new Error('Trường "word" là bắt buộc');
            e.statusCode = 400;
            throw e;
        }
        if (!meaning) {
            const e = new Error('Trường "meaning" là bắt buộc');
            e.statusCode = 400;
            throw e;
        }

        const doc = {
            word,
            meaning,
            partOfSpeech: partOfSpeech || null,
            pronunciation: pronunciation || null,
            examples,
            topic,
            level,
            tags,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await collection.insertOne(doc);
        fastify.log.info(`vocab created id=${result.insertedId}`);
        return result.insertedId; 
       } catch (err) {
        fastify.log.error('lỗi createVocab:', err);
        throw err;
       }
    },

    /**
     * Lấy danh sách vocab với pagination và sorting
     * @param {{page?: number, limit?: number, sort?: object}} options
     * @return {Promise<{items: Array, total: number, page: number, limit: number}>}
     */
    async getAllVocabs(options = {}) {
      try {
        const page = Math.max(1, parseInt(options.page ?? 1, 10));
        const limit = Math.min(100, Math.max(1, parseInt(options.limit ?? 20, 10))); // Giới hạn 100
        const skip = (page - 1) * limit;
        const sort = options.sort || { createdAt: -1 };
        const cursor = collection.find({}).sort(sort).skip(skip).limit(limit);
        const items = await cursor.toArray();
        const total = await collection.countDocuments({});
        return { items, total, page, limit };
      } catch (err) {
        fastify.log.error('Lỗi getAllVocab :', err);
        throw err;
      }
    },
    
    /**
     * Lấy 1 vocab theo id
     * @param {string} id
     * @return {Promise<Object|null>}
     */
    async getVocabById(id) {
        try {
            if (!isValidId(id)) return null;
            const doc = await collection.findOne({ _id: new ObjectId(id) });
            if (doc) {
                doc._id = doc._id.toString();
            }
            return doc;
        }   catch (err) {
            fastify.log.error('Lỗi getVocabById:', err);
            throw err;
        }
    },

    /**
     * Lasays vocab theo topic
     * @param {string} topic
     * @return {Promise<Array>}
     */
    async getVocabsByTopic(topic) {  
        try {
            return await collection.find({ topic }).sort({ createdAt: -1 }).toArray();
        } catch (err) {
            fastify.log.error('Lỗi getVocabByTopic:', err);
            throw err;  
        }
    },

    /**
     * Tìm kiếm vocab theo word/meaning (partial, case-insensitive)
     * Hỗ trợ pagination
     * @param {{q: string, page?: number, limit?: number}} params      
     */
    async searchVocabs(params = {}) {
        try {
            const q = params.q ? String(params.q).trim() : '';
            const page = Math.max(1, parseInt(params.page ?? 1, 10));
            const limit = Math.min(100, Math.max(1, parseInt(params.limit ?? 20, 10)));
            const skip = (page - 1) * limit;
            
            if (!q) {
                const items = await collection.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
                const total = await collection.countDocuments({});
                return { items, total, page, limit };
            }

            // Sử dụng regex để tìm kiếm partial, case-insensitive ( escape ký tự đặc biệt)
            const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedQ, 'i');
            const  filter = { $or: [ { word: regex }, { meaning: regex } ] };
            const curor = await collection.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
            const items = await curor.toArray();
            const total = await collection.countDocuments(filter);
            return { items, total, page, limit };
        } catch (err) {
            fastify.log.error('Lỗi searchVocab:', err);
            throw err;
        }
    },
    
    /**
     * Cập nhật vocab (partial update)
     * @param {string} id
     * @parma {object} data
     * @return {Promise<boolean>} true nếu có cập nhật, false nếu không tìm thấy
     */
    async updateVocab(id, data) {
        try {
            if (!isValidId(id)) {
                const e = new Error('Id không hợp lệ');
                e.statusCode = 400;
                throw e;
            }

            const update ={};
            const nomalized = normalizeInput(data);
            if (nomalized.word) update.word = nomalized.word;
            if (nomalized.meaning) update.meaning = nomalized.meaning;
            if (ObjectId.prototype.hasOwnProperty.call(data, 'partOfSpeech')) update.partOfSpeech = nomalized.partOfSpeech || null;
            if (Object.prototype.hasOwnProperty.call(data, 'pronunciation')) update.pronunciation = nomalized.pronunciation || null;
            if (Object.prototype.hasOwnProperty.call(data, 'examples')) update.examples = nomalized.examples;
            if (Object.prototype.hasOwnProperty.call(data, 'topic')) update.topic = nomalized.topic;
            if (Object.prototype.hasOwnProperty.call(data, 'level')) update.level = nomalized.level;
            if (Object.prototype.hasOwnProperty.call(data, 'tags')) update.tags = nomalized.tags;
            if (Object.keys(update).length ===0) {
                //Không có trường để cập nhập
                return false;
            }

            update.updatedAt = new Date();
            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: update }
            );
            fastify.log.info(`vocab cập nhập id=${id} modified=${result.modifiedCount}`);
            return result.modifiedCount > 0;
        }catch (err) {
            fastify.log.error('Lỗi updateVocab:', err);
            throw err;
        }
    },

    /**
     * Xóa vocab
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    
    async deleteVocab(id) {
    try {
        // Nếu id là object, lấy id.toString()
        const idStr = typeof id === 'string' ? id : id.toString();

        if (!isValidId(idStr)) {
            const e = new Error('Id không hợp lệ');
            e.statusCode = 400;
            throw e;
        }

        const result = await collection.deleteOne({ _id: new ObjectId(idStr) });
        fastify.log.info(`vocab xóa id=${idStr} deleted=${result.deletedCount}`);
        return result.deletedCount > 0;
    } catch (err) {
        fastify.log.error('Lỗi deleteVocab:', err);
        throw err;
    }
},

    /**
     * Tạo index để tăng tốc tìm kiếm (gọi 1 lần khi app start)
     * @returns {Promise<void>}
     */
    async ensureIndexes() {
        try {
            // Index cho word và topic
            await collection.createIndex({ word: 1 }, { background: true });
            await collection.createIndex({ topic: 1 }, { background: true });
            await collection.createIndex({ level: 1 }, { background: true });
            // Text index cho tìm kiếm word và meaning
            await collection.createIndex({ word: 'text', meaning: 'text' }, { background: true });
            fastify.log.info('Các chỉ mục vocab được đảm bảo');
        } catch (err) {
            fastify.log.error('Lỗi ensureIndexes:', err);
            // Không ném để khoongh block startup nếu index create fail        
        }
    },
    };
}

module.exports = vocabModel;
