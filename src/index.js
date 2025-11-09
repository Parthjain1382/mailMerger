import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import express from 'express'
import Handlebars from 'handlebars'
import crypto from 'crypto'
import mongoose from 'mongoose'
import EmailTracking from '../DataBase/trackingSchema.js'
import {emailTemplateHTML} from '../DataBase/emailTemplate.js'
import { recruiterData } from '../DataBase/recruiterData.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// In-memory storage for tracking data (fallback if MongoDB not available)
const trackingData = new Map()

// MongoDB connection
let useMongoDB = false
if (process.env.MONGO_URL) {
    mongoose.connect(process.env.MONGO_URL)
        .then(() => {
            console.log('✅ Connected to MongoDB Atlas')
            useMongoDB = true
        })
        .catch((error) => {
            console.error('❌ MongoDB connection error:', error.message)
            console.log('⚠️  Falling back to in-memory storage')
            useMongoDB = false
        })
} else {
    console.log('⚠️  MONGO_URL not set, using in-memory storage')
}

// Register Handlebars helper to access properties with spaces dynamically
Handlebars.registerHelper('get', function(obj, prop) {
    return obj[prop]
})

// Helper function to generate unique tracking ID
function generateTrackingId() {
    return crypto.randomBytes(16).toString('hex')
}

// Tracking endpoint for email opens (1x1 pixel)
app.get('/track/open/:trackingId', async (req, res) => {
    const { trackingId } = req.params
    
    // Log all requests to this endpoint for debugging
    console.log(`🔍 Tracking pixel requested for ID: ${trackingId}`)
    
    try {
        let tracking
        if (useMongoDB) {
            tracking = await EmailTracking.findOne({ trackingId })
        } else {
            tracking = trackingData.get(trackingId)
        }
        
        if (tracking) {
            if (!tracking.opened) {
                tracking.opened = true
                tracking.openedAt = new Date()
                
                if (useMongoDB) {
                    await tracking.save()
                }
                
                console.log(`📧 Email opened: ${tracking.recipient} (${tracking.email}) at ${tracking.openedAt}`)
            } else {
                console.log(`📧 Email opened again (already tracked): ${tracking.recipient} (${tracking.email})`)
            }
        } else {
            console.log(`⚠️  Tracking ID not found: ${trackingId}`)
        }
    } catch (error) {
        console.error('Error tracking email open:', error.message)
    }
    
    // Return 1x1 transparent pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': pixel.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    })
    res.end(pixel)
})

// Tracking endpoint for link clicks
app.get('/track/click/:trackingId/:linkId', async (req, res) => {
    const { trackingId, linkId } = req.params
    
    try {
        let tracking
        if (useMongoDB) {
            tracking = await EmailTracking.findOne({ trackingId })
        } else {
            tracking = trackingData.get(trackingId)
        }
        
        if (tracking && tracking.links && tracking.links.get && tracking.links.get(linkId)) {
            const link = tracking.links.get(linkId)
            if (!link.clicked) {
                link.clicked = true
                link.clickedAt = new Date()
                
                if (useMongoDB) {
                    tracking.links.set(linkId, link)
                    await tracking.save()
                }
                
                console.log(`🔗 Link clicked: ${link.originalUrl} by ${tracking.recipient} (${tracking.email}) at ${link.clickedAt}`)
            }
            // Redirect to original URL
            res.redirect(link.originalUrl)
        } else if (tracking && tracking.links && tracking.links[linkId]) {
            // Fallback for in-memory Map format
            const link = tracking.links[linkId]
            if (!link.clicked) {
                link.clicked = true
                link.clickedAt = new Date()
                console.log(`🔗 Link clicked: ${link.originalUrl} by ${tracking.recipient} (${tracking.email}) at ${link.clickedAt}`)
            }
            res.redirect(link.originalUrl)
        } else {
            res.status(404).send('Link not found')
        }
    } catch (error) {
        console.error('Error tracking link click:', error.message)
        res.status(500).send('Error tracking link click')
    }
})

// Endpoint to get tracking statistics
app.get('/tracking/:trackingId', async (req, res) => {
    const { trackingId } = req.params
    
    try {
        let tracking
        if (useMongoDB) {
            tracking = await EmailTracking.findOne({ trackingId })
        } else {
            tracking = trackingData.get(trackingId)
        }
        
        if (tracking) {
            // Handle both MongoDB Map and in-memory object formats
            let linksArray = []
            if (tracking.links) {
                if (tracking.links instanceof Map) {
                    linksArray = Array.from(tracking.links.values()).map(link => ({
                        url: link.originalUrl,
                        clicked: link.clicked || false,
                        clickedAt: link.clickedAt || null
                    }))
                } else {
                    linksArray = Object.values(tracking.links).map(link => ({
                        url: link.originalUrl,
                        clicked: link.clicked || false,
                        clickedAt: link.clickedAt || null
                    }))
                }
            }
            
            res.json({
                trackingId,
                recipient: tracking.recipient,
                email: tracking.email,
                opened: tracking.opened || false,
                openedAt: tracking.openedAt || null,
                links: linksArray
            })
        } else {
            res.status(404).json({ error: 'Tracking ID not found' })
        }
    } catch (error) {
        console.error('Error fetching tracking data:', error.message)
        res.status(500).json({ error: 'Error fetching tracking data' })
    }
})

app.post('/send-emails', async (req, res) => {
    try {
        //setting up the email transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 465,
            secure: process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_SECURE === true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })
        console.log("Transporter created")
        
        // Compile the template once
        const template = Handlebars.compile(emailTemplateHTML)
        
        const results = []
        const errors = []
        const totalToSend = recruiterData.filter(r => r.toSend).length
        
        // Process each recruiter
        for (const recruiter of recruiterData) {
            if(recruiter.toSend){
                try {
                    // Generate unique tracking ID for this email
                    const trackingId = generateTrackingId()
                    const baseUrl = process.env.BASE_URL || `http://localhost:3000`
                    
                    // Extract links from the template and create tracking links
                    const links = []
                    const linkMap = {}
                    const hiringPlatformUrl = recruiter.hiringPlatform
                    
                    // Create tracking link for hiring platform
                    const linkId = 'hiringPlatform'
                    linkMap[linkId] = {
                        originalUrl: hiringPlatformUrl,
                        clicked: false,
                        clickedAt: null
                    }
                    links.push({
                        id: linkId,
                        url: `${baseUrl}/track/click/${trackingId}/${linkId}`
                    })
                    
                    // Prepare template data with tracking
                    const templateData = {
                        ...recruiter,
                        trackingPixel: `${baseUrl}/track/open/${trackingId}`,
                        hiringPlatform: `${baseUrl}/track/click/${trackingId}/${linkId}`
                    }
                    
                    // Replace placeholders dynamically - Handlebars will handle all {{key}} patterns
                    const personalizedHTML = template(templateData)
                    
                    // Store tracking data
                    const linksMap = new Map()
                    linksMap.set(linkId, {
                        linkId: linkId,
                        originalUrl: hiringPlatformUrl,
                        clicked: false,
                        clickedAt: null
                    })
                    
                    if (useMongoDB) {
                        // Store in MongoDB
                        const trackingDoc = new EmailTracking({
                            trackingId,
                            recipient: recruiter.Name,
                            email: recruiter.Email,
                            messageId: null, // Will be set after sending
                            opened: false,
                            openedAt: null,
                            links: linksMap,
                            sentAt: new Date()
                        })
                        await trackingDoc.save()
                    } else {
                        // Store in memory
                        trackingData.set(trackingId, {
                            recipient: recruiter.Name,
                            email: recruiter.Email,
                            messageId: null, // Will be set after sending
                            opened: false,
                            openedAt: null,
                            links: linkMap,
                            sentAt: new Date().toISOString()
                        })
                    }
                    
                    // Send email
                    const info = await transporter.sendMail({
                        from: `"Pranay Jain" <${process.env.EMAIL_USER}>`,
                        to: recruiter.Email,
                        subject: `Referral Application for ${recruiter["Job Role"]} position at ${recruiter["Company Name"]}`,
                        html: personalizedHTML
                    })
                    
                    // Update tracking data with messageId
                    if (useMongoDB) {
                        await EmailTracking.findOneAndUpdate(
                            { trackingId },
                            { messageId: info.messageId }
                        )
                    } else {
                        const tracking = trackingData.get(trackingId)
                        if (tracking) {
                            tracking.messageId = info.messageId
                        }
                    }
                    
                    results.push({
                        recipient: recruiter.Name,
                        email: recruiter.Email,
                        messageId: info.messageId,
                        trackingId: trackingId,
                        status: 'sent'
                    })
                    
                    console.log(`Email sent successfully to ${recruiter.Name} (Tracking ID: ${trackingId})`)
                    console.log(`   Tracking pixel URL: ${baseUrl}/track/open/${trackingId}`)
                } catch (error) {
                    errors.push({
                        recipient: recruiter.Name,
                        email: recruiter.Email,
                        error: error.message
                    })
                    console.error(`Error sending to ${recruiter.Name}:`, error.message)
                }
            }
        }
        
        // Log summary statistics
        console.log('\n========== Email Sending Summary ==========')
        console.log(`Total recipients: ${recruiterData.length}`)
        console.log(`To send: ${totalToSend}`)
        console.log(`Successfully sent: ${results.length}`)
        console.log(`Failed: ${errors.length}`)
        console.log('==========================================\n')
        
        res.json({
            success: true,
            total: totalToSend,
            sent: results.length,
            failed: errors.length,
            results,
            errors: errors.length > 0 ? errors : undefined
        })
    } catch (error) {
        console.error('Error processing emails:', error)
        res.status(500).json({
            error: 'Failed to process emails',
            message: error.message
        })
    }
})

// Start server after all routes are defined
app.listen(3000, () => {
    console.log("Server is running on port 3000")
})

