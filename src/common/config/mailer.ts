import nodemailer from 'nodemailer';

const Mailer = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD,
    },
});

export default Mailer;
