const connectToMongo = require('../utils/db');

exports.handleConversation = async (req, res) => {
    const { action, sessionId, name, email } = req.body;

    try {
        const db = await connectToMongo();
        const collection = db.collection('conversation');
        const messageCollection = db.collection('messages');
        switch (action) {
            case 'add': {
                if (!sessionId || !name) {
                    return res.status(400).json({ error: 'Session ID, name, and email are required' });
                }

                const exists = await collection.findOne({ sessionId });
                if (exists) {
                    return res.status(200).json({ message: 'Session already exists', session: exists });
                }

                const result = await collection.insertOne({
                    sessionId,
                    name,
                     ...(email && { email }),
                    createdAt: new Date()
                });

                return res.status(201).json({ message: 'Session added', id: result.insertedId });
            }

            case 'get': {
                const conversation = await collection.find({}).sort({ createdAt: -1 }).toArray();
                return res.status(200).json({
                    message: 'All sessions retrieved',
                    conversation
                });
            }

            case 'getMessages': {
                if (!sessionId) {
                    return res.status(400).json({ error: 'Session ID is required' });
                }

                const messages = await messageCollection.find({ sessionId }).sort({ timestamp: 1 }).toArray();
                return res.status(200).json({
                    message: 'Messages retrieved successfully',
                    messages
                });
            }
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Error in session controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
