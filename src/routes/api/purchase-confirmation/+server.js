import {json} from "@sveltejs/kit";
import sgMail from "@sendgrid/mail";
import {SENDGRID_API_KEY, SENDGRID_SENDER, STRIPE_WEBHOOK_SECRET, STRIPE_API_KEY} from "$env/static/private";
import Stripe from "stripe";

const stripe = new Stripe(STRIPE_API_KEY);

sgMail.setApiKey(SENDGRID_API_KEY);
const attachment = 'https://narrify-public.s3.eu-central-1.amazonaws.com/sample.pdf';

export async function POST({request}) {
    try {
        console.log('test endpoint reached');
        const body = await request.text(); // Get the raw body
        const signature = request.headers.get("stripe-signature") || "";
        const stripeEvent = stripe.webhooks.constructEvent(
            body,
            signature,
            STRIPE_WEBHOOK_SECRET
        );
        const attachmentResponse = await fetch(attachment);
        const pdfBuffer = await attachmentResponse.arrayBuffer();
        const base64Attachment = Buffer.from(pdfBuffer).toString('base64');
        // const requestBody = await request.json();
        // const customerEmail = requestBody.data.object.customer_details.email;
        // const customerName = requestBody.data.object.customer_details.name;
        const customerEmail = stripeEvent.data.object.customer_details.email;
        const customerName = stripeEvent.data.object.customer_details.name;

        const message = {
            to: customerEmail,
            from: SENDGRID_SENDER,
            subject: 'Purchase Confirmation',
            attachments: [{
                content: base64Attachment,
                filename: 'digital eBook - Spain relocation.pdf',
                type: 'application/pdf',
                disposition: 'attachment',
            }],
            text: `Dear ${customerName},\n\nThank you for your purchase! We appreciate your business and hope you enjoy your new item.\n\nBest regards,\nThe eBook store Team`,
        }
        await sgMail.send(message);
        console.log('email sent successfully');

        return json({response: 'email sent successfully'});
    } catch (error) {
        console.log('email not sent successfully', JSON.stringify(error));

        return json({error: error.message}, {status: 500});
    }

}