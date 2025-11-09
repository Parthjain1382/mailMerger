
export const emailTemplateHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Application</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 5px;">
        <p style="margin: 0 0 15px 0;">Dear {{Name}},</p>
        
        <p style="margin: 0 0 15px 0;">
            I hope you're doing well. I recently came across an exciting <strong>{{[Job Role]}}</strong> opportunity at <strong>{{[Company Name]}}</strong> through {{hiringPlatform}}, and I wanted to reach out to apply for this opportunity.
        </p>
        
        <h2 style="color: #2c3e50; margin: 25px 0 15px 0; font-size: 20px;">About Me:</h2>
        
        <p style="margin: 0 0 20px 0;">
            I am Pranay Jain, a B.E. in Information Technology graduate with 1 year and 2 months of experience as a Full Stack Developer at Innovapptive Inc. I specialize in building scalable, high-performance applications.
        </p>
        
        <h2 style="color: #2c3e50; margin: 25px 0 15px 0; font-size: 20px;">Recent Achievements:</h2>
        
        <ul style="margin: 0 0 20px 0; padding-left: 20px;">
            <li style="margin-bottom: 12px;">
                <strong>ERP Migration & Platform Modernization:</strong> Led the backend transition of a legacy SAP-integrated system into a scalable, ERP-agnostic architecture using Node.js, Express.js, and MongoDB, improving system interoperability and data accessibility by 60%.
            </li>
            
            <li style="margin-bottom: 12px;">
                <strong>Microservices Architecture:</strong> Designed and implemented robust RESTful APIs within a microservices ecosystem, applying OOP principles, SOLID design, and patterns such as Factory and Singleton to reduce API response times by 30% and improve maintainability.
            </li>
            
            <li style="margin-bottom: 12px;">
                <strong>Database Design & Optimization:</strong> Engineered performant data models across MongoDB, using advanced indexing and query tuning to increase efficiency by 10%. Integrated Kafka for real-time data streaming in distributed workflows.
            </li>
            
            <li style="margin-bottom: 12px;">
                <strong>Cloud Infrastructure & Reliability:</strong> Optimized backend systems with AWS services (S3 for storage, CloudFront for CDN), and incorporated Sentry for real-time monitoring and alerting, improving system reliability and observability.
            </li>
            
            <li style="margin-bottom: 12px;">
                <strong>DevOps & CI/CD:</strong> Built and maintained CI/CD pipelines using Git, automating testing and deployments. Followed Test-Driven Development (TDD) and collaborated in Agile teams to ensure delivery of reliable, production-ready code.
            </li>
            
            <li style="margin-bottom: 12px;">
                <strong>Feature Engineering:</strong> Developed core backend services including a multi-language Localization Module and analytics support for operational dashboards, integrating deeply with frontend teams through well-defined APIs and data contracts.
            </li>
        </ul>
        
        <p style="margin: 0 0 20px 0;">
            I would truly appreciate it if you could take a moment to review my resume and share any insights on this opportunity. I would be incredibly grateful to join your prestigious organization.
        </p>
        
        <p style="margin: 0 0 20px 0;">
            <strong>Job Posting:</strong> <a href="{{hiringPlatform}}" style="color: #3498db; text-decoration: none;">{{hiringPlatform}}</a>
        </p>
        
        <p style="margin: 0 0 10px 0;">
            Looking forward to your response. Thank you for your time and consideration!
        </p>
        
        <p style="margin: 20px 0 0 0;">
            Best regards,<br>
            <strong>Pranay Jain</strong>
        </p>
    </div>
    <!-- Email tracking pixel (1x1 transparent image) -->
    <img src="{{trackingPixel}}" width="1" height="1" style="display:block;width:1px;height:1px;border:0;margin:0;padding:0;" alt="" />
</body>
</html>`

