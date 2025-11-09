import mongoose from 'mongoose'

// Schema for link tracking
const linkTrackingSchema = new mongoose.Schema({
    linkId: {
        type: String,
        required: true
    },
    originalUrl: {
        type: String,
        required: true
    },
    clicked: {
        type: Boolean,
        default: false
    },
    clickedAt: {
        type: Date,
        default: null
    }
}, { _id: false })

// Main tracking schema
const emailTrackingSchema = new mongoose.Schema({
    trackingId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    recipient: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        index: true
    },
    messageId: {
        type: String,
        default: null
    },
    opened: {
        type: Boolean,
        default: false
    },
    openedAt: {
        type: Date,
        default: null
    },
    links: {
        type: Map,
        of: linkTrackingSchema,
        default: new Map()
    },
    sentAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
})

// Create model
const EmailTracking = mongoose.model('EmailTracking', emailTrackingSchema)

export default EmailTracking

