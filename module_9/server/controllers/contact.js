const validator = require('validator');

class ContactController {
  // Handle contact form submission
  static async submitContact(req, res) {
    try {
      const { name, email, subject, message } = req.body;

      // Validation
      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required: name, email, subject, and message'
        });
      }

      // Validate email format
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Validate field lengths
      if (!validator.isLength(name, { min: 2, max: 50 })) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 2 and 50 characters'
        });
      }

      if (!validator.isLength(subject, { min: 5, max: 100 })) {
        return res.status(400).json({
          success: false,
          message: 'Subject must be between 5 and 100 characters'
        });
      }

      if (!validator.isLength(message, { min: 10, max: 1000 })) {
        return res.status(400).json({
          success: false,
          message: 'Message must be between 10 and 1000 characters'
        });
      }

      // In a real application, you would save this to a database
      // or send an email. For now, we'll just log it and return success.
      console.log('Contact form submission:', {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.'
      });

    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.'
      });
    }
  }

  // Get contact information (for display purposes)
  static async getContactInfo(req, res) {
    try {
      const contactInfo = {
        email: 'contact@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street, City, State 12345',
        hours: 'Monday - Friday: 9:00 AM - 5:00 PM'
      };

      res.status(200).json({
        success: true,
        data: contactInfo
      });

    } catch (error) {
      console.error('Get contact info error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = ContactController;