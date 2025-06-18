import nodemailer from 'nodemailer';

export interface EmailService {
  sendQueueConfirmation(to: string, data: {
    name: string;
    restaurant: string;
    position: number;
    eta: string;
    partySize: number;
  }): Promise<void>;
  
  sendStatusUpdate(to: string, data: {
    name: string;
    restaurant: string;
    status: string;
    position?: number;
    eta?: string;
  }): Promise<void>;
}

class NodemailerService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'tableq.notifications@gmail.com',
        pass: process.env.SMTP_PASS || 'defaultpassword',
      },
    });
  }

  async sendQueueConfirmation(to: string, data: {
    name: string;
    restaurant: string;
    position: number;
    eta: string;
    partySize: number;
  }): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER || 'tableq.notifications@gmail.com',
      to,
      subject: `TableQ: You're in line at ${data.restaurant}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FF6B35; color: white; padding: 20px; text-align: center;">
            <h1>🍽️ TableQ</h1>
            <h2>You're in the queue!</h2>
          </div>
          
          <div style="padding: 20px;">
            <p>Hi ${data.name},</p>
            
            <p>Great news! You've successfully joined the queue at <strong>${data.restaurant}</strong>.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2C3E50; margin-top: 0;">Queue Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Restaurant:</strong> ${data.restaurant}</li>
                <li><strong>Party Size:</strong> ${data.partySize} people</li>
                <li><strong>Position in Queue:</strong> #${data.position}</li>
                <li><strong>Estimated Wait Time:</strong> ${data.eta}</li>
              </ul>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>We'll send you updates as your turn approaches</li>
              <li>Please arrive 5 minutes before your estimated time</li>
              <li>Keep your phone handy for notifications</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background-color: #27AE60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Check Status</a>
            </div>
          </div>
          
          <div style="background-color: #2C3E50; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0;">TableQ - Skip the Wait, Enjoy Your Meal</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Queue confirmation email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send queue confirmation email:', error);
    }
  }

  async sendStatusUpdate(to: string, data: {
    name: string;
    restaurant: string;
    status: string;
    position?: number;
    eta?: string;
  }): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER || 'tableq.notifications@gmail.com',
      to,
      subject: `TableQ: Queue update for ${data.restaurant}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FF6B35; color: white; padding: 20px; text-align: center;">
            <h1>🍽️ TableQ</h1>
            <h2>Queue Status Update</h2>
          </div>
          
          <div style="padding: 20px;">
            <p>Hi ${data.name},</p>
            
            <p>Your queue status at <strong>${data.restaurant}</strong> has been updated:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="color: #2C3E50; margin-top: 0;">Status: ${data.status}</h3>
              ${data.position ? `<p><strong>Position:</strong> #${data.position}</p>` : ''}
              ${data.eta ? `<p><strong>Estimated Time:</strong> ${data.eta}</p>` : ''}
            </div>
            
            ${data.status === 'Ready' ? `
              <div style="background-color: #27AE60; color: white; padding: 15px; border-radius: 8px; text-align: center;">
                <h3 style="margin-top: 0;">🎉 Your table is ready!</h3>
                <p>Please head to the restaurant now.</p>
              </div>
            ` : ''}
          </div>
          
          <div style="background-color: #2C3E50; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0;">TableQ - Skip the Wait, Enjoy Your Meal</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Status update email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send status update email:', error);
    }
  }
}

export const emailService = new NodemailerService();
