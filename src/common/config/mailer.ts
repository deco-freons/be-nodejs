import nodemailer from 'nodemailer';

const Mailer = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: 'deco-freons@outlook.com',
        pass: 'naTrah-bopqeb-9bijxo',
    },
});

export default Mailer;
