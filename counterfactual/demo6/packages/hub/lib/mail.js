const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

async function sendMail(fields) {
  const msg = {
    to: fields.to || 'alice@example.com',
    from: fields.from || 'no-reply@example.com',
    subject: fields.subject || 'Test email',
    text: fields.text || 'This is a test email',
    html: fields.html || 'This is a test email',
  }

  return sgMail.send(msg)
}

module.exports = {
  sendMail
}
